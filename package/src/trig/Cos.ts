import { Expr } from "../Expr";
import { Num } from "../Num";
import { isNegated, piCoeff, stripNeg } from "./utils";

/**
 * Cosine function: cos(inner).
 *
 * Simplifications applied:
 *   cos(Num n)         → Num(Math.cos(n))       numeric evaluation
 *   cos(2kπ)           → 1                       even integer multiples
 *   cos((2k+1)π)       → -1                      odd integer multiples
 *   cos(π/2 + kπ)      → 0                       half-integer multiples
 *   cos(-u)            → cos(u)                  even function
 */
export class Cos extends Expr<readonly [Expr]> {
	constructor(public readonly inner: Expr) {
		super();
	}

	get args(): readonly [Expr] {
		return [this.inner];
	}
	map(fn: (e: Expr) => Expr): Expr {
		return new Cos(fn(this.inner));
	}

	key() {
		return `Cos(${this.inner.key()})`;
	}

	toString() {
		return `cos(${this.inner})`;
	}

	protected _simplify(): Expr {
		const inner = this.inner.simplify();

		// Numeric evaluation
		if (inner instanceof Num) return new Num(Math.cos(inner.value));

		// Special Pi-multiple angles
		const pc = piCoeff(inner);
		if (pc !== null) {
			const [num, den] = pc;
			// cos(nπ) = (-1)^n  for integer n
			if (num % den === 0n) {
				const n = num / den;
				const mod2 = ((n % 2n) + 2n) % 2n;
				return new Num(mod2 === 0n ? 1 : -1);
			}
			// Reduce to k * (π/2) units and check mod 4
			if ((num * 2n) % den === 0n) {
				const halfPis = (num * 2n) / den;
				const mod4 = ((halfPis % 4n) + 4n) % 4n;
				if (mod4 === 1n || mod4 === 3n) return new Num(0); // cos(π/2), cos(3π/2)
				if (mod4 === 0n) return new Num(1); // cos(0)
				if (mod4 === 2n) return new Num(-1); // cos(π)
			}
		}

		// Even function: cos(-u) = cos(u)
		if (isNegated(inner)) {
			return new Cos(stripNeg(inner)).simplify();
		}

		return new Cos(inner);
	}
}
