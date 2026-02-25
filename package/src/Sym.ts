import { Expr } from "./Expr";

export class Sym extends Expr<readonly []> {
	static readonly #cache = new Map<string, Sym>();

	constructor(public readonly name: string) {
		super();
		const cached = Sym.#cache.get(name);
		// biome-ignore lint/correctness/noConstructorReturn: We want caching
		if (cached) return cached;
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

	/** A symbol is its own free variable. */
	override freeSymbols(): Set<Sym> {
		return new Set([this]);
	}

	simplify(): Expr {
		return this; // already simplest
	}
}
