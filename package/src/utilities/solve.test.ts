import { describe, expect, it } from "bun:test";
import { Add } from "../core/Add";
import { Mul } from "../core/Mul";
import { Neg } from "../core/Neg";
import { Num } from "../core/Num";
import { Pow } from "../core/Pow";
import { Rational } from "../core/Rational";
import { Sym } from "../core/Sym";
import { Sin } from "../functions/Sin";
import { solve } from "./solve";

const x = new Sym("x");
const y = new Sym("y");

// ─── Degenerate / no solution ─────────────────────────────────────────────────

describe("solve — degenerate cases", () => {
	it("constant expression returns []", () => {
		expect(solve(new Num(5), x)).toHaveLength(0);
	});

	it("expression with no sym returns []", () => {
		expect(solve(new Add(new Num(3), new Num(4)), x)).toHaveLength(0);
	});

	it("unrelated symbol returns []", () => {
		expect(solve(y, x)).toHaveLength(0);
	});

	it("non-linear (x²) returns []", () => {
		expect(solve(new Pow(x, new Num(2)), x)).toHaveLength(0);
	});

	it("transcendental (sin(x)) returns []", () => {
		expect(solve(new Sin(x), x)).toHaveLength(0);
	});
});

// ─── Linear — single solution ─────────────────────────────────────────────────

describe("solve — linear equations", () => {
	it("x = 0  →  x = 0", () => {
		const [sol] = solve(x, x);
		expect(sol?.key()).toBe(new Num(0).key());
	});

	it("x + 5 = 0  →  x = -5", () => {
		const [sol] = solve(new Add(x, new Num(5)), x);
		expect(sol?.key()).toBe(new Num(-5).key());
	});

	it("x - 3 = 0  →  x = 3", () => {
		const [sol] = solve(new Add(x, new Num(-3)), x);
		expect(sol?.key()).toBe(new Num(3).key());
	});

	it("2x + 4 = 0  →  x = -2", () => {
		const [sol] = solve(new Add(new Mul(new Num(2), x), new Num(4)), x);
		expect(sol?.key()).toBe(new Num(-2).key());
	});

	it("3x - 1 = 0  →  x = 1/3", () => {
		const [sol] = solve(new Add(new Mul(new Num(3), x), new Num(-1)), x);
		expect(sol?.key()).toBe(new Rational(1, 3).key());
	});

	it("-x + 7 = 0  →  x = 7", () => {
		const [sol] = solve(new Add(new Neg(x), new Num(7)), x);
		expect(sol?.key()).toBe(new Num(7).key());
	});

	it("2x = 0  →  x = 0", () => {
		const [sol] = solve(new Mul(new Num(2), x), x);
		expect(sol?.key()).toBe(new Num(0).key());
	});
});

// ─── Pre-simplification of like terms ────────────────────────────────────────

describe("solve — pre-simplification", () => {
	it("2x + 3x + 1 = 0  →  x = -1/5", () => {
		const expr = new Add(
			new Add(new Mul(new Num(2), x), new Mul(new Num(3), x)),
			new Num(1),
		);
		const [sol] = solve(expr, x);
		expect(sol?.key()).toBe(new Rational(-1, 5).key());
	});

	it("x + x + x = 0  →  x = 0", () => {
		const expr = new Add(new Add(x, x), x);
		const [sol] = solve(expr, x);
		expect(sol?.key()).toBe(new Num(0).key());
	});
});

// ─── Symbolic coefficients ────────────────────────────────────────────────────

describe("solve — symbolic coefficients", () => {
	it("x + y = 0 for x  →  x = -y", () => {
		const [sol] = solve(new Add(x, y), x);
		expect(sol?.key()).toBe(new Neg(y).simplify().key());
	});

	it("returns exactly one solution for linear equations", () => {
		expect(solve(new Add(x, new Num(1)), x)).toHaveLength(1);
	});
});
