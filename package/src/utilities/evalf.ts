import { EulerNumber } from "../constants/E";
import { ImaginaryUnit } from "../constants/I";
import { PiConstant } from "../constants/Pi";
import { Add } from "../core/Add";
import { Mul } from "../core/Mul";
import { Neg } from "../core/Neg";
import { Num } from "../core/Num";
import { Pow } from "../core/Pow";
import { Rational } from "../core/Rational";
import { Sym } from "../core/Sym";
import type { Expr } from "../Expr";
import { Abs } from "../functions/Abs";
import { Acos } from "../functions/Acos";
import { Asin } from "../functions/Asin";
import { Atan } from "../functions/Atan";
import { Cos } from "../functions/Cos";
import { Log } from "../functions/Log";
import { Sin } from "../functions/Sin";
import { Tan } from "../functions/Tan";
import { subs } from "./subs";

/**
 * Recursively evaluates a (post-simplification) expression to a JS number.
 * Throws if it encounters an unbound symbol or the imaginary unit.
 */
function evalNode(expr: Expr): number {
	if (expr instanceof Num) return expr.value;
	if (expr instanceof Rational)
		return Number(expr.numerator) / Number(expr.denominator);
	if (expr instanceof PiConstant) return Math.PI;
	if (expr instanceof EulerNumber) return Math.E;
	if (expr instanceof ImaginaryUnit)
		throw new Error("Cannot evaluate imaginary unit to a real number");
	if (expr instanceof Sym) throw new Error(`Unbound symbol: ${expr.name}`);

	if (expr instanceof Add) return evalNode(expr.left) + evalNode(expr.right);
	if (expr instanceof Mul) return evalNode(expr.left) * evalNode(expr.right);
	if (expr instanceof Neg) return -evalNode(expr.inner);
	if (expr instanceof Pow)
		return evalNode(expr.base) ** evalNode(expr.exponent);
	if (expr instanceof Sin) return Math.sin(evalNode(expr.inner));
	if (expr instanceof Cos) return Math.cos(evalNode(expr.inner));
	if (expr instanceof Tan) return Math.tan(evalNode(expr.inner));
	if (expr instanceof Asin) return Math.asin(evalNode(expr.inner));
	if (expr instanceof Acos) return Math.acos(evalNode(expr.inner));
	if (expr instanceof Atan) return Math.atan(evalNode(expr.inner));
	if (expr instanceof Log) return Math.log(evalNode(expr.inner));
	if (expr instanceof Abs) return Math.abs(evalNode(expr.inner));

	throw new Error(`Cannot evaluate expression numerically: ${expr}`);
}

/**
 * Numerically evaluates `expr`, substituting any provided symbol values.
 *
 * The constants Pi and E are evaluated to their floating-point approximations.
 * Simplification is applied after substitution, so exact forms like `sin(π)`
 * collapse to their known values before the numeric walk.
 *
 * @param expr - The expression to evaluate.
 * @param values - Symbol-to-number substitutions (defaults to empty Map).
 * @returns The numeric value of the expression.
 * @throws If the expression contains an unbound symbol or the imaginary unit.
 *
 * @example
 * const x = new Sym("x");
 * evalf(new Add(new Pow(x, new Num(2)), new Num(1)), new Map([[x, 3]]))  // 10
 * evalf(Sin(Pi))                                                          // 0
 * evalf(new Add(Pi, E))                                                   // 5.859...
 */
export function evalf(
	expr: Expr,
	values: Map<Sym, number> = new Map(),
): number {
	let simplified: Expr;
	if (values.size > 0) {
		const numSubs = new Map<Sym, Expr>();
		for (const [sym, val] of values) numSubs.set(sym, new Num(val));
		simplified = subs(expr, numSubs);
	} else {
		simplified = expr.simplify();
	}
	return evalNode(simplified);
}
