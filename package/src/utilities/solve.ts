import { Abs } from "../Abs";
import { Add } from "../Add";
import type { Expr } from "../Expr";
import { Log } from "../Log";
import { Mul } from "../Mul";
import { Neg } from "../Neg";
import { Num } from "../Num";
import { Pow } from "../Pow";
import { Rational } from "../Rational";
import { Sym } from "../Sym";

/** Returns true if the expression tree contains the given symbol anywhere. */
function containsSym(expr: Expr, sym: Sym): boolean {
	if (expr === sym) return true;
	if (expr instanceof Num || expr instanceof Rational) return false;
	if (expr instanceof Add || expr instanceof Mul)
		return containsSym(expr.left, sym) || containsSym(expr.right, sym);
	if (expr instanceof Pow)
		return containsSym(expr.base, sym) || containsSym(expr.exponent, sym);
	if (expr instanceof Neg || expr instanceof Log || expr instanceof Abs)
		return containsSym(expr.inner, sym);
	return false;
}

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
		if (!containsSym(expr, sym)) return [new Num(0), expr];
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

	// Any other node (Pow, Log, Abs, constants) with no sym — treat as constant
	if (!containsSym(expr, sym)) return [new Num(0), expr];
	return null;
}

/**
 * Solves `expr = 0` for the given symbol, returning a list of solutions.
 *
 * Currently handles linear equations exactly (returning Rational when possible).
 * Returns an empty array if the equation is not linear or has no solution.
 *
 * @example
 * solve(2*x + 4, x)       // [Num(-2)]
 * solve(3*x - 1, x)       // [Rational(1, 3)]
 * solve(x + y, x)         // [Neg(y) → Mul(-1, y)]
 */
export function solve(expr: Expr, sym: Sym): Expr[] {
	const simplified = expr.simplify();
	const lc = linearCoeffs(simplified, sym);
	if (!lc) return [];

	const [a, b] = lc;
	const aSimp = a.simplify();

	// Degenerate: no sym in expression
	if (aSimp instanceof Num && aSimp.value === 0) return [];

	// x = -b / a
	const solution = new Mul(new Neg(b), new Pow(aSimp, new Num(-1))).simplify();
	return [solution];
}
