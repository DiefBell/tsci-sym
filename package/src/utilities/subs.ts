import { Sym } from "../core/Sym";
import type { Expr } from "../Expr";

/**
 * Substitutes symbols in `expr` with replacement expressions.
 *
 * Walks the expression tree: every `Sym` found in `substitutions` is replaced
 * with its mapped value. The result is simplified bottom-up as it is rebuilt.
 *
 * @param expr - The expression to substitute into.
 * @param substitutions - A Map from Sym instances to replacement Expr nodes.
 * @returns The substituted and simplified expression.
 *
 * @example
 * const x = new Sym("x");
 * subs(new Add(x, new Num(1)), new Map([[x, new Num(3)]]))  // Num(4)
 * subs(new Sin(x), new Map([[x, Pi]]))                       // Num(0)  (sin(π) = 0)
 * subs(new Mul(new Num(2), x), new Map([[x, y]]))            // 2y
 */
export function subs(expr: Expr, substitutions: Map<Sym, Expr>): Expr {
	if (expr instanceof Sym) {
		return substitutions.get(expr) ?? expr;
	}
	return expr.map((child) => subs(child, substitutions)).simplify();
}
