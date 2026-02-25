import { PiConstant } from "../constants/Pi";
import { Mul } from "../core/Mul";
import { Neg } from "../core/Neg";
import { Num } from "../core/Num";
import { Rational } from "../core/Rational";
import type { Expr } from "../Expr";

/**
 * If `expr` equals (numerator/denominator) * π, returns [numerator, denominator].
 * Returns null if `expr` is not a Pi multiple.
 * Checks both left-Pi and right-Pi orderings since Mul.simplify() may not canonicalize.
 */
export function piCoeff(expr: Expr): [bigint, bigint] | null {
	if (expr instanceof PiConstant) return [1n, 1n];
	if (!(expr instanceof Mul)) return null;
	const { left: l, right: r } = expr;
	if (l instanceof PiConstant && r instanceof Rational)
		return [r.numerator, r.denominator];
	if (r instanceof PiConstant && l instanceof Rational)
		return [l.numerator, l.denominator];
	if (l instanceof PiConstant && r instanceof Num && Number.isInteger(r.value))
		return [BigInt(r.value), 1n];
	if (r instanceof PiConstant && l instanceof Num && Number.isInteger(l.value))
		return [BigInt(l.value), 1n];
	return null;
}

/** Returns true if `expr` represents a negated value (Neg node or Mul with negative numeric left). */
export function isNegated(expr: Expr): boolean {
	if (expr instanceof Neg) return true;
	if (expr instanceof Mul) {
		if (expr.left instanceof Num && expr.left.value < 0) return true;
		if (expr.left instanceof Rational && expr.left.numerator < 0n) return true;
	}
	return false;
}

/** Returns `expr` with its outer negation stripped. */
export function stripNeg(expr: Expr): Expr {
	if (expr instanceof Neg) return expr.inner;
	if (expr instanceof Mul) {
		if (expr.left instanceof Num)
			return new Mul(new Num(-expr.left.value), expr.right);
		if (expr.left instanceof Rational)
			return new Mul(expr.left.neg(), expr.right);
	}
	return new Neg(expr); // fallback: double-negate to cancel
}
