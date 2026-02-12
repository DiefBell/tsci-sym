import { Add } from "./Add";
import { Expr } from "./Expr";
import { Num } from "./Num";
import { Pow } from "./Pow";
import { Sym } from "./Sym";

export class Mul extends Expr {
	constructor(
		public left: Expr,
		public right: Expr,
	) {
		super();
	}

	key() {
		return `Mul(${this.left.key()},${this.right.key()})`;
	}

	toString() {
		if (this.left instanceof Num && !(this.right instanceof Num)) {
			if (this.left.value === -1) return `-${this.right}`;
			return `${this.left}${this.right}`;
		}
		if (this.right instanceof Num && !(this.left instanceof Num)) {
			return `${this.right}${this.left}`;
		}
		if (this.left instanceof Sym && this.right instanceof Sym) {
			return `${this.left}${this.right}`;
		}

		return `(${this.left} * ${this.right})`;
	}

	simplify(): Expr {
		const l = this.left.simplify();
		const r = this.right.simplify();

		// Pull coefficient to front from left: Mul(Num(a), e1) * e2 → Num(a) * (e1 * e2)
		if (l instanceof Mul && l.left instanceof Num) {
			return new Mul(l.left, new Mul(l.right, r).simplify()).simplify();
		}

		// Merge adjacent numeric coefficients: Num(a) * (Num(b) * e) → Num(a*b) * e
		if (l instanceof Num && r instanceof Mul && r.left instanceof Num) {
			return new Mul(new Num(l.value * r.left.value), r.right).simplify();
		}

		// Pull coefficient to front from right: e1 * (Num(a) * e2) → Num(a) * (e1 * e2)
		if (!(l instanceof Num) && r instanceof Mul && r.left instanceof Num) {
			return new Mul(r.left, new Mul(l, r.right).simplify()).simplify();
		}

		// Canonicalize Sym order: Mul(y, x) → Mul(x, y) so like-term keys are consistent
		if (l instanceof Sym && r instanceof Sym && l.name > r.name) {
			return new Mul(r, l);
		}

		// e * e → e^2, and power combination rules
		if (l.key() === r.key()) return new Pow(l, new Num(2));

		if (l instanceof Pow && l.base.key() === r.key())
			return new Pow(l.base, new Add(l.exponent, new Num(1)));

		if (r instanceof Pow && r.base.key() === l.key())
			return new Pow(l, new Add(r.exponent, new Num(1)));

		if (l instanceof Pow && r instanceof Pow && l.base.key() === r.base.key())
			return new Pow(l.base, new Add(l.exponent, r.exponent));

		if (
			(l instanceof Num && l.value === 0) ||
			(r instanceof Num && r.value === 0)
		)
			// multiply by 0
			return new Num(0);

		// multiply by 1
		if (l instanceof Num && l.value === 1) return r;
		if (r instanceof Num && r.value === 1) return l;

		// numeric folding
		if (l instanceof Num && r instanceof Num) return new Num(l.value * r.value);

		if (l instanceof Mul) {
			if (l.left.key() === r.key()) {
				return new Mul(new Pow(l.left, new Num(2)), l.right).simplify();
			}
			if (l.right.key() === r.key()) {
				return new Mul(l.left, new Pow(l.right, new Num(2))).simplify();
			}
		}
		if (r instanceof Mul) {
			if (r.left.key() === l.key()) {
				return new Mul(new Pow(r.left, new Num(2)), r.right).simplify();
			}
			if (r.right.key() === l.key()) {
				return new Mul(r.left, new Pow(r.right, new Num(2))).simplify();
			}
		}

		// distribute over Add: (a + b)*c => a*c + b*c
		if (l instanceof Add) {
			return new Add(new Mul(l.left, r), new Mul(l.right, r)).simplify();
		}
		if (r instanceof Add) {
			return new Add(new Mul(l, r.left), new Mul(l, r.right)).simplify();
		}

		return this;
	}
}

Expr.Mul = Mul;
