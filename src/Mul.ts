import { Expr } from "./Expr";

export class Mul extends Expr {
	constructor(public left: Expr, public right: Expr) {
		super();
	}

	toString() {
		return `(${this.left} * ${this.right})`;
	}
}
