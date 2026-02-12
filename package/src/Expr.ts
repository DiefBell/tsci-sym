export abstract class Expr {
	abstract simplify(): Expr;
	abstract toString(): string;

	/** Structural identity key, distinct from display toString(). Used for comparing expression trees. */
	abstract key(): string;

	static readonly "+" = [
		(lhs: Expr, rhs: Expr): Expr => new Expr.Add(lhs, rhs),
		(lhs: Expr, rhs: number): Expr => new Expr.Add(lhs, new Expr.Num(rhs)),
		(lhs: number, rhs: Expr): Expr => new Expr.Add(new Expr.Num(lhs), rhs),
	] as const;

	static readonly "*" = [
		(lhs: Expr, rhs: Expr): Expr => new Expr.Mul(lhs, rhs),
		(lhs: Expr, rhs: number): Expr => new Expr.Mul(lhs, new Expr.Num(rhs)),
		(lhs: number, rhs: Expr): Expr => new Expr.Mul(new Expr.Num(lhs), rhs),
	] as const;

	static readonly "-" = [
		// unary
		(inner: Expr): Expr => new Expr.Neg(inner),

		// binary
		(lhs: Expr, rhs: Expr): Expr => new this.Add(lhs, Expr["-"][0](rhs)),
		(lhs: Expr, rhs: number): Expr =>
			new this.Add(lhs, Expr["-"][0](new Expr.Num(rhs))),
		(lhs: number, rhs: Expr): Expr =>
			new this.Add(new Expr.Num(lhs), Expr["-"][0](rhs)),
	] as const;

	static readonly "**" = [
		(lhs: Expr, rhs: Expr): Expr => new Expr.Pow(lhs, rhs),
		(lhs: number, rhs: Expr): Expr => new Expr.Pow(new Expr.Num(lhs), rhs),
		(lhs: Expr, rhs: number): Expr => new Expr.Pow(lhs, new Expr.Num(rhs)),
	] as const;

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
}
