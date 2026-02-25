import { Expr } from "./Expr";

export class Sym extends Expr<readonly []> {
	static readonly #cache = new Map<string, Sym>();

	constructor(public readonly name: string) {
		const cached = Sym.#cache.get(name);
		if (cached) return cached;
		super();
		Sym.#cache.set(name, this);
	}

	toString() {
		return this.name;
	}

	key() {
		return `Sym(${this.name})`;
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
