import { Expr } from "./Expr";
import { Mul } from "./Mul";
import { Num } from "./Num";
import { Rational } from "./Rational";

export class Abs extends Expr<readonly [Expr]> {
	constructor(public readonly inner: Expr) {
		super();
	}

	get args(): readonly [Expr] {
		return [this.inner];
	}
	map(fn: (e: Expr) => Expr): Expr {
		return new Abs(fn(this.inner));
	}

	key() {
		return `Abs(${this.inner.key()})`;
	}

	toString() {
		return `|${this.inner}|`;
	}

	protected _simplify(): Expr {
		const inner = this.inner.simplify();

		if (inner instanceof Num) return new Num(Math.abs(inner.value));
		if (inner instanceof Rational)
			return new Rational(
				inner.numerator < 0n ? -inner.numerator : inner.numerator,
				inner.denominator,
			);

		// |-n * x| = |n| * x  when n is numeric
		if (
			inner instanceof Mul &&
			inner.left instanceof Num &&
			inner.left.value < 0
		)
			return new Mul(new Num(-inner.left.value), inner.right);
		if (
			inner instanceof Mul &&
			inner.left instanceof Rational &&
			inner.left.numerator < 0n
		)
			return new Mul(
				new Rational(-inner.left.numerator, inner.left.denominator),
				inner.right,
			);

		return new Abs(inner);
	}
}
