import { describe, expect, it } from "bun:test";
import { Add } from "./Add";
import { Num } from "./Num";
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
