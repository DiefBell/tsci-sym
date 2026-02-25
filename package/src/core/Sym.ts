import { Expr } from "../Expr";

/**
 * Optional mathematical assumptions about a symbol's domain.
 * `undefined` means unknown — no assumption is made.
 *
 * These are used by simplification rules that are only valid under
 * certain conditions, e.g. sqrt(x²) = x requires `positive: true`.
 */
export interface Assumptions {
	readonly real?: boolean;
	readonly positive?: boolean;
	readonly negative?: boolean;
	readonly integer?: boolean;
	readonly nonzero?: boolean;
}

export class Sym extends Expr<readonly []> {
	// Cache key includes assumptions so Sym("x") and Sym("x", { positive: true })
	// are distinct objects with distinct structural keys.
	static readonly #cache = new Map<string, Sym>();

	// biome-ignore lint/correctness/noUnreachableSuper: Don't run super if using cached value
	constructor(
		public readonly name: string,
		public readonly assumptions: Assumptions = {},
	) {
		const cacheKey = Sym.#cacheKey(name, assumptions);
		const cached = Sym.#cache.get(cacheKey);
		// biome-ignore lint/correctness/noConstructorReturn: We want caching
		if (cached) return cached;

		super();
		Sym.#cache.set(cacheKey, this);
	}

	/** Produces a stable, sorted string from name + assumptions for use as a cache/identity key. */
	static #cacheKey(name: string, assumptions: Assumptions): string {
		const parts = (
			Object.entries(assumptions) as [string, boolean | undefined][]
		)
			.filter(([, v]) => v !== undefined)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([k, v]) => `${k}=${v}`);
		return parts.length ? `${name}{${parts.join(",")}}` : name;
	}

	toString() {
		return this.name; // display is just the name, assumptions are not shown
	}

	key() {
		// Assumptions are part of structural identity: Sym("x") ≠ Sym("x", { positive: true })
		return `Sym(${Sym.#cacheKey(this.name, this.assumptions)})`;
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

	protected _simplify(): Expr {
		return this;
	}
}
