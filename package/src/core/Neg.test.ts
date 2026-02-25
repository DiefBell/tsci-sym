import { describe, expect, it } from "bun:test";
import { Mul } from "./Mul";
import { Neg } from "./Neg";
import { Num } from "./Num";
import { Sym } from "./Sym";

const x = new Sym("x");
const y = new Sym("y");

describe("Neg.key()", () => {
	it("produces the same key as Mul(-1, x)", () => {
		expect(new Neg(x).key()).toBe(new Mul(new Num(-1), x).key());
	});

	it("produces the canonical Mul[-1, x] format", () => {
		// "Num(-1)" < "Sym(x)" alphabetically, so Num(-1) comes first
		expect(new Neg(x).key()).toBe("Mul[Num(-1),Sym(x)]");
	});

	it("flattens the inner expression when it is a Mul", () => {
		// Neg(x*y) should flatten to Mul[-1, x, y], same as Mul(-1, Mul(x, y))
		expect(new Neg(new Mul(x, y)).key()).toBe("Mul[Num(-1),Sym(x),Sym(y)]");
	});

	it("matches Mul(-1, Mul(x, y)) when the inner is a product", () => {
		expect(new Neg(new Mul(x, y)).key()).toBe(
			new Mul(new Num(-1), new Mul(x, y)).key(),
		);
	});

	it("is invariant to the order of the inner product's factors", () => {
		// Neg(y*x) and Neg(x*y) should have the same key
		expect(new Neg(new Mul(y, x)).key()).toBe(new Neg(new Mul(x, y)).key());
	});

	it("produces distinct keys for different inner expressions", () => {
		expect(new Neg(x).key()).not.toBe(new Neg(y).key());
	});
});
