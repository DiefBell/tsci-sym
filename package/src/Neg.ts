import { Expr } from "./Expr";
import { Num } from "./Num";

/**
 * Unary negation
 * @example `1 + -3 = -2`
 * @example `vec1 + -vec2 = vec1 - vec2`
 */
export class Neg extends Expr {
	constructor(public inner: Expr) {
		super();
	}

	toString() {
		return `(-${this.inner})`;
	}

	simplify(): Expr {
		const inner = this.inner.simplify();

		// double negative
		if (inner instanceof Neg) return inner.inner.simplify();

		// numeric negation
		if (inner instanceof Num) return new Num(-inner.value);

		return new Neg(inner);
	}
}

Expr.Neg = Neg;
