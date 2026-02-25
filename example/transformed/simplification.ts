import { Expr } from "sym.js";
import { x, y } from "./symbols";

// ── Simplification ───────────────────────────────────────────────────────────
const expr = Expr["+"][1](
	Expr["-"][1](
		Expr["*"][0](
			Expr["+"][1](Expr["+"][0](x, Expr["*"][2](2, y)), 1),
			Expr["-"][1](x, y),
		),
		Expr["+"][0](x, x),
	),
	3,
);
console.log("expr:      ", expr.toString());
const simplified = expr.simplify();
// expect: ((x^2 + xy) - (2y^2 + (x + (y - 3))))
console.log("simplified:", simplified.toString());
