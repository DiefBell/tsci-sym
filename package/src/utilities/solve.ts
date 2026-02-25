import { Add } from "../core/Add";
import { Mul } from "../core/Mul";
import { Neg } from "../core/Neg";
import { Num } from "../core/Num";
import { Pow } from "../core/Pow";
import { Rational } from "../core/Rational";
import { Sym } from "../core/Sym";
import type { Expr } from "../Expr";

/**
 * Extracts [a, b] such that expr = a*sym + b, where a and b do not contain sym.
 * Returns null if expr is not linear in sym.
 */
function linearCoeffs(expr: Expr, sym: Sym): [Expr, Expr] | null {
	if (expr instanceof Num || expr instanceof Rational)
		return [new Num(0), expr];

	if (expr instanceof Sym)
		return expr === sym ? [new Num(1), new Num(0)] : [new Num(0), expr];

	if (expr instanceof Mul) {
		// coeff * sym  or  sym * coeff
		if (expr.right === sym) return [expr.left, new Num(0)];
		if (expr.left === sym) return [expr.right, new Num(0)];
		// no sym present — treat as constant
		if (!expr.freeSymbols().has(sym)) return [new Num(0), expr];
		// sym appears but not in linear position (e.g. x*x, x*f(x))
		return null;
	}

	if (expr instanceof Add) {
		const lc = linearCoeffs(expr.left, sym);
		const rc = linearCoeffs(expr.right, sym);
		if (!lc || !rc) return null;
		return [new Add(lc[0], rc[0]).simplify(), new Add(lc[1], rc[1]).simplify()];
	}

	if (expr instanceof Neg) {
		const ic = linearCoeffs(expr.inner, sym);
		if (!ic) return null;
		return [new Neg(ic[0]).simplify(), new Neg(ic[1]).simplify()];
	}

	// Any other node (Pow, Log, Abs, trig, etc.) — treat as constant if sym-free
	if (!expr.freeSymbols().has(sym)) return [new Num(0), expr];
	return null;
}

/**
 * If `term` is of the form k * sym^2 (or sym^2 alone), returns the coefficient k.
 * Returns null if term is not a sym-squared term.
 */
function quadraticTermCoeff(term: Expr, sym: Sym): Expr | null {
	// sym^2
	if (
		term instanceof Pow &&
		term.base === sym &&
		term.exponent instanceof Num &&
		term.exponent.value === 2
	)
		return new Num(1);

	// coeff * sym^2  or  sym^2 * coeff  (post-simplification canonical form)
	if (term instanceof Mul) {
		const { left: l, right: r } = term;
		if (
			r instanceof Pow &&
			r.base === sym &&
			r.exponent instanceof Num &&
			r.exponent.value === 2 &&
			!l.freeSymbols().has(sym)
		)
			return l;
		if (
			l instanceof Pow &&
			l.base === sym &&
			l.exponent instanceof Num &&
			l.exponent.value === 2 &&
			!r.freeSymbols().has(sym)
		)
			return r;
	}

	return null;
}

/**
 * Extracts [a, b, c] such that expr = a*sym^2 + b*sym + c,
 * where a, b, c do not contain sym and a ≠ 0.
 * Returns null if expr is not purely quadratic in sym.
 */
function quadraticCoeffs(expr: Expr, sym: Sym): [Expr, Expr, Expr] | null {
	const terms: Expr[] = [];
	function collectTerms(e: Expr): void {
		if (e instanceof Add) {
			collectTerms(e.left);
			collectTerms(e.right);
		} else {
			terms.push(e);
		}
	}
	collectTerms(expr);

	let a: Expr = new Num(0);
	let b: Expr = new Num(0);
	let c: Expr = new Num(0);
	let hasQuadratic = false;

	for (const term of terms) {
		const qCoeff = quadraticTermCoeff(term, sym);
		if (qCoeff !== null) {
			a = new Add(a, qCoeff).simplify();
			hasQuadratic = true;
			continue;
		}
		const lc = linearCoeffs(term, sym);
		if (lc !== null) {
			b = new Add(b, lc[0]).simplify();
			c = new Add(c, lc[1]).simplify();
			continue;
		}
		// term contains sym in a non-polynomial way (e.g. sin(x), x^3)
		return null;
	}

	if (!hasQuadratic) return null;
	return [a, b, c];
}

/**
 * Solves `expr = 0` for the given symbol, returning a list of solutions.
 *
 * Handles linear equations exactly (returning Rational when possible),
 * and quadratic equations via the quadratic formula.
 * Returns an empty array if no supported form is detected.
 *
 * @example
 * solve(2*x + 4, x)           // [Num(-2)]
 * solve(3*x - 1, x)           // [Rational(1, 3)]
 * solve(x + y, x)             // [Mul(-1, y)]
 * solve(x^2 - 4, x)           // [Num(2), Num(-2)]
 * solve(x^2 + 2*x + 1, x)     // [Num(-1)]  (double root)
 */
export function solve(expr: Expr, sym: Sym): Expr[] {
	const simplified = expr.simplify();

	const lc = linearCoeffs(simplified, sym);
	if (lc) {
		const [a, b] = lc;
		const aSimp = a.simplify();

		// Degenerate: no sym in expression
		if (aSimp instanceof Num && aSimp.value === 0) return [];

		// x = -b / a
		const solution = new Mul(
			new Neg(b),
			new Pow(aSimp, new Num(-1)),
		).simplify();
		return [solution];
	}

	const qc = quadraticCoeffs(simplified, sym);
	if (qc) {
		const [a, b, c] = qc;
		const twoA = new Mul(new Num(2), a).simplify();
		const discriminant = new Add(
			new Pow(b, new Num(2)),
			new Neg(new Mul(new Mul(new Num(4), a), c)),
		).simplify();
		const sqrtDisc = new Pow(discriminant, new Rational(1, 2)).simplify();
		const negB = new Neg(b).simplify();
		const inv2A = new Pow(twoA, new Num(-1)).simplify();
		const sol1 = new Mul(new Add(negB, sqrtDisc), inv2A).simplify();
		const sol2 = new Mul(new Add(negB, new Neg(sqrtDisc)), inv2A).simplify();
		return sol1.key() === sol2.key() ? [sol1] : [sol1, sol2];
	}

	return [];
}
