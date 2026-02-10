import { Expr } from "./Expr";

export class Sym extends Expr {
	constructor(public name: string) {
		super();
	}

	toString() {
		return this.name;
	}

	simplify(): Expr {
		return this; // already simplest
	}
}
