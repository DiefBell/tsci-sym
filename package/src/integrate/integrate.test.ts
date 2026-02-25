import { describe, expect, it } from "bun:test";
import { Abs } from "../Abs";
import { Add } from "../Add";
import { E } from "../constants/E";
import { Log } from "../Log";
import { Mul } from "../Mul";
import { Neg } from "../Neg";
import { Num } from "../Num";
import { Pow } from "../Pow";
import { Rational } from "../Rational";
import { Sym } from "../Sym";
import { Acos } from "../trig/Acos";
import { Asin } from "../trig/Asin";
import { Atan } from "../trig/Atan";
import { Cos } from "../trig/Cos";
import { Sin } from "../trig/Sin";
import { Tan } from "../trig/Tan";
import { integrate } from "./integrate";

const x = new Sym("x");
const a = new Sym("a"); // symbolic constant used as base

describe("integrate — constants", () => {
	it("∫ 1 dx = x", () => {
		expect(integrate(new Num(1), x).key()).toBe(x.key());
	});

	it("∫ 5 dx = 5x", () => {
		expect(integrate(new Num(5), x).key()).toBe(
			new Mul(new Num(5), x).simplify().key(),
		);
	});

	it("∫ y dx = xy  (y is constant w.r.t. x)", () => {
		const y = new Sym("y");
		expect(integrate(y, x).key()).toBe(new Mul(y, x).simplify().key());
	});

	it("∫ Rational(3,2) dx = (3/2)x", () => {
		expect(integrate(new Rational(3, 2), x).key()).toBe(
			new Mul(new Rational(3, 2), x).simplify().key(),
		);
	});
});

describe("integrate — sum rule (Add)", () => {
	it("∫ (x + 1) dx = x²/2 + x", () => {
		const result = integrate(new Add(x, new Num(1)), x);
		const expected = new Add(
			new Mul(new Rational(1, 2), new Pow(x, new Num(2))),
			x,
		);
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ (x² + x) dx = x³/3 + x²/2", () => {
		const result = integrate(new Add(new Pow(x, new Num(2)), x), x);
		const expected = new Add(
			new Mul(new Rational(1, 3), new Pow(x, new Num(3))),
			new Mul(new Rational(1, 2), new Pow(x, new Num(2))),
		);
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ (x² + 3x + 1) dx = x³/3 + 3x²/2 + x", () => {
		const poly = new Add(
			new Add(new Pow(x, new Num(2)), new Mul(new Num(3), x)),
			new Num(1),
		);
		const result = integrate(poly, x);
		const expected = new Add(
			new Add(
				new Mul(new Rational(1, 3), new Pow(x, new Num(3))),
				new Mul(new Rational(3, 2), new Pow(x, new Num(2))),
			),
			x,
		);
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("integrate — constant multiple", () => {
	it("∫ 3x dx = (3/2)x²", () => {
		const result = integrate(new Mul(new Num(3), x), x);
		const expected = new Mul(new Rational(3, 2), new Pow(x, new Num(2)));
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ -x dx = -(1/2)x²", () => {
		// Neg(x).simplify() → Mul(-1, x), handled by constantMultRule
		const result = integrate(new Neg(x), x);
		const expected = new Mul(new Rational(-1, 2), new Pow(x, new Num(2)));
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("integrate — power rule", () => {
	it("∫ x dx = x²/2", () => {
		expect(integrate(x, x).key()).toBe(
			new Mul(new Rational(1, 2), new Pow(x, new Num(2))).simplify().key(),
		);
	});

	it("∫ x² dx = x³/3", () => {
		expect(integrate(new Pow(x, new Num(2)), x).key()).toBe(
			new Mul(new Rational(1, 3), new Pow(x, new Num(3))).simplify().key(),
		);
	});

	it("∫ x³ dx = x⁴/4", () => {
		expect(integrate(new Pow(x, new Num(3)), x).key()).toBe(
			new Mul(new Rational(1, 4), new Pow(x, new Num(4))).simplify().key(),
		);
	});

	it("∫ x^(-2) dx = -x^(-1)", () => {
		expect(integrate(new Pow(x, new Num(-2)), x).key()).toBe(
			new Mul(new Num(-1), new Pow(x, new Num(-1))).simplify().key(),
		);
	});

	it("∫ x^(1/2) dx = (2/3)·x^(3/2)", () => {
		expect(integrate(new Pow(x, new Rational(1, 2)), x).key()).toBe(
			new Mul(new Rational(2, 3), new Pow(x, new Rational(3, 2)))
				.simplify()
				.key(),
		);
	});
});

describe("integrate — reciprocal rule", () => {
	it("∫ x^(-1) dx = ln(x)", () => {
		expect(integrate(new Pow(x, new Num(-1)), x).key()).toBe(new Log(x).key());
	});
});

describe("integrate — exponential", () => {
	it("∫ e^x dx = e^x", () => {
		const ex = new Pow(E, x);
		expect(integrate(ex, x).key()).toBe(ex.simplify().key());
	});

	it("∫ a^x dx = a^x / ln(a)  (symbolic constant base)", () => {
		const ax = new Pow(a, x);
		const result = integrate(ax, x);
		const expected = new Mul(ax, new Pow(new Log(a), new Num(-1)));
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("integrate — log rule (by parts)", () => {
	it("∫ ln(x) dx = x·ln(x) − x", () => {
		const result = integrate(new Log(x), x);
		const expected = new Add(new Mul(x, new Log(x)), new Neg(x));
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("integrate — u-substitution", () => {
	it("∫ 2x·(x²+1)³ dx = (1/4)·(x²+1)⁴", () => {
		const g = new Add(new Pow(x, new Num(2)), new Num(1));
		const expr = new Mul(new Mul(new Num(2), x), new Pow(g, new Num(3)));
		const result = integrate(expr, x);
		const expected = new Mul(new Rational(1, 4), new Pow(g, new Num(4)));
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ x·(x²+1)³ dx = (1/8)·(x²+1)⁴", () => {
		const g = new Add(new Pow(x, new Num(2)), new Num(1));
		const expr = new Mul(x, new Pow(g, new Num(3)));
		const result = integrate(expr, x);
		const expected = new Mul(new Rational(1, 8), new Pow(g, new Num(4)));
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ e^(x²)·2x dx = e^(x²)", () => {
		const g = new Pow(x, new Num(2));
		const expr = new Mul(new Pow(E, g), new Mul(new Num(2), x));
		const result = integrate(expr, x);
		const expected = new Pow(E, g);
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ (3x+1)^5 dx = (1/18)·(3x+1)^6", () => {
		const g = new Add(new Mul(new Num(3), x), new Num(1));
		const result = integrate(new Pow(g, new Num(5)), x);
		const expected = new Mul(new Rational(1, 18), new Pow(g, new Num(6)));
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ ln(x)/x dx = (1/2)·ln(x)²  via u=ln(x), g'=1/x", () => {
		// Integrand: Log(x) * Pow(x, -1)
		const expr = new Mul(new Log(x), new Pow(x, new Num(-1)));
		const result = integrate(expr, x);
		const expected = new Mul(
			new Rational(1, 2),
			new Pow(new Log(x), new Num(2)),
		);
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("integrate — sin rule", () => {
	it("∫ sin(x) dx = -cos(x)", () => {
		const result = integrate(new Sin(x), x);
		const expected = new Neg(new Cos(x));
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ sin(3x) dx = -(1/3)·cos(3x)  via u-sub", () => {
		const inner = new Mul(new Num(3), x);
		const result = integrate(new Sin(inner), x);
		const expected = new Mul(new Rational(-1, 3), new Cos(inner));
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ sin(x²)·2x dx = -cos(x²)  via u-sub", () => {
		const x2 = new Pow(x, new Num(2));
		const expr = new Mul(new Sin(x2), new Mul(new Num(2), x));
		const result = integrate(expr, x);
		const expected = new Neg(new Cos(x2));
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("integrate — cos rule", () => {
	it("∫ cos(x) dx = sin(x)", () => {
		const result = integrate(new Cos(x), x);
		expect(result.key()).toBe(new Sin(x).key());
	});

	it("∫ cos(3x) dx = (1/3)·sin(3x)  via u-sub", () => {
		const inner = new Mul(new Num(3), x);
		const result = integrate(new Cos(inner), x);
		const expected = new Mul(new Rational(1, 3), new Sin(inner));
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ cos(x²)·2x dx = sin(x²)  via u-sub", () => {
		const x2 = new Pow(x, new Num(2));
		const expr = new Mul(new Cos(x2), new Mul(new Num(2), x));
		const result = integrate(expr, x);
		expect(result.key()).toBe(new Sin(x2).simplify().key());
	});
});

describe("integrate — tan rule", () => {
	it("∫ tan(x) dx = -ln|cos(x)|", () => {
		const result = integrate(new Tan(x), x);
		const expected = new Neg(new Log(new Abs(new Cos(x))));
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("integrate — asin rule", () => {
	it("∫ asin(x) dx = x·asin(x) + √(1−x²)", () => {
		const result = integrate(new Asin(x), x);
		const radical = new Pow(
			new Add(new Num(1), new Mul(new Num(-1), new Pow(x, new Num(2)))),
			new Rational(1, 2),
		);
		const expected = new Add(new Mul(x, new Asin(x)), radical);
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("integrate — acos rule", () => {
	it("∫ acos(x) dx = x·acos(x) − √(1−x²)", () => {
		const result = integrate(new Acos(x), x);
		const radical = new Pow(
			new Add(new Num(1), new Mul(new Num(-1), new Pow(x, new Num(2)))),
			new Rational(1, 2),
		);
		const expected = new Add(new Mul(x, new Acos(x)), new Neg(radical));
		expect(result.key()).toBe(expected.simplify().key());
	});
});

describe("integrate — atan rule", () => {
	it("∫ atan(x) dx = x·atan(x) − (1/2)·ln(1+x²)", () => {
		const result = integrate(new Atan(x), x);
		const logTerm = new Mul(
			new Rational(1, 2),
			new Log(new Add(new Num(1), new Pow(x, new Num(2)))),
		);
		const expected = new Add(new Mul(x, new Atan(x)), new Neg(logTerm));
		expect(result.key()).toBe(expected.simplify().key());
	});

	it("∫ atan(2x) dx via u-sub", () => {
		// u-sub: g=2x, g'=2; ∫ atan(u) du/2 = (1/2)[u·atan(u) − (1/2)ln(1+u²)]
		const inner = new Mul(new Num(2), x);
		const result = integrate(new Atan(inner), x);
		const logTerm = new Mul(
			new Rational(1, 2),
			new Log(new Add(new Num(1), new Pow(inner, new Num(2)))),
		);
		const expected = new Mul(
			new Rational(1, 2),
			new Add(new Mul(inner, new Atan(inner)), new Neg(logTerm)),
		);
		expect(result.key()).toBe(expected.simplify().key());
	});
});
