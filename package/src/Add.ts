import { Expr } from "./Expr";
import { Mul } from "./Mul";
import { Neg } from "./Neg";
import { Num } from "./Num";
import { Rational } from "./Rational";

export class Add extends Expr<readonly [Expr, Expr]> {
	constructor(
		public left: Expr,
		public right: Expr,
	) {
		super();
	}

	get args(): readonly [Expr, Expr] {
		return [this.left, this.right];
	}
	map(fn: (e: Expr) => Expr): Expr {
		return new Add(fn(this.left), fn(this.right));
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

	protected _simplify(): Expr {
		const l = this.left.simplify();
		const r = this.right.simplify();

		// Flatten nested Adds into a flat term list (children already simplified)
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

		// Extract exact (coefficient, symbolic-base) from a term using Rational arithmetic.
		// Pure integer Num and standalone Rational get base Num(1) so they accumulate together.
		// Non-integer Num floats and unrecognised Mul structures are treated as opaque (coeff 1).
		function extractCoeff(term: Expr): [Rational, Expr] {
			if (term instanceof Rational) return [term, new Num(1)];
			if (term instanceof Num && Number.isInteger(term.value))
				return [new Rational(term.value), new Num(1)];
			if (term instanceof Mul) {
				if (term.left instanceof Rational) return [term.left, term.right];
				if (term.left instanceof Num && Number.isInteger(term.left.value))
					return [new Rational(term.left.value), term.right];
				if (term.right instanceof Rational) return [term.right, term.left];
				if (term.right instanceof Num && Number.isInteger(term.right.value))
					return [new Rational(term.right.value), term.left];
			}
			return [new Rational(1), term];
		}

		// Group terms by symbolic base, summing coefficients with exact Rational arithmetic
		const coeffMap = new Map<string, { coeff: Rational; base: Expr }>();
		for (const t of terms) {
			const [coeff, base] = extractCoeff(t);
			const key = base.key();
			const existing = coeffMap.get(key);
			if (existing) existing.coeff = existing.coeff.add(coeff);
			else coeffMap.set(key, { coeff, base });
		}

		// Rebuild combined terms, dropping zero-coefficient entries
		const combined: Expr[] = [];
		for (const { coeff, base } of coeffMap.values()) {
			if (coeff.numerator === 0n) continue;
			const coeffExpr: Expr =
				coeff.denominator === 1n ? new Num(Number(coeff.numerator)) : coeff;
			combined.push(new Mul(coeffExpr, base).simplify());
		}

		// Put positive-coefficient terms first so toString() renders negatives as subtraction
		combined.sort((a) => {
			const [coeff] = extractCoeff(a);
			return coeff.numerator < 0n ? 1 : -1;
		});

		// Rebuild nested Add tree
		if (combined.length === 0) return new Num(0);
		return combined.reduce((acc, term) => new Add(acc, term));
	}
}

Expr.Add = Add;
