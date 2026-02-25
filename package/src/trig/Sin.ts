import { Expr } from "../Expr";
import { Neg } from "../Neg";
import { Num } from "../Num";
import { isNegated, piCoeff, stripNeg } from "./utils";

/**
 * Sine function: sin(inner).
 *
 * Simplifications applied:
 *   sin(Num n)         → Num(Math.sin(n))       numeric evaluation
 *   sin(n·π)           → 0                       integer n
 *   sin(π/2 + 2kπ)    → 1
 *   sin(3π/2 + 2kπ)   → -1
 *   sin(-u)            → -sin(u)                 odd function
 */
export class Sin extends Expr<readonly [Expr]> {
	constructor(public readonly inner: Expr) {
		super();
	}

	get args(): readonly [Expr] {
		return [this.inner];
	}
	map(fn: (e: Expr) => Expr): Expr {
		return new Sin(fn(this.inner));
	}

	key() {
		return `Sin(${this.inner.key()})`;
	}

	toString() {
		return `sin(${this.inner})`;
	}

	protected _simplify(): Expr {
		const inner = this.inner.simplify();

		// Numeric evaluation
		if (inner instanceof Num) return new Num(Math.sin(inner.value));

		// Special Pi-multiple angles
		const pc = piCoeff(inner);
		if (pc !== null) {
			const [num, den] = pc;
			// sin(nπ) = 0  for integer n
			if (num % den === 0n) return new Num(0);
			// Reduce to k * (π/2) units and check mod 4
			if ((num * 2n) % den === 0n) {
				const halfPis = (num * 2n) / den;
				const mod4 = ((halfPis % 4n) + 4n) % 4n;
				if (mod4 === 0n || mod4 === 2n) return new Num(0);
				if (mod4 === 1n) return new Num(1);
				if (mod4 === 3n) return new Num(-1);
			}
		}

		// Odd function: sin(-u) = -sin(u)
		if (isNegated(inner)) {
			return new Neg(new Sin(stripNeg(inner))).simplify();
		}

		return new Sin(inner);
	}
}
