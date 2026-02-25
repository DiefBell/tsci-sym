import { Add } from "./Add";
import { Expr } from "./Expr";
import { Num } from "./Num";
import { Pow } from "./Pow";
import { Rational } from "./Rational";
import { Sym } from "./Sym";

/** Returns true if the expression is a numeric coefficient (Num or Rational). */
function isCoeff(e: Expr): e is Num | Rational {
	return e instanceof Num || e instanceof Rational;
}

/** Multiplies two coefficients, returning Num when the result is an integer, Rational otherwise. */
function mulCoeffs(a: Num | Rational, b: Num | Rational): Num | Rational {
	if (a instanceof Num && b instanceof Num) return new Num(a.value * b.value);
	const ra = a instanceof Rational ? a : new Rational(a.value);
	const rb = b instanceof Rational ? b : new Rational(b.value);
	const result = ra.mul(rb);
	return result.denominator === 1n ? new Num(Number(result.numerator)) : result;
}

export class Mul extends Expr<readonly [Expr, Expr]> {
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
		return new Mul(fn(this.left), fn(this.right));
	}

	key() {
		const factors: string[] = [];
		function collect(expr: Expr): void {
			if (expr instanceof Mul) {
				collect(expr.left);
				collect(expr.right);
			} else {
				factors.push(expr.key());
			}
		}
		collect(this);
		factors.sort();
		return `Mul[${factors.join(",")}]`;
	}

	toString() {
		if (isCoeff(this.left) && !isCoeff(this.right)) {
			if (this.left instanceof Num && this.left.value === -1)
				return `-${this.right}`;
			return `${this.left}${this.right}`;
		}
		if (isCoeff(this.right) && !isCoeff(this.left)) {
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

		// Pull coefficient to front from left: Mul(coeff, e1) * e2 → coeff * (e1 * e2)
		if (l instanceof Mul && isCoeff(l.left)) {
			return new Mul(l.left, new Mul(l.right, r).simplify()).simplify();
		}

		// Merge adjacent coefficients: coeff_a * (coeff_b * e) → (a*b) * e
		if (isCoeff(l) && r instanceof Mul && isCoeff(r.left)) {
			return new Mul(mulCoeffs(l, r.left), r.right).simplify();
		}

		// Pull coefficient to front from right: e1 * (coeff * e2) → coeff * (e1 * e2)
		if (!isCoeff(l) && r instanceof Mul && isCoeff(r.left)) {
			return new Mul(r.left, new Mul(l, r.right).simplify()).simplify();
		}

		// Canonicalize Sym order: Mul(y, x) → Mul(x, y) so like-term keys are consistent
		if (l instanceof Sym && r instanceof Sym && l.name > r.name) {
			return new Mul(r, l);
		}

		// e * e → e^2, and power combination rules (guard: numeric * numeric handled below)
		if (!isCoeff(l) && l.key() === r.key()) return new Pow(l, new Num(2));

		if (l instanceof Pow && l.base.key() === r.key())
			return new Pow(
				l.base,
				new Add(l.exponent, new Num(1)).simplify(),
			).simplify();

		if (r instanceof Pow && r.base.key() === l.key())
			return new Pow(l, new Add(r.exponent, new Num(1)).simplify()).simplify();

		if (l instanceof Pow && r instanceof Pow && l.base.key() === r.base.key())
			return new Pow(
				l.base,
				new Add(l.exponent, r.exponent).simplify(),
			).simplify();

		if (
			(l instanceof Num && l.value === 0) ||
			(r instanceof Num && r.value === 0)
		)
			return new Num(0);

		// multiply by 1
		if (l instanceof Num && l.value === 1) return r;
		if (r instanceof Num && r.value === 1) return l;
		if (l instanceof Rational && l.numerator === 1n && l.denominator === 1n)
			return r;
		if (r instanceof Rational && r.numerator === 1n && r.denominator === 1n)
			return l;

		// coefficient * coefficient folding
		if (isCoeff(l) && isCoeff(r)) return mulCoeffs(l, r);

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

		// Return a new Mul with simplified children so key() reflects them.
		// (Returning `this` would preserve unsimplified left/right in the node.)
		if (l === this.left && r === this.right) return this;
		return new Mul(l, r);
	}
}

Expr.Mul = Mul;
