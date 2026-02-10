import { Expr } from "./Expr";

export class Add extends Expr {
	constructor(
		public left: Expr,
		public right: Expr,
	) {
		super();
	}

	toString() {
		return `(${this.left} + ${this.right})`;
	}
}

Expr.Add = Add;
