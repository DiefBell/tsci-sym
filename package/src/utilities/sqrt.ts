import type { Expr } from "../Expr";
import { Pow } from "../Pow";
import { Rational } from "../Rational";

/**
 * Returns the square root of x as Pow(x, Rational(1, 2))
 */
export function sqrt(x: Expr): Pow {
	return new Pow(x, new Rational(1, 2));
}
