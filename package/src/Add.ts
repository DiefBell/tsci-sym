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

	key() {
		const terms: string[] = [];
		function collect(expr: Expr) {
			if (expr instanceof Add) {
				collect(expr.left);
				collect(expr.right);
			} else {
				terms.push(expr.key());
			}
		}
		collect(this);
		terms.sort();
		return `Add[${terms.join(",")}]`;
	}

	toString() {
		if (this.right instanceof Neg) {
			return `(${this.left} - ${this.right.inner})`;
		}
		if (
			this.right instanceof Mul &&
			this.right.left instanceof Num &&
			this.right.left.value < 0
		) {
			const absCoeff = -this.right.left.value;
			const base = this.right.right;
			const pos = absCoeff === 1 ? base : new Mul(new Num(absCoeff), base);
			return `(${this.left} - ${pos})`;
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

		// Combine like terms by extracting (coefficient, base) from each term
		function extractCoeff(term: Expr): [number, Expr] {
			if (term instanceof Mul) {
				if (term.left instanceof Num) return [term.left.value, term.right];
				if (term.right instanceof Num) return [term.right.value, term.left];
			}
			return [1, term];
		}

		const coeffMap = new Map<string, { coeff: number; base: Expr }>();
		for (const t of rest) {
			const [coeff, base] = extractCoeff(t);
			const key = base.key();
			const existing = coeffMap.get(key);
			if (existing) existing.coeff += coeff;
			else coeffMap.set(key, { coeff, base });
		}

		const combined: Expr[] = [];
		for (const { coeff, base } of coeffMap.values()) {
			if (coeff === 0) continue;
			if (coeff === 1) combined.push(base);
			else combined.push(new Mul(new Num(coeff), base).simplify());
		}

		// Put positive-coefficient terms first so toString can render negatives as subtraction
		combined.sort((a) => {
			const [coeff] = extractCoeff(a);
			return coeff < 0 ? 1 : -1;
		});

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
