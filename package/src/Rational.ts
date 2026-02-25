import { Expr } from "./Expr";
import { Num } from "./Num";

/** Greatest Common Divisor via the Euclidean algorithm. Used to reduce fractions to lowest terms. */
function gcd(a: bigint, b: bigint): bigint {
	if (a < 0n) a = -a;
	if (b < 0n) b = -b;
	while (b) [a, b] = [b, a % b];
	return a;
}

export class Rational extends Expr<readonly []> {
	static readonly #cache = new Map<string, Rational>();

	readonly numerator!: bigint;
	readonly denominator!: bigint;

	constructor(numerator: number | bigint, denominator: number | bigint = 1) {
		super();

		let p = BigInt(numerator);
		let q = BigInt(denominator);

		if (q === 0n) throw new Error("Rational: denominator cannot be zero");

		// Normalize sign to numerator
		if (q < 0n) {
			p = -p;
			q = -q;
		}

		const g = gcd(p < 0n ? -p : p, q);
		p = p / g;
		q = q / g;

		const cached = Rational.#cache.get(`${p},${q}`);
		// biome-ignore lint/correctness/noConstructorReturn: we need caching
		if (cached) return cached;

		this.numerator = p;
		this.denominator = q;
		Rational.#cache.set(`${p},${q}`, this);
	}

	toString() {
		if (this.denominator === 1n) return `${this.numerator}`;
		return `${this.numerator}/${this.denominator}`;
	}

	key() {
		return `Rational(${this.numerator},${this.denominator})`;
	}

	get args(): readonly [] {
		return [];
	}
	map(_fn: (e: Expr) => Expr): Expr {
		return this;
	}

	simplify(): Expr {
		if (this.denominator === 1n) return new Num(Number(this.numerator));
		return this;
	}

	add(other: Rational): Rational {
		return new Rational(
			this.numerator * other.denominator + other.numerator * this.denominator,
			this.denominator * other.denominator,
		);
	}

	mul(other: Rational): Rational {
		return new Rational(
			this.numerator * other.numerator,
			this.denominator * other.denominator,
		);
	}

	neg(): Rational {
		return new Rational(-this.numerator, this.denominator);
	}
}

Expr.Rational = Rational;
