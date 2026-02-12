import { Expr } from "./Expr";
import { Num } from "./Num";

export class Pow extends Expr {
	constructor(
		public base: Expr,
		public exponent: Expr,
	) {
		super();
	}

	toString() {
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

		// numeric folding
		if (base instanceof Num && exp instanceof Num)
			return new Num(base.value ** exp.value);

		return new Pow(base, exp);
	}
}

Expr.Pow = Pow;
