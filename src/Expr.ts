export abstract class Expr {
	abstract toString(): string;

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

	public declare static Add: new (
		lhs: Expr | number,
		rhs: Expr | number,
	) => Expr;
	public declare static Mul: new (
		lhs: Expr | number,
		rhs: Expr | number,
	) => Expr;
	public declare static Num: new (
		value: number,
	) => Expr;
}
