import { describe, expect, it } from "bun:test";
import { Add } from "./Add";
import { Mul } from "./Mul";
import { Num } from "./Num";
import { Sym } from "./Sym";

const x = new Sym("x");
const y = new Sym("y");
const z = new Sym("z");

describe("Mul.key()", () => {
	it("produces a sorted bracketed format", () => {
		expect(new Mul(x, y).key()).toBe("Mul[Sym(x),Sym(y)]");
	});

	it("flattens nested Muls into a single sorted list", () => {
		expect(new Mul(new Mul(x, y), z).key()).toBe("Mul[Sym(x),Sym(y),Sym(z)]");
	});

	it("is commutative: Mul(x, y) === Mul(y, x)", () => {
		expect(new Mul(x, y).key()).toBe(new Mul(y, x).key());
	});

	it("is associative: Mul(Mul(x, y), z) === Mul(x, Mul(y, z))", () => {
		expect(new Mul(new Mul(x, y), z).key()).toBe(
			new Mul(x, new Mul(y, z)).key(),
		);
	});

	it("is fully order-independent with three terms", () => {
		const all = [
			new Mul(new Mul(x, y), z),
			new Mul(new Mul(x, z), y),
			new Mul(new Mul(y, z), x),
			new Mul(x, new Mul(y, z)),
			new Mul(y, new Mul(x, z)),
			new Mul(z, new Mul(x, y)),
		];
		const first = all[0]?.key();
		for (const expr of all) expect(expr.key()).toBe(first);
	});

	it("is commutative when one factor is a Num", () => {
		expect(new Mul(new Num(2), x).key()).toBe(new Mul(x, new Num(2)).key());
	});

	it("places the numeric coefficient first in the sorted list", () => {
		// "Num(2)" < "Sym(x)" alphabetically, so Num comes first
		expect(new Mul(x, new Num(2)).key()).toBe("Mul[Num(2),Sym(x)]");
	});

	it("produces distinct keys for distinct expressions", () => {
		expect(new Mul(x, y).key()).not.toBe(new Mul(x, z).key());
	});

	it("produces a different key from Add with the same operands", () => {
		expect(new Mul(x, y).key()).not.toBe(new Add(x, y).key());
	});
});

describe("Mul.toString()", () => {
	it("numeric coefficient left, sym right: '2x'", () => {
		expect(new Mul(new Num(2), x).toString()).toBe("2x");
	});

	it("coefficient -1 left renders with leading minus: '-x'", () => {
		expect(new Mul(new Num(-1), x).toString()).toBe("-x");
	});

	it("numeric coefficient right, sym left: still '2x' (coeff pulled left)", () => {
		expect(new Mul(x, new Num(2)).toString()).toBe("2x");
	});

	it("two syms: 'xy'", () => {
		expect(new Mul(x, y).toString()).toBe("xy");
	});

	it("complex operands fall back to parenthesised form", () => {
		expect(new Mul(new Add(x, y), z).toString()).toBe("((x + y) * z)");
	});
});
