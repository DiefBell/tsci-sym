import { PiConstant } from "../constants/Pi";
import { Expr } from "../Expr";
import { Mul } from "../Mul";
import { Neg } from "../Neg";
import { Num } from "../Num";
import { Rational } from "../Rational";
import { isNegated, stripNeg } from "./utils";

/**
 * Inverse sine: asin(inner).
 *
 * Simplifications applied:
 *   asin(Num 0)   → 0
 *   asin(Num 1)   → π/2    (exact)
 *   asin(Num -1)  → -π/2   (exact)
 *   asin(Num n)   → Num(Math.asin(n))  for other numeric inputs
 *   asin(-u)      → -asin(u)           odd function
 */
export class Asin extends Expr {
	constructor(public readonly inner: Expr) {
		super();
	}

	key() {
		return `Asin(${this.inner.key()})`;
	}

	toString() {
		return `asin(${this.inner})`;
	}

	simplify(): Expr {
		const inner = this.inner.simplify();

		if (inner instanceof Num) {
			if (inner.value === 0) return new Num(0);
			if (inner.value === 1) return new Mul(new Rational(1, 2), PiConstant.instance);
			if (inner.value === -1) return new Mul(new Rational(-1, 2), PiConstant.instance);
			return new Num(Math.asin(inner.value));
		}

		// Odd function: asin(-u) = -asin(u)
		if (isNegated(inner)) {
			return new Neg(new Asin(stripNeg(inner))).simplify();
		}

		return new Asin(inner);
	}
}
