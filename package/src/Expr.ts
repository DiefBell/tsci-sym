// `import type` breaks the circular dep: Sym imports Expr (value), Expr imports Sym (type only).
import type { Sym } from "./Sym";

export abstract class Expr<
	// biome-ignore lint/suspicious/noExplicitAny: <>
	TArgs extends readonly Expr[] = readonly Expr<any>[],
> {
	// Cached result of `_simplify()`. Set on first call, reused on subsequent ones.
	private _simplified?: Expr;

	/**
	 * Returns this expression in its simplified form.
	 * The result is cached on the node — repeated calls are free.
	 * Subclasses implement `_simplify()`, not this method.
	 */
	simplify(): Expr {
		if (!this._simplified) this._simplified = this._simplify();
		return this._simplified;
	}

	/** Internal simplification logic. Implement this in each subclass; call `simplify()` publicly. */
	protected abstract _simplify(): Expr;

	abstract toString(): string;

	/** Structural identity key, distinct from display toString(). Used for comparing expression trees. */
	abstract key(): string;

	/** Ordered tuple of child expressions. Atoms return `[]`. */
	abstract get args(): TArgs;

	/** Return a new node of the same type with each child replaced by `fn(child)`. Atoms return `this`. */
	abstract map(fn: (e: Expr) => Expr): Expr;

	/**
	 * Returns the set of all free symbolic variables (`Sym` nodes) anywhere in this expression tree.
	 *
	 * This is a concrete method — subclasses do NOT need to override it.
	 * It works by recursively collecting `freeSymbols()` from each child via `args`.
	 *
	 * The one exception is `Sym` itself, which overrides this to return `new Set([this])`,
	 * since a symbol is its own free variable and has no children to recurse into.
	 *
	 * All other atoms (Num, Rational, Pi, E) have `args = []`, so the loop never
	 * runs and they return an empty set automatically — no override needed.
	 */
	freeSymbols(): Set<Sym> {
		const result = new Set<Sym>();
		for (const child of this.args) {
			for (const sym of child.freeSymbols()) {
				result.add(sym);
			}
		}
		return result;
	}

	static "+"(lhs: Expr, rhs: Expr): Expr;
	static "+"(lhs: Expr, rhs: number): Expr;
	static "+"(lhs: number, rhs: Expr): Expr;
	static "+"(lhs: Expr | number, rhs: Expr | number): Expr {
		const l = typeof lhs === "number" ? new Expr.Num(lhs) : lhs;
		const r = typeof rhs === "number" ? new Expr.Num(rhs) : rhs;
		return new Expr.Add(l, r);
	}

	static "*"(lhs: Expr, rhs: Expr): Expr;
	static "*"(lhs: Expr, rhs: number): Expr;
	static "*"(lhs: number, rhs: Expr): Expr;
	static "*"(lhs: Expr | number, rhs: Expr | number): Expr {
		const l = typeof lhs === "number" ? new Expr.Num(lhs) : lhs;
		const r = typeof rhs === "number" ? new Expr.Num(rhs) : rhs;
		return new Expr.Mul(l, r);
	}

	static "-"(inner: Expr): Expr;
	static "-"(lhs: Expr, rhs: Expr): Expr;
	static "-"(lhs: Expr, rhs: number): Expr;
	static "-"(lhs: number, rhs: Expr): Expr;
	static "-"(lhs: Expr | number, rhs?: Expr | number): Expr {
		if (rhs === undefined) return new Expr.Neg(lhs as Expr);
		const l = typeof lhs === "number" ? new Expr.Num(lhs) : lhs;
		const r =
			typeof rhs === "number" ? Expr["-"](new Expr.Num(rhs)) : Expr["-"](rhs);
		return Expr["+"](l, r);
	}

	static "/"(lhs: Expr, rhs: Expr): Expr;
	static "/"(lhs: Expr, rhs: number): Expr;
	static "/"(lhs: number, rhs: Expr): Expr;
	static "/"(lhs: Expr | number, rhs: Expr | number): Expr {
		const l = typeof lhs === "number" ? new Expr.Num(lhs) : lhs;
		if (typeof rhs === "number")
			return new Expr.Mul(l, new Expr.Rational(1, rhs));
		return new Expr.Mul(l, new Expr.Pow(rhs, new Expr.Num(-1)));
	}

	static "**"(lhs: Expr, rhs: Expr): Expr;
	static "**"(lhs: Expr, rhs: number): Expr;
	static "**"(lhs: number, rhs: Expr): Expr;
	static "**"(lhs: Expr | number, rhs: Expr | number): Expr {
		const l = typeof lhs === "number" ? new Expr.Num(lhs) : lhs;
		const r = typeof rhs === "number" ? new Expr.Num(rhs) : rhs;
		return new Expr.Pow(l, r);
	}

	public declare static Add: new (
		lhs: Expr,
		rhs: Expr,
	) => Expr;
	public declare static Mul: new (
		lhs: Expr,
		rhs: Expr,
	) => Expr;
	public declare static Num: new (
		value: number,
	) => Expr;
	public declare static Neg: new (
		inner: Expr,
	) => Expr;
	public declare static Pow: new (
		base: Expr,
		exponent: Expr,
	) => Expr;
	public declare static Rational: new (
		numerator: number | bigint,
		denominator?: number | bigint,
	) => Expr;
}
