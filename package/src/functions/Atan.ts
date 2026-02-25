import { PiConstant } from "../constants/Pi";
import { Expr } from "../Expr";
import { Mul } from "../core/Mul";
import { Neg } from "../core/Neg";
import { Num } from "../core/Num";
import { Rational } from "../core/Rational";
import { isNegated, stripNeg } from "./utils";

/**
 * Inverse tangent: atan(inner).
 *
 * Simplifications applied:
 *   atan(Num 0)   → 0
 *   atan(Num 1)   → π/4    (exact)
 *   atan(Num -1)  → -π/4   (exact)
 *   atan(Num n)   → Num(Math.atan(n))  for other numeric inputs
 *   atan(-u)      → -atan(u)           odd function
 */
export class Atan extends Expr<readonly [Expr]> {
	constructor(public readonly inner: Expr) {
		super();
	}

	get args(): readonly [Expr] {
		return [this.inner];
	}
	map(fn: (e: Expr) => Expr): Expr {
		return new Atan(fn(this.inner));
	}

	key() {
		return `Atan(${this.inner.key()})`;
	}

	toString() {
		return `atan(${this.inner})`;
	}

	protected _simplify(): Expr {
		const inner = this.inner.simplify();

		if (inner instanceof Num) {
			if (inner.value === 0) return new Num(0);
			if (inner.value === 1)
				return new Mul(new Rational(1, 4), PiConstant.instance);
			if (inner.value === -1)
				return new Mul(new Rational(-1, 4), PiConstant.instance);
			return new Num(Math.atan(inner.value));
		}

		// Odd function: atan(-u) = -atan(u)
		if (isNegated(inner)) {
			return new Neg(new Atan(stripNeg(inner))).simplify();
		}

		return new Atan(inner);
	}
}
