import { Add } from "./Add";
import { Expr } from "./Expr";
import { Num } from "./Num";
import { Pow } from "./Pow";

export class Mul extends Expr {
	constructor(
		public left: Expr,
		public right: Expr,
	) {
		super();
	}

	toString() {
		return `(${this.left} * ${this.right})`;
	}

	simplify(): Expr {
		const l = this.left.simplify();
		const r = this.right.simplify();

		// Powers to two Syms
		if (l === r) return new Pow(l, new Num(2));

		if (l instanceof Pow && l.base === r)
			// always use base from left operand
			// (is this correct to do? We ideally want semantically
			// identical expressions to eventually simplify to a single instance)
			return new Pow(l.base, new Add(l.exponent, new Num(1)));

		if (r instanceof Pow && r.base === l)
			// always use base from left operand
			return new Pow(l, new Add(r.exponent, new Num(1)));

		// Bases might not be strictly equal as they're not symbols,
		// do we need some way to check if they're essentially the same?
		if (r instanceof Pow && l instanceof Pow && r.base === l.base)
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

		// distribute over Add: (a + b)*c => a*c + b*c
		if (l instanceof Add) {
			return new Add(new Mul(l.left, r), new Mul(l.right, r)).simplify();
		}
		if (r instanceof Add) {
			return new Add(new Mul(l, r.left), new Mul(l, r.right)).simplify();
		}

		return new Mul(l, r);
	}
}

Expr.Mul = Mul;
