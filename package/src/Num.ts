import { Expr } from "./Expr";

export class Num extends Expr {
	static readonly #cache = new Map<number, Num>();

	constructor(public readonly value: number) {
		const cached = Num.#cache.get(value);
		if (cached) return cached;
		super();
		Num.#cache.set(value, this);
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
