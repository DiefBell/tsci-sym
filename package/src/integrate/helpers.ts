import { Abs } from "../functions/Abs";
import type { Expr } from "../Expr";
import { Log } from "../functions/Log";
import { Mul } from "../core/Mul";
import { Num } from "../core/Num";
import { Pow } from "../core/Pow";
import { Rational } from "../core/Rational";
import type { Sym } from "../core/Sym";
import { Acos } from "../functions/Acos";
import { Asin } from "../functions/Asin";
import { Atan } from "../functions/Atan";
import { Cos } from "../functions/Cos";
import { Sin } from "../functions/Sin";
import { Tan } from "../functions/Tan";

export function isNumericCoeff(e: Expr): e is Num | Rational {
	return e instanceof Num || e instanceof Rational;
}

/** Returns true if `expr` contains `sym` anywhere in its tree. */
export function containsSym(expr: Expr, sym: Sym): boolean {
	if (expr === sym) return true;
	return expr.args.some((child) => containsSym(child, sym));
}

/** Structurally substitutes all occurrences of `from` with `to` in `expr`. */
export function substitute(expr: Expr, from: Expr, to: Expr): Expr {
	if (expr.key() === from.key()) return to;
	return expr.map((child) => substitute(child, from, to));
}

/**
 * Tries to write `expr = factor * rest`, returning `rest` or `null`.
 * Works structurally over Mul trees; does not perform algebraic division.
 */
export function tryExtract(expr: Expr, factor: Expr): Expr | null {
	if (expr.key() === factor.key()) return new Num(1);
	if (!(expr instanceof Mul)) return null;

	// Direct match on either child
	if (expr.left.key() === factor.key()) return expr.right;
	if (expr.right.key() === factor.key()) return expr.left;

	// Recurse into left subtree
	const fromLeft = tryExtract(expr.left, factor);
	if (fromLeft !== null) return new Mul(fromLeft, expr.right).simplify();

	// Recurse into right subtree
	const fromRight = tryExtract(expr.right, factor);
	if (fromRight !== null) return new Mul(expr.left, fromRight).simplify();

	// If factor is itself a Mul, try extracting its halves sequentially
	if (factor instanceof Mul) {
		const afterLeft = tryExtract(expr, factor.left);
		if (afterLeft !== null) {
			const afterRight = tryExtract(afterLeft, factor.right);
			if (afterRight !== null) return afterRight;
		}
	}

	return null;
}

/** Composite (non-arithmetic) nodes that are candidates for u-substitution. */
function isComposite(e: Expr): boolean {
	return (
		e instanceof Pow ||
		e instanceof Log ||
		e instanceof Abs ||
		e instanceof Sin ||
		e instanceof Cos ||
		e instanceof Tan ||
		e instanceof Asin ||
		e instanceof Acos ||
		e instanceof Atan
	);
}

/**
 * Collects subexpressions that are candidate substitution targets for u-substitution:
 * composite nodes (Pow, Log, Abs, trig) and their child arguments, filtered to those
 * that contain `sym` but are not simply `sym` itself.
 */
export function innerComposites(expr: Expr, sym: Sym): Expr[] {
	const seen = new Set<string>();
	const result: Expr[] = [];

	function addCandidate(e: Expr) {
		const k = e.key();
		if (!seen.has(k) && containsSym(e, sym) && k !== sym.key()) {
			seen.add(k);
			result.push(e);
		}
	}

	function visit(e: Expr) {
		if (isComposite(e)) {
			addCandidate(e);
			for (const child of e.args) addCandidate(child);
		}
		for (const child of e.args) visit(child);
	}

	visit(expr);
	return result;
}
