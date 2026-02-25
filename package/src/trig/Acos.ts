import { PiConstant } from "../constants/Pi";
import { Expr } from "../Expr";
import { Mul } from "../Mul";
import { Num } from "../Num";
import { Rational } from "../Rational";

/**
 * Inverse cosine: acos(inner).
 *
 * Simplifications applied:
 *   acos(Num 1)   → 0      (exact)
 *   acos(Num 0)   → π/2    (exact)
 *   acos(Num -1)  → π      (exact)
 *   acos(Num n)   → Num(Math.acos(n))  for other numeric inputs
 *
 * Note: acos is neither odd nor even (acos(-x) = π − acos(x)),
 * so no simple sign-stripping rule applies.
 */
export class Acos extends Expr<readonly [Expr]> {
	constructor(public readonly inner: Expr) {
		super();
	}

	get args(): readonly [Expr] {
		return [this.inner];
	}
	map(fn: (e: Expr) => Expr): Expr {
		return new Acos(fn(this.inner));
	}

	key() {
		return `Acos(${this.inner.key()})`;
	}

	toString() {
		return `acos(${this.inner})`;
	}

	protected _simplify(): Expr {
		const inner = this.inner.simplify();

		if (inner instanceof Num) {
			if (inner.value === 1) return new Num(0);
			if (inner.value === 0)
				return new Mul(new Rational(1, 2), PiConstant.instance);
			if (inner.value === -1) return PiConstant.instance;
			return new Num(Math.acos(inner.value));
		}

		return new Acos(inner);
	}
}
