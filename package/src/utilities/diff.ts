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

/**
 * Symbolically differentiates `expr` with respect to `sym`.
 *
 * Rules applied per node type:
 *   Sym/Num/Rational/constants — identity / zero rule
 *   Neg  — d/dx(-f)     = -f'
 *   Add  — d/dx(f+g)    = f' + g'                    (sum rule)
 *   Mul  — d/dx(f·g)    = f'·g + f·g'                (product rule)
 *   Pow  — d/dx(f^n)    = n·f^(n-1)·f'               (constant exponent)
 *          d/dx(f^g)    = g·f^(g-1)·f' + f^g·g'·ln(f) (general)
 *   Log  — d/dx(ln f)   = f'/f                        (chain rule)
 *   Abs  — d/dx(|f|)    = (f/|f|)·f'
 */
export function diff(expr: Expr, sym: Sym): Expr {
	// --- atoms ---

	if (expr instanceof Sym) {
		return new Num(expr === sym ? 1 : 0);
	}

	if (
		expr instanceof Num ||
		expr instanceof Rational ||
		expr instanceof EulerNumber ||
		expr instanceof PiConstant
	) {
		return new Num(0);
	}

	// --- Neg: d/dx(-f) = -f' ---

	if (expr instanceof Neg) {
		return new Neg(diff(expr.inner, sym)).simplify();
	}

	// --- Add: sum rule ---

	if (expr instanceof Add) {
		return new Add(diff(expr.left, sym), diff(expr.right, sym)).simplify();
	}

	// --- Mul: product rule ---

	if (expr instanceof Mul) {
		const dl = diff(expr.left, sym);
		const dr = diff(expr.right, sym);
		return new Add(new Mul(dl, expr.right), new Mul(expr.left, dr)).simplify();
	}

	// --- Pow: power / exponential / general rule ---

	if (expr instanceof Pow) {
		const { base, exponent } = expr;
		const dBase = diff(base, sym);
		const dExp = diff(exponent, sym);

		const expIsConst = dExp instanceof Num && dExp.value === 0;
		const baseIsConst = dBase instanceof Num && dBase.value === 0;

		if (expIsConst && baseIsConst) return new Num(0);

		if (expIsConst) {
			// Power rule: exponent · base^(exponent−1) · base'
			const newExp = new Add(exponent, new Num(-1)).simplify();
			return new Mul(
				new Mul(exponent, new Pow(base, newExp)),
				dBase,
			).simplify();
		}

		if (baseIsConst) {
			// Exponential rule: base^exponent · ln(base) · exponent'
			return new Mul(new Mul(expr, new Log(base)), dExp).simplify();
		}

		// General: base^exponent · (exponent' · ln(base) + exponent · base'/base)
		return new Mul(
			expr,
			new Add(
				new Mul(dExp, new Log(base)),
				new Mul(dBase, new Mul(exponent, new Pow(base, new Num(-1)))),
			),
		).simplify();
	}

	// --- Log: chain rule d/dx[ln(f)] = f'/f ---

	if (expr instanceof Log) {
		const df = diff(expr.inner, sym);
		return new Mul(df, new Pow(expr.inner, new Num(-1))).simplify();
	}

	// --- Abs: d/dx|f| = (f / |f|) · f' ---

	if (expr instanceof Abs) {
		const df = diff(expr.inner, sym);
		return new Mul(
			new Mul(expr.inner, new Pow(expr, new Num(-1))),
			df,
		).simplify();
	}

	throw new Error(
		`diff: unsupported expression type "${expr.constructor.name}"`,
	);
}
