import { describe, expect, it } from "bun:test";
import { Abs } from "../Abs";
import { Add } from "../Add";
import { E } from "../constants/E";
import { Pi } from "../constants/Pi";
import { Log } from "../Log";
import { Mul } from "../Mul";
import { Neg } from "../Neg";
import { Num } from "../Num";
import { Pow } from "../Pow";
import { Rational } from "../Rational";
import { Sym } from "../Sym";
import { diff } from "./diff";

const x = new Sym("x");
const y = new Sym("y");

describe("diff — atoms", () => {
	it("d/dx(x) = 1", () => {
		expect(diff(x, x).key()).toBe(new Num(1).key());
	});

	it("d/dx(y) = 0  (unrelated symbol)", () => {
		expect(diff(y, x).key()).toBe(new Num(0).key());
	});

	it("d/dx(3) = 0", () => {
		expect(diff(new Num(3), x).key()).toBe(new Num(0).key());
	});

	it("d/dx(Rational(1,2)) = 0", () => {
		expect(diff(new Rational(1, 2), x).key()).toBe(new Num(0).key());
	});

	it("d/dx(E) = 0", () => {
		expect(diff(E, x).key()).toBe(new Num(0).key());
	});

	it("d/dx(Pi) = 0", () => {
		expect(diff(Pi, x).key()).toBe(new Num(0).key());
	});
});

describe("diff — Neg", () => {
	it("d/dx(-x) = -1", () => {
		expect(diff(new Neg(x), x).key()).toBe(new Num(-1).key());
	});

	it("d/dx(-y) = 0", () => {
		expect(diff(new Neg(y), x).key()).toBe(new Num(0).key());
	});
});

describe("diff — Add (sum rule)", () => {
	it("d/dx(x + y) = 1", () => {
		expect(diff(new Add(x, y), x).key()).toBe(new Num(1).key());
	});

	it("d/dx(x + x) = 2", () => {
		expect(diff(new Add(x, x), x).key()).toBe(new Num(2).key());
	});

	it("d/dx(x + 5) = 1", () => {
		expect(diff(new Add(x, new Num(5)), x).key()).toBe(new Num(1).key());
	});
});

describe("diff — Mul (product rule)", () => {
	it("d/dx(3x) = 3", () => {
		expect(diff(new Mul(new Num(3), x), x).key()).toBe(new Num(3).key());
	});

	it("d/dx(x·y) = y  (y treated as constant)", () => {
		expect(diff(new Mul(x, y), x).key()).toBe(y.key());
	});

	it("d/dx(x·x) = 2x", () => {
		const result = diff(new Mul(x, x), x).key();
		const expected = new Mul(new Num(2), x).key();
		expect(result).toBe(expected);
	});
});

describe("diff — Pow (power rule)", () => {
	it("d/dx(x^2) = 2x", () => {
		const result = diff(new Pow(x, new Num(2)), x);
		expect(result.key()).toBe(new Mul(new Num(2), x).key());
	});

	it("d/dx(x^3) = 3x^2", () => {
		const result = diff(new Pow(x, new Num(3)), x);
		expect(result.key()).toBe(new Mul(new Num(3), new Pow(x, new Num(2))).key());
	});

	it("d/dx(x^1) = 1", () => {
		expect(diff(new Pow(x, new Num(1)), x).key()).toBe(new Num(1).key());
	});

	it("d/dx(x^0) = 0", () => {
		expect(diff(new Pow(x, new Num(0)), x).key()).toBe(new Num(0).key());
	});

	it("d/dx(5^x) = 5^x · ln(5)", () => {
		const result = diff(new Pow(new Num(5), x), x);
		const expected = new Mul(new Pow(new Num(5), x), new Log(new Num(5)));
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("d/dx(e^x) = e^x", () => {
		const ex = new Pow(E, x);
		expect(diff(ex, x).key()).toBe(ex.key());
	});
});

describe("diff — Log", () => {
	it("d/dx(ln x) = x^(-1)", () => {
		const result = diff(new Log(x), x);
		expect(result.key()).toBe(new Pow(x, new Num(-1)).key());
	});

	it("d/dx(ln(x^2)) = 2·x^(-1)", () => {
		const result = diff(new Log(new Pow(x, new Num(2))), x);
		expect(result.key()).toBe(
			new Mul(new Num(2), new Pow(x, new Num(-1))).key(),
		);
	});

	it("d/dx(ln(3x)) = 3·(3x)^(-1)", () => {
		// Full reduction to x^(-1) requires Pow(Mul(a,b),n) distribution, not yet implemented.
		const result = diff(new Log(new Mul(new Num(3), x)), x);
		const expected = new Mul(new Num(3), new Pow(new Mul(new Num(3), x), new Num(-1)));
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("diff — Abs", () => {
	it("d/dx(|x|) = x·|x|^(-1)", () => {
		const absX = new Abs(x);
		const result = diff(absX, x);
		const expected = new Mul(x, new Pow(absX, new Num(-1)));
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("diff — chain rule via composition", () => {
	it("d/dx(ln(3x)) chains correctly through Mul and Log", () => {
		// ln(3x)' = (3x)'/(3x) = 3/(3x); full reduction to 1/x needs Pow(Mul,n) distribution.
		const result = diff(new Log(new Mul(new Num(3), x)), x);
		const expected = new Mul(new Num(3), new Pow(new Mul(new Num(3), x), new Num(-1)));
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("d/dx(x^2 + 3x + 1) = 2x + 3", () => {
		const poly = new Add(new Add(new Pow(x, new Num(2)), new Mul(new Num(3), x)), new Num(1));
		const result = diff(poly, x);
		const expected = new Add(new Mul(new Num(2), x), new Num(3));
		expect(result.key()).toBe(expected.simplify().key());
	});
});
