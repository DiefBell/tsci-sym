import { Expr } from "./Expr";
import { Mul } from "./Mul";
import { Num } from "./Num";
import { Rational } from "./Rational";

export class Pow extends Expr<readonly [Expr, Expr]> {
	constructor(
		public base: Expr,
		public exponent: Expr,
	) {
		super();
	}

	get args(): readonly [Expr, Expr] {
		return [this.base, this.exponent];
	}
	map(fn: (e: Expr) => Expr): Expr {
		return new Pow(fn(this.base), fn(this.exponent));
	}

	key() {
		return `Pow(${this.base.key()},${this.exponent.key()})`;
	}

	toString() {
		if (
			this.exponent instanceof Rational &&
			this.exponent.numerator === 1n &&
			this.exponent.denominator === 2n
		)
			return `sqrt(${this.base})`;
		return `${this.base}^${this.exponent}`;
	}

	simplify(): Expr {
		const base = this.base.simplify();
		const exp = this.exponent.simplify();

		// 0^x
		if (
			base instanceof Num &&
			base.value === 0 &&
			!(exp instanceof Num && exp.value === 0)
		) {
			return new Num(0);
		}

		// x^0 = 1
		if (exp instanceof Num && exp.value === 0) return new Num(1);

		// x^1 = x
		if (exp instanceof Num && exp.value === 1) return base;

		// (f^a)^b = f^(a*b) — safe when both exponents are integers
		// (excludes fractional exponents to avoid sqrt(x^2) = x errors on negative x)
		if (
			base instanceof Pow &&
			exp instanceof Num &&
			Number.isInteger(exp.value) &&
			base.exponent instanceof Num &&
			Number.isInteger(base.exponent.value)
		) {
			return new Pow(
				base.base,
				new Mul(base.exponent, exp).simplify(),
			).simplify();
		}

		// integer^(-1) → exact Rational reciprocal (before float folding)
		if (
			base instanceof Num &&
			Number.isInteger(base.value) &&
			base.value !== 0 &&
			exp instanceof Num &&
			exp.value === -1
		)
			return new Rational(1, base.value).simplify();

		// Rational^(-1) → flip numerator and denominator
		if (base instanceof Rational && exp instanceof Num && exp.value === -1)
			return new Rational(base.denominator, base.numerator).simplify();

		// numeric folding
		if (base instanceof Num && exp instanceof Num)
			return new Num(base.value ** exp.value);

		// sqrt of a perfect square: Num(n) ^ Rational(1,2) → Num(sqrt(n))
		if (
			base instanceof Num &&
			base.value >= 0 &&
			exp instanceof Rational &&
			exp.numerator === 1n &&
			exp.denominator === 2n
		) {
			const s = Math.sqrt(base.value);
			if (Number.isInteger(s)) return new Num(s);
		}

		return new Pow(base, exp);
	}
}

Expr.Pow = Pow;
