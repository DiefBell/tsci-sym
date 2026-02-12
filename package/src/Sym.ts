import { Expr } from "./Expr";

export class Sym extends Expr {
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

	simplify(): Expr {
		return this; // already simplest
	}
}
