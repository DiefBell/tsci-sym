import { Abs } from "../functions/Abs";
import { Add } from "../core/Add";
import { EulerNumber } from "../constants/E";
import { PiConstant } from "../constants/Pi";
import type { Expr } from "../Expr";
import { Log } from "../functions/Log";
import { Mul } from "../core/Mul";
import { Neg } from "../core/Neg";
import { Num } from "../core/Num";
import { Pow } from "../core/Pow";
import { Rational } from "../core/Rational";
import { Sym } from "../core/Sym";
import { Acos } from "../functions/Acos";
import { Asin } from "../functions/Asin";
import { Atan } from "../functions/Atan";
import { Cos } from "../functions/Cos";
import { Sin } from "../functions/Sin";
import { Tan } from "../functions/Tan";

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
 *   Sin  — d/dx(sin f)  = cos(f)·f'                  (chain rule)
 *   Cos  — d/dx(cos f)  = -sin(f)·f'                 (chain rule)
 *   Tan  — d/dx(tan f)  = f'/cos²(f)                 (chain rule)
 *   Asin — d/dx(asin f) = f'/√(1−f²)
 *   Acos — d/dx(acos f) = −f'/√(1−f²)
 *   Atan — d/dx(atan f) = f'/(1+f²)
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

	// --- Sin: d/dx[sin(f)] = cos(f)·f' ---

	if (expr instanceof Sin) {
		const df = diff(expr.inner, sym);
		return new Mul(new Cos(expr.inner), df).simplify();
	}

	// --- Cos: d/dx[cos(f)] = -sin(f)·f' ---

	if (expr instanceof Cos) {
		const df = diff(expr.inner, sym);
		return new Mul(new Neg(new Sin(expr.inner)), df).simplify();
	}

	// --- Tan: d/dx[tan(f)] = f' / cos²(f) ---

	if (expr instanceof Tan) {
		const df = diff(expr.inner, sym);
		return new Mul(new Pow(new Cos(expr.inner), new Num(-2)), df).simplify();
	}

	// --- Asin: d/dx[asin(f)] = f' / √(1 − f²) ---

	if (expr instanceof Asin) {
		const df = diff(expr.inner, sym);
		const radical = new Pow(
			new Add(
				new Num(1),
				new Mul(new Num(-1), new Pow(expr.inner, new Num(2))),
			),
			new Rational(-1, 2),
		);
		return new Mul(df, radical).simplify();
	}

	// --- Acos: d/dx[acos(f)] = −f' / √(1 − f²) ---

	if (expr instanceof Acos) {
		const df = diff(expr.inner, sym);
		const radical = new Pow(
			new Add(
				new Num(1),
				new Mul(new Num(-1), new Pow(expr.inner, new Num(2))),
			),
			new Rational(-1, 2),
		);
		return new Neg(new Mul(df, radical)).simplify();
	}

	// --- Atan: d/dx[atan(f)] = f' / (1 + f²) ---

	if (expr instanceof Atan) {
		const df = diff(expr.inner, sym);
		const denom = new Pow(
			new Add(new Num(1), new Pow(expr.inner, new Num(2))),
			new Num(-1),
		);
		return new Mul(df, denom).simplify();
	}

	throw new Error(
		`diff: unsupported expression type "${expr.constructor.name}"`,
	);
}
