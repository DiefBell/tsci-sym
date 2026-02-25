import { describe, expect, it } from "bun:test";
import { Mul } from "../core/Mul";
import { Neg } from "../core/Neg";
import { Num } from "../core/Num";
import { Pow } from "../core/Pow";
import { Rational } from "../core/Rational";
import { I, ImaginaryUnit } from "./I";

// ─── ImaginaryUnit atom ────────────────────────────────────────────────────────

describe("ImaginaryUnit — identity", () => {
	it("is a singleton", () => {
		expect(ImaginaryUnit.instance).toBe(I);
	});

	it("key() = 'I'", () => {
		expect(I.key()).toBe("I");
	});

	it("toString() = 'i'", () => {
		expect(I.toString()).toBe("i");
	});

	it("simplify() returns itself", () => {
		expect(I.simplify()).toBe(I);
	});
});

// ─── i^n — integer power cycle ────────────────────────────────────────────────

describe("Pow — i^n integer cycle", () => {
	it("i^0 = 1", () => {
		expect(new Pow(I, new Num(0)).simplify().key()).toBe(new Num(1).key());
	});

	it("i^1 = i", () => {
		expect(new Pow(I, new Num(1)).simplify().key()).toBe(I.key());
	});

	it("i^2 = -1", () => {
		expect(new Pow(I, new Num(2)).simplify().key()).toBe(new Num(-1).key());
	});

	it("i^3 = -i", () => {
		expect(new Pow(I, new Num(3)).simplify().key()).toBe(
			new Neg(I).simplify().key(),
		);
	});

	it("i^4 = 1 (full cycle)", () => {
		expect(new Pow(I, new Num(4)).simplify().key()).toBe(new Num(1).key());
	});

	it("i^(-1) = -i", () => {
		expect(new Pow(I, new Num(-1)).simplify().key()).toBe(
			new Neg(I).simplify().key(),
		);
	});

	it("i^(-2) = -1", () => {
		expect(new Pow(I, new Num(-2)).simplify().key()).toBe(new Num(-1).key());
	});
});

// ─── sqrt of negative numbers ─────────────────────────────────────────────────

describe("Pow — sqrt of negative numbers", () => {
	const sqrt = (n: number) => new Pow(new Num(n), new Rational(1, 2));

	it("sqrt(-1) = i", () => {
		expect(sqrt(-1).simplify().key()).toBe(I.key());
	});

	it("sqrt(-4) = 2i", () => {
		expect(sqrt(-4).simplify().key()).toBe(new Mul(new Num(2), I).key());
	});

	it("sqrt(-9) = 3i", () => {
		expect(sqrt(-9).simplify().key()).toBe(new Mul(new Num(3), I).key());
	});

	it("sqrt(-2) = sqrt(2)*i", () => {
		expect(sqrt(-2).simplify().key()).toBe(
			new Mul(new Pow(new Num(2), new Rational(1, 2)), I).key(),
		);
	});
});
