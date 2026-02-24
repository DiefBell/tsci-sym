import type { Expr } from "../Expr";
import { Sym } from "../Sym";
import { RULES } from "./rules";

/**
 * Symbolically integrates `expr` with respect to `sym`.
 *
 * Returns the antiderivative without the constant of integration (+ C).
 * Throws if no rule can handle the expression.
 *
 * Rules applied (in order):
 *   constant       ∫ c dx       = c·x
 *   sum            ∫ f+g dx     = ∫f + ∫g
 *   constant mult  ∫ c·f dx     = c·∫f
 *   power          ∫ xⁿ dx      = xⁿ⁺¹/(n+1)   n ≠ -1
 *   reciprocal     ∫ x⁻¹ dx     = ln(x)
 *   exponential    ∫ eˣ dx      = eˣ
 *   exp base       ∫ aˣ dx      = aˣ/ln(a)
 *   log            ∫ ln(x) dx   = x·ln(x) − x
 *   u-substitution ∫ f(g(x))g'  = F(g(x))
 */
export function integrate(expr: Expr, sym: Sym): Expr {
	const simplified = expr.simplify();
	for (const rule of RULES) {
		const result = rule(simplified, sym, integrate);
		if (result !== null) return result.simplify();
	}
	throw new Error(
		`integrate: no rule matched "${simplified}" (type: ${simplified.constructor.name})`,
	);
}
