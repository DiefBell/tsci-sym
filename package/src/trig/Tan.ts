import { Expr } from "../Expr";
import { Neg } from "../Neg";
import { Num } from "../Num";
import { isNegated, piCoeff, stripNeg } from "./utils";

/**
 * Tangent function: tan(inner).
 *
 * Simplifications applied:
 *   tan(Num n)    → Num(Math.tan(n))    numeric evaluation
 *   tan(nπ)       → 0                   integer n (periodicity)
 *   tan(-u)       → -tan(u)             odd function
 */
export class Tan extends Expr {
	constructor(public readonly inner: Expr) {
		super();
	}

	key() {
		return `Tan(${this.inner.key()})`;
	}

	toString() {
		return `tan(${this.inner})`;
	}

	simplify(): Expr {
		const inner = this.inner.simplify();

		// Numeric evaluation
		if (inner instanceof Num) return new Num(Math.tan(inner.value));

		// tan(nπ) = 0  for integer n (period π)
		const pc = piCoeff(inner);
		if (pc !== null) {
			const [num, den] = pc;
			if (num % den === 0n) return new Num(0);
		}

		// Odd function: tan(-u) = -tan(u)
		if (isNegated(inner)) {
			return new Neg(new Tan(stripNeg(inner))).simplify();
		}

		return new Tan(inner);
	}
}
