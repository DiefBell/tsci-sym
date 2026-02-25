import type { Expr } from "../Expr";
import { Log } from "../functions/Log";
import { Mul } from "../core/Mul";
import { Num } from "../core/Num";
import { Pow } from "../core/Pow";

/** Natural log of x. With an optional base, expands to log(x) / log(base) via change-of-base. */

export function log(x: Expr, base?: Expr | number): Expr {
	const lx = new Log(x);
	if (base === undefined) return lx;
	const lb = typeof base === "number" ? new Log(new Num(base)) : new Log(base);
	return new Mul(lx, new Pow(lb, new Num(-1)));
}
