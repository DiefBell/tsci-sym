import { Expr } from "./Expr";

export class Num extends Expr<readonly []> {
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

	get args(): readonly [] {
		return [];
	}
	map(_fn: (e: Expr) => Expr): Expr {
		return this;
	}

	simplify(): Expr {
		return this; // already simplest
	}
}

Expr.Num = Num;
