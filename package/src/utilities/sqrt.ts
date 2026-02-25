import { Pow } from "../core/Pow";
import { Rational } from "../core/Rational";
import type { Expr } from "../Expr";

/**
 * Returns the square root of x as Pow(x, Rational(1, 2))
 */
export function sqrt(x: Expr): Pow {
	return new Pow(x, new Rational(1, 2));
}
