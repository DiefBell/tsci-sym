import { Expr } from "../Expr";

export class Num extends Expr<readonly []> {
	static readonly #cache = new Map<number, Num>();

	// biome-ignore lint/correctness/noUnreachableSuper: Don't run super if using cached value
	constructor(public readonly value: number) {
		const cached = Num.#cache.get(value);
		// biome-ignore lint/correctness/noConstructorReturn: We need this for caching
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

	protected _simplify(): Expr {
		return this; // already simplest
	}
}

Expr.Num = Num;
