export abstract class Expr {
	abstract simplify(): Expr;
	abstract toString(): string;

	/** Structural identity key, distinct from display toString(). Used for comparing expression trees. */
	abstract key(): string;

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
		const r = typeof rhs === "number" ? Expr["-"](new Expr.Num(rhs)) : Expr["-"](rhs);
		return Expr["+"](l, r);
	}

	static "/"(lhs: Expr, rhs: Expr): Expr;
	static "/"(lhs: Expr, rhs: number): Expr;
	static "/"(lhs: number, rhs: Expr): Expr;
	static "/"(lhs: Expr | number, rhs: Expr | number): Expr {
		const l = typeof lhs === "number" ? new Expr.Num(lhs) : lhs;
		if (typeof rhs === "number") return new Expr.Mul(l, new Expr.Rational(1, rhs));
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
