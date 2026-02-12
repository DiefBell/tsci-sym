import { Expr } from "./Expr";

export class Num extends Expr {
	constructor(public value: number) {
		super();
	}

	toString() {
		return this.value.toString();
	}

	key() {
		return `Num(${this.value})`;
	}

	simplify(): Expr {
		return this; // already simplest
	}
}

Expr.Num = Num;
