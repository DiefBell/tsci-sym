import { Abs } from "../Abs";
import { Add } from "../Add";
import { EulerNumber } from "../constants/E";
import { PiConstant } from "../constants/Pi";
import type { Expr } from "../Expr";
import { Log } from "../Log";
import { Mul } from "../Mul";
import { Neg } from "../Neg";
import { Num } from "../Num";
import { Pow } from "../Pow";
import { Rational } from "../Rational";
import { Sym } from "../Sym";
import { Acos } from "../trig/Acos";
import { Asin } from "../trig/Asin";
import { Atan } from "../trig/Atan";
import { Cos } from "../trig/Cos";
import { Sin } from "../trig/Sin";
import { Tan } from "../trig/Tan";

export function isNumericCoeff(e: Expr): e is Num | Rational {
	return e instanceof Num || e instanceof Rational;
}

/** Returns true if `expr` contains `sym` anywhere in its tree. */
export function containsSym(expr: Expr, sym: Sym): boolean {
	if (expr === sym) return true;
	if (
		expr instanceof Num ||
		expr instanceof Rational ||
		expr instanceof EulerNumber ||
		expr instanceof PiConstant
	)
		return false;
	if (expr instanceof Sym) return false;
	if (expr instanceof Add || expr instanceof Mul)
		return containsSym(expr.left, sym) || containsSym(expr.right, sym);
	if (expr instanceof Pow)
		return containsSym(expr.base, sym) || containsSym(expr.exponent, sym);
	if (expr instanceof Neg || expr instanceof Log || expr instanceof Abs)
		return containsSym(expr.inner, sym);
	if (expr instanceof Sin || expr instanceof Cos || expr instanceof Tan)
		return containsSym(expr.inner, sym);
	if (expr instanceof Asin || expr instanceof Acos || expr instanceof Atan)
		return containsSym(expr.inner, sym);
	return false;
}

/** Structurally substitutes all occurrences of `from` with `to` in `expr`. */
export function substitute(expr: Expr, from: Expr, to: Expr): Expr {
	if (expr.key() === from.key()) return to;
	if (expr instanceof Add)
		return new Add(
			substitute(expr.left, from, to),
			substitute(expr.right, from, to),
		);
	if (expr instanceof Mul)
		return new Mul(
			substitute(expr.left, from, to),
			substitute(expr.right, from, to),
		);
	if (expr instanceof Pow)
		return new Pow(
			substitute(expr.base, from, to),
			substitute(expr.exponent, from, to),
		);
	if (expr instanceof Neg) return new Neg(substitute(expr.inner, from, to));
	if (expr instanceof Log) return new Log(substitute(expr.inner, from, to));
	if (expr instanceof Abs) return new Abs(substitute(expr.inner, from, to));
	if (expr instanceof Sin) return new Sin(substitute(expr.inner, from, to));
	if (expr instanceof Cos) return new Cos(substitute(expr.inner, from, to));
	if (expr instanceof Tan) return new Tan(substitute(expr.inner, from, to));
	if (expr instanceof Asin) return new Asin(substitute(expr.inner, from, to));
	if (expr instanceof Acos) return new Acos(substitute(expr.inner, from, to));
	if (expr instanceof Atan) return new Atan(substitute(expr.inner, from, to));
	return expr;
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

/**
 * Collects subexpressions that are candidate substitution targets for u-substitution:
 * composite nodes (Pow, Log, Abs) and their inner arguments, filtered to those
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
		if (e instanceof Pow) {
			addCandidate(e);
			addCandidate(e.base);
			addCandidate(e.exponent);
			visit(e.base);
			visit(e.exponent);
		} else if (e instanceof Log || e instanceof Abs) {
			addCandidate(e);
			addCandidate(e.inner);
			visit(e.inner);
		} else if (
			e instanceof Sin ||
			e instanceof Cos ||
			e instanceof Tan ||
			e instanceof Asin ||
			e instanceof Acos ||
			e instanceof Atan
		) {
			addCandidate(e);
			addCandidate(e.inner);
			visit(e.inner);
		} else if (e instanceof Mul || e instanceof Add) {
			visit(e.left);
			visit(e.right);
		} else if (e instanceof Neg) {
			visit(e.inner);
		}
	}

	visit(expr);
	return result;
}
