import { Add } from "./Add";
import { Mul } from "./Mul";
import { Num } from "./Num";

export abstract class Expr {
	abstract toString(): string;

	static readonly "+" = [
		(lhs: Expr, rhs: Expr): Expr => new Add(lhs, rhs),
		(lhs: Expr, rhs: number): Expr => new Add(lhs, new Num(rhs)),
		(lhs: number, rhs: Expr): Expr => new Add(new Num(lhs), rhs),
	] as const;

	static readonly "*" = [
		(lhs: Expr, rhs: Expr): Expr => new Mul(lhs, rhs),
		(lhs: Expr, rhs: number): Expr => new Mul(lhs, new Num(rhs)),
		(lhs: number, rhs: Expr): Expr => new Mul(new Num(lhs), rhs),
	] as const;
}
