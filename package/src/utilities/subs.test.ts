import { describe, expect, it } from "bun:test";
import { E, Pi } from "../constants";
import { I } from "../constants/I";
import { Add } from "../core/Add";
import { Mul } from "../core/Mul";
import { Num } from "../core/Num";
import { Pow } from "../core/Pow";
import { Rational } from "../core/Rational";
import { Sym } from "../core/Sym";
import { Sin } from "../functions/Sin";
import { evalf } from "./evalf";
import { subs } from "./subs";

const x = new Sym("x");
const y = new Sym("y");

// ─── subs ─────────────────────────────────────────────────────────────────────

describe("subs — basic substitution", () => {
	it("replaces the target symbol", () => {
		const result = subs(x, new Map([[x, new Num(3)]]));
		expect(result.key()).toBe(new Num(3).key());
	});

	it("leaves unrelated symbols unchanged", () => {
		const result = subs(x, new Map([[y, new Num(1)]]));
		expect(result.key()).toBe(x.key());
	});

	it("substitutes and simplifies arithmetic: x + 1 with x=3 → 4", () => {
		const expr = new Add(x, new Num(1));
		const result = subs(expr, new Map([[x, new Num(3)]]));
		expect(result.key()).toBe(new Num(4).key());
	});

	it("substitutes inside functions: sin(x) with x=Pi → 0", () => {
		const result = subs(new Sin(x), new Map([[x, Pi]]));
		expect(result.key()).toBe(new Num(0).key());
	});

	it("substitutes a symbol with another symbol", () => {
		const expr = new Pow(x, new Num(2));
		const result = subs(expr, new Map([[x, y]]));
		expect(result.key()).toBe(new Pow(y, new Num(2)).key());
	});

	it("substitutes multiple symbols simultaneously", () => {
		// x + y with x=1, y=2 → 3
		const expr = new Add(x, y);
		const result = subs(
			expr,
			new Map([
				[x, new Num(1)],
				[y, new Num(2)],
			]),
		);
		expect(result.key()).toBe(new Num(3).key());
	});

	it("partial substitution leaves remaining symbols intact", () => {
		// 2x + y with x=3 → 6 + y
		const expr = new Add(new Mul(new Num(2), x), y);
		const result = subs(expr, new Map([[x, new Num(3)]]));
		expect(result.key()).toBe(new Add(new Num(6), y).simplify().key());
	});

	it("no-op on constants", () => {
		expect(subs(Pi, new Map([[x, new Num(1)]])).key()).toBe(Pi.key());
		expect(subs(new Num(5), new Map([[x, new Num(1)]])).key()).toBe(
			new Num(5).key(),
		);
	});

	it("rational result: 3x with x=1/3 → 1", () => {
		const result = subs(
			new Mul(new Num(3), x),
			new Map([[x, new Rational(1, 3)]]),
		);
		expect(result.key()).toBe(new Num(1).key());
	});
});

// ─── evalf ────────────────────────────────────────────────────────────────────

describe("evalf — numeric evaluation", () => {
	it("evaluates a plain Num", () => {
		expect(evalf(new Num(42))).toBe(42);
	});

	it("evaluates a Rational", () => {
		expect(evalf(new Rational(1, 4))).toBe(0.25);
	});

	it("evaluates Pi to Math.PI", () => {
		expect(evalf(Pi)).toBe(Math.PI);
	});

	it("evaluates E to Math.E", () => {
		expect(evalf(E)).toBe(Math.E);
	});

	it("evaluates Pi + E", () => {
		expect(evalf(new Add(Pi, E))).toBeCloseTo(Math.PI + Math.E);
	});

	it("evaluates 2 * Pi", () => {
		expect(evalf(new Mul(new Num(2), Pi))).toBeCloseTo(2 * Math.PI);
	});

	it("evaluates sin(Pi) → 0", () => {
		expect(evalf(new Sin(Pi))).toBe(0);
	});

	it("substitutes symbol and evaluates: x² + 1 with x=3 → 10", () => {
		const expr = new Add(new Pow(x, new Num(2)), new Num(1));
		expect(evalf(expr, new Map([[x, 3]]))).toBe(10);
	});

	it("substitutes multiple symbols: x + y with x=1.5, y=2.5 → 4", () => {
		const expr = new Add(x, y);
		expect(
			evalf(
				expr,
				new Map([
					[x, 1.5],
					[y, 2.5],
				]),
			),
		).toBe(4);
	});

	it("throws on unbound symbol", () => {
		expect(() => evalf(x)).toThrow("Unbound symbol: x");
	});

	it("throws on imaginary unit", () => {
		expect(() => evalf(I)).toThrow("imaginary unit");
	});
});
