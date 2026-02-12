import { Expr } from "./Expr";
import { Mul } from "./Mul";
import { Neg } from "./Neg";
import { Num } from "./Num";

export class Add extends Expr {
	constructor(
		public left: Expr,
		public right: Expr,
	) {
		super();
	}

	toString() {
		if (this.right instanceof Neg) {
			return `(${this.left} - ${this.right.inner})`;
		}
		return `(${this.left} + ${this.right})`;
	}

	simplify(): Expr {
		// Simplify children first
		const l = this.left.simplify();
		const r = this.right.simplify();

		// Flatten nested Adds
		const terms: Expr[] = [];
		function collect(expr: Expr) {
			if (expr instanceof Add) {
				collect(expr.left);
				collect(expr.right);
			} else {
				terms.push(expr);
			}
		}
		collect(l);
		collect(r);

		// Combine numeric constants
		let sum = 0;
		const rest: Expr[] = [];
		for (const t of terms) {
			if (t instanceof Num) sum += t.value;
			else rest.push(t);
		}
		if (sum !== 0) rest.push(new Num(sum));

		// Combine exact duplicate terms: x + x -> 2*x
		const combined: Expr[] = [];
		const counts = new Map<string, number>();
		for (const t of rest) {
			const key = t.toString();
			if (!counts.has(key)) counts.set(key, 0);
			counts.set(key, counts.get(key)! + 1);
		}
		for (const [key, count] of counts.entries()) {
			const first = rest.find((e) => e.toString() === key)!;
			if (count === 1) combined.push(first);
			else combined.push(new Mul(new Num(count), first).simplify());
		}

		// Rebuild nested Add
		if (combined.length === 0) return new Num(0);
		let result = combined[0];
		for (let i = 1; i < combined.length; i++) {
			result = new Add(result!, combined[i]!);
		}
		return result!;
	}
}

Expr.Add = Add;
