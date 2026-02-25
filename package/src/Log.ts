import { EulerNumber } from "./constants/E";
import { Expr } from "./Expr";
import { Num } from "./Num";
import { Pow } from "./Pow";

/** Natural logarithm (base e). log(E) = 1, log(1) = 0, log(e^x) = x */
export class Log extends Expr<readonly [Expr]> {
	constructor(public readonly inner: Expr) {
		super();
	}

	get args(): readonly [Expr] {
		return [this.inner];
	}
	map(fn: (e: Expr) => Expr): Expr {
		return new Log(fn(this.inner));
	}

	key() {
		return `Log(${this.inner.key()})`;
	}

	toString() {
		return `log(${this.inner})`;
	}

	protected _simplify(): Expr {
		const inner = this.inner.simplify();

		// log(1) = 0
		if (inner instanceof Num && inner.value === 1) return new Num(0);

		// log(E) = 1
		if (inner instanceof EulerNumber) return new Num(1);

		// log(e^x) = x
		if (inner instanceof Pow && inner.base instanceof EulerNumber)
			return inner.exponent.simplify();

		// log(numeric constant) — fold to float
		if (inner instanceof Num && inner.value > 0)
			return new Num(Math.log(inner.value));

		return new Log(inner);
	}
}
