import { describe, expect, it } from "bun:test";
import { Add } from "./Add";
import { Mul } from "./Mul";
import { Neg } from "./Neg";
import { Num } from "./Num";
import { Rational } from "./Rational";
import { Sym } from "./Sym";

const x = new Sym("x");
const y = new Sym("y");
const z = new Sym("z");

describe("Add.key()", () => {
	it("produces a sorted bracketed format", () => {
		expect(new Add(x, y).key()).toBe("Add[Sym(x),Sym(y)]");
	});

	it("flattens nested Adds into a single sorted list", () => {
		expect(new Add(new Add(x, y), z).key()).toBe("Add[Sym(x),Sym(y),Sym(z)]");
	});

	it("is commutative: Add(x, y) === Add(y, x)", () => {
		expect(new Add(x, y).key()).toBe(new Add(y, x).key());
	});

	it("is associative: Add(Add(x, y), z) === Add(x, Add(y, z))", () => {
		expect(new Add(new Add(x, y), z).key()).toBe(
			new Add(x, new Add(y, z)).key(),
		);
	});

	it("is fully order-independent with three terms", () => {
		const all = [
			new Add(new Add(x, y), z),
			new Add(new Add(x, z), y),
			new Add(new Add(y, z), x),
			new Add(x, new Add(y, z)),
			new Add(y, new Add(x, z)),
			new Add(z, new Add(x, y)),
		];
		const first = all[0]?.key();
		for (const expr of all) expect(expr.key()).toBe(first);
	});

	it("is commutative when one operand is a Num", () => {
		expect(new Add(new Num(2), x).key()).toBe(new Add(x, new Num(2)).key());
	});

	it("produces distinct keys for distinct expressions", () => {
		expect(new Add(x, y).key()).not.toBe(new Add(x, z).key());
	});

	it("includes Num keys in the sorted list", () => {
		// "Num(2)" < "Sym(x)" alphabetically, so Num comes first
		expect(new Add(x, new Num(2)).key()).toBe("Add[Num(2),Sym(x)]");
	});
});

// ─── Add.simplify() ───────────────────────────────────────────────────────────

describe("Add.simplify() — numeric folding", () => {
	it("3 + 4 = 7", () => {
		expect(new Add(new Num(3), new Num(4)).simplify().key()).toBe(
			new Num(7).key(),
		);
	});

	it("0 + x = x", () => {
		expect(new Add(new Num(0), x).simplify().key()).toBe(x.key());
	});

	it("x + 0 = x", () => {
		expect(new Add(x, new Num(0)).simplify().key()).toBe(x.key());
	});

	it("1/3 + 2/3 = 1", () => {
		expect(
			new Add(new Rational(1, 3), new Rational(2, 3)).simplify().key(),
		).toBe(new Num(1).key());
	});

	it("1/4 + 1/4 = 1/2", () => {
		expect(
			new Add(new Rational(1, 4), new Rational(1, 4)).simplify().key(),
		).toBe(new Rational(1, 2).key());
	});
});

describe("Add.simplify() — like-term collection", () => {
	it("x + x = 2x", () => {
		expect(new Add(x, x).simplify().key()).toBe(new Mul(new Num(2), x).key());
	});

	it("2x + 3x = 5x", () => {
		expect(
			new Add(new Mul(new Num(2), x), new Mul(new Num(3), x)).simplify().key(),
		).toBe(new Mul(new Num(5), x).key());
	});

	it("x - x = 0", () => {
		expect(new Add(x, new Neg(x)).simplify().key()).toBe(new Num(0).key());
	});

	it("x + y stays unsimplified", () => {
		expect(new Add(x, y).simplify().key()).toBe(new Add(x, y).key());
	});

	it("x + y + x = 2x + y", () => {
		expect(new Add(new Add(x, y), x).simplify().key()).toBe(
			new Add(new Mul(new Num(2), x), y).key(),
		);
	});
});

describe("Add.toString()", () => {
	it("positive right operand: (x + y)", () => {
		expect(new Add(x, y).toString()).toBe("(x + y)");
	});

	it("Neg right operand renders as subtraction: (x - y)", () => {
		expect(new Add(x, new Neg(y)).toString()).toBe("(x - y)");
	});

	it("negative Num right operand renders as subtraction: (x - 1)", () => {
		expect(new Add(x, new Num(-1)).toString()).toBe("(x - 1)");
	});

	it("negative Rational right operand renders as subtraction: (x - 1/2)", () => {
		expect(new Add(x, new Rational(-1, 2)).toString()).toBe("(x - 1/2)");
	});

	it("Mul with negative coefficient renders as subtraction: (x - 2y)", () => {
		expect(new Add(x, new Mul(new Num(-2), y)).toString()).toBe("(x - 2y)");
	});

	it("Mul with coefficient -1 renders as subtraction without the 1: (x - y)", () => {
		expect(new Add(x, new Mul(new Num(-1), y)).toString()).toBe("(x - y)");
	});

	it("regression: (x+1)(x-1) simplified does not stringify as '(x^2 + -1)'", () => {
		const expr = new Mul(new Add(x, new Num(1)), new Add(x, new Num(-1)));
		expect(expr.simplify().toString()).toBe("(x^2 - 1)");
	});

	it("simplified like-terms still render without spurious '+'", () => {
		// 2x + -x = x — no negative rendering expected, just a sanity check
		const expr = new Add(new Mul(new Num(2), x), new Neg(x));
		expect(expr.simplify().toString()).toBe("x");
	});
});

describe("Add.simplify() — Rational coefficients", () => {
	it("(1/2)x + (1/2)x = x", () => {
		expect(
			new Add(new Mul(new Rational(1, 2), x), new Mul(new Rational(1, 2), x))
				.simplify()
				.key(),
		).toBe(x.key());
	});

	it("(1/2)x + (3/2)x = 2x", () => {
		expect(
			new Add(new Mul(new Rational(1, 2), x), new Mul(new Rational(3, 2), x))
				.simplify()
				.key(),
		).toBe(new Mul(new Num(2), x).key());
	});

	it("(1/3)x + (1/3)x = (2/3)x", () => {
		expect(
			new Add(new Mul(new Rational(1, 3), x), new Mul(new Rational(1, 3), x))
				.simplify()
				.key(),
		).toBe(new Mul(new Rational(2, 3), x).key());
	});
});
