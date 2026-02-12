import { Add } from "./Add";
import { Expr } from "./Expr";
import { Mul } from "./Mul";
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
		return `-${this.inner}`;
	}

	key() {
		return `Neg(${this.inner.key()})`;
	}

	simplify(): Expr {
		const inner = this.inner.simplify();

		// numeric negation
		if (inner instanceof Num) return new Num(-inner.value);

		// distribute over Add: -(a + b) → -a + -b
		if (inner instanceof Add)
			return new Add(new Neg(inner.left), new Neg(inner.right)).simplify();

		// normalize to Mul(-1, ...) — consistent with SymPy's representation
		return new Mul(new Num(-1), inner).simplify();
	}
}

Expr.Neg = Neg;
