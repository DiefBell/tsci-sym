import { describe, expect, it } from "bun:test";
import { Pi } from "../constants/Pi";
import { Mul } from "../Mul";
import { Neg } from "../Neg";
import { Num } from "../Num";
import { Rational } from "../Rational";
import { Sym } from "../Sym";
import { Acos } from "./Acos";
import { Asin } from "./Asin";
import { Atan } from "./Atan";
import { Cos } from "./Cos";
import { Sin } from "./Sin";
import { Tan } from "./Tan";

const x = new Sym("x");

// ─── Sin ──────────────────────────────────────────────────────────────────────

describe("Sin — numeric evaluation", () => {
	it("sin(0) = 0", () => {
		expect(new Sin(new Num(0)).simplify().key()).toBe(new Num(0).key());
	});

	it("sin(1) ≈ Math.sin(1)", () => {
		expect(new Sin(new Num(1)).simplify().key()).toBe(
			new Num(Math.sin(1)).key(),
		);
	});
});

describe("Sin — special Pi angles", () => {
	it("sin(π) = 0", () => {
		expect(new Sin(Pi).simplify().key()).toBe(new Num(0).key());
	});

	it("sin(π/2) = 1", () => {
		const halfPi = new Mul(new Rational(1, 2), Pi);
		expect(new Sin(halfPi).simplify().key()).toBe(new Num(1).key());
	});

	it("sin(3π/2) = -1", () => {
		const threeHalfPi = new Mul(new Rational(3, 2), Pi);
		expect(new Sin(threeHalfPi).simplify().key()).toBe(new Num(-1).key());
	});

	it("sin(2π) = 0", () => {
		const twoPi = new Mul(new Num(2), Pi);
		expect(new Sin(twoPi).simplify().key()).toBe(new Num(0).key());
	});

	it("sin(-π/2) = -1", () => {
		const negHalfPi = new Mul(new Rational(-1, 2), Pi);
		expect(new Sin(negHalfPi).simplify().key()).toBe(new Num(-1).key());
	});
});

describe("Sin — odd function", () => {
	it("sin(-x) = -sin(x)", () => {
		const result = new Sin(new Neg(x)).simplify();
		const expected = new Neg(new Sin(x)).simplify();
		expect(result.key()).toBe(expected.key());
	});

	it("sin(-3x) = -sin(3x)", () => {
		const inner = new Mul(new Num(3), x);
		const result = new Sin(new Neg(inner)).simplify();
		const expected = new Neg(new Sin(inner)).simplify();
		expect(result.key()).toBe(expected.key());
	});
});

describe("Sin — symbolic stays symbolic", () => {
	it("sin(x) stays as Sin(x)", () => {
		expect(new Sin(x).simplify().key()).toBe(new Sin(x).key());
	});
});

// ─── Cos ──────────────────────────────────────────────────────────────────────

describe("Cos — numeric evaluation", () => {
	it("cos(0) = 1", () => {
		expect(new Cos(new Num(0)).simplify().key()).toBe(new Num(1).key());
	});

	it("cos(1) ≈ Math.cos(1)", () => {
		expect(new Cos(new Num(1)).simplify().key()).toBe(
			new Num(Math.cos(1)).key(),
		);
	});
});

describe("Cos — special Pi angles", () => {
	it("cos(π) = -1", () => {
		expect(new Cos(Pi).simplify().key()).toBe(new Num(-1).key());
	});

	it("cos(π/2) = 0", () => {
		const halfPi = new Mul(new Rational(1, 2), Pi);
		expect(new Cos(halfPi).simplify().key()).toBe(new Num(0).key());
	});

	it("cos(3π/2) = 0", () => {
		const threeHalfPi = new Mul(new Rational(3, 2), Pi);
		expect(new Cos(threeHalfPi).simplify().key()).toBe(new Num(0).key());
	});

	it("cos(2π) = 1", () => {
		const twoPi = new Mul(new Num(2), Pi);
		expect(new Cos(twoPi).simplify().key()).toBe(new Num(1).key());
	});

	it("cos(-π) = -1  (even function + integer-pi rule)", () => {
		const negPi = new Mul(new Num(-1), Pi);
		expect(new Cos(negPi).simplify().key()).toBe(new Num(-1).key());
	});
});

describe("Cos — even function", () => {
	it("cos(-x) = cos(x)", () => {
		const result = new Cos(new Neg(x)).simplify();
		expect(result.key()).toBe(new Cos(x).simplify().key());
	});
});

describe("Cos — symbolic stays symbolic", () => {
	it("cos(x) stays as Cos(x)", () => {
		expect(new Cos(x).simplify().key()).toBe(new Cos(x).key());
	});
});

// ─── Tan ──────────────────────────────────────────────────────────────────────

describe("Tan — numeric evaluation", () => {
	it("tan(0) = 0", () => {
		expect(new Tan(new Num(0)).simplify().key()).toBe(new Num(0).key());
	});

	it("tan(1) ≈ Math.tan(1)", () => {
		expect(new Tan(new Num(1)).simplify().key()).toBe(
			new Num(Math.tan(1)).key(),
		);
	});
});

describe("Tan — special Pi angles", () => {
	it("tan(π) = 0", () => {
		expect(new Tan(Pi).simplify().key()).toBe(new Num(0).key());
	});

	it("tan(2π) = 0", () => {
		const twoPi = new Mul(new Num(2), Pi);
		expect(new Tan(twoPi).simplify().key()).toBe(new Num(0).key());
	});
});

describe("Tan — odd function", () => {
	it("tan(-x) = -tan(x)", () => {
		const result = new Tan(new Neg(x)).simplify();
		const expected = new Neg(new Tan(x)).simplify();
		expect(result.key()).toBe(expected.key());
	});
});

describe("Tan — symbolic stays symbolic", () => {
	it("tan(x) stays as Tan(x)", () => {
		expect(new Tan(x).simplify().key()).toBe(new Tan(x).key());
	});
});

// ─── Asin ─────────────────────────────────────────────────────────────────────

describe("Asin — numeric evaluation", () => {
	it("asin(0) = 0", () => {
		expect(new Asin(new Num(0)).simplify().key()).toBe(new Num(0).key());
	});

	it("asin(1) = π/2  (exact)", () => {
		const result = new Asin(new Num(1)).simplify();
		const expected = new Mul(new Rational(1, 2), Pi);
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("asin(-1) = -π/2  (exact)", () => {
		const result = new Asin(new Num(-1)).simplify();
		const expected = new Mul(new Rational(-1, 2), Pi);
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("asin(0.5) ≈ Math.asin(0.5)", () => {
		expect(new Asin(new Num(0.5)).simplify().key()).toBe(
			new Num(Math.asin(0.5)).key(),
		);
	});
});

describe("Asin — odd function", () => {
	it("asin(-x) = -asin(x)", () => {
		const result = new Asin(new Neg(x)).simplify();
		const expected = new Neg(new Asin(x)).simplify();
		expect(result.key()).toBe(expected.key());
	});
});

describe("Asin — symbolic stays symbolic", () => {
	it("asin(x) stays as Asin(x)", () => {
		expect(new Asin(x).simplify().key()).toBe(new Asin(x).key());
	});
});

// ─── Acos ─────────────────────────────────────────────────────────────────────

describe("Acos — numeric evaluation", () => {
	it("acos(1) = 0", () => {
		expect(new Acos(new Num(1)).simplify().key()).toBe(new Num(0).key());
	});

	it("acos(0) = π/2  (exact)", () => {
		const result = new Acos(new Num(0)).simplify();
		const expected = new Mul(new Rational(1, 2), Pi);
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("acos(-1) = π  (exact)", () => {
		const result = new Acos(new Num(-1)).simplify();
		expect(result.key()).toBe(Pi.key());
	});

	it("acos(0.5) ≈ Math.acos(0.5)", () => {
		expect(new Acos(new Num(0.5)).simplify().key()).toBe(
			new Num(Math.acos(0.5)).key(),
		);
	});
});

describe("Acos — symbolic stays symbolic", () => {
	it("acos(x) stays as Acos(x)", () => {
		expect(new Acos(x).simplify().key()).toBe(new Acos(x).key());
	});
});

// ─── Atan ─────────────────────────────────────────────────────────────────────

describe("Atan — numeric evaluation", () => {
	it("atan(0) = 0", () => {
		expect(new Atan(new Num(0)).simplify().key()).toBe(new Num(0).key());
	});

	it("atan(1) = π/4  (exact)", () => {
		const result = new Atan(new Num(1)).simplify();
		const expected = new Mul(new Rational(1, 4), Pi);
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("atan(-1) = -π/4  (exact)", () => {
		const result = new Atan(new Num(-1)).simplify();
		const expected = new Mul(new Rational(-1, 4), Pi);
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("atan(2) ≈ Math.atan(2)", () => {
		expect(new Atan(new Num(2)).simplify().key()).toBe(
			new Num(Math.atan(2)).key(),
		);
	});
});

describe("Atan — odd function", () => {
	it("atan(-x) = -atan(x)", () => {
		const result = new Atan(new Neg(x)).simplify();
		const expected = new Neg(new Atan(x)).simplify();
		expect(result.key()).toBe(expected.key());
	});
});

describe("Atan — symbolic stays symbolic", () => {
	it("atan(x) stays as Atan(x)", () => {
		expect(new Atan(x).simplify().key()).toBe(new Atan(x).key());
	});
});
