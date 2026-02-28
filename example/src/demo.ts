import {
	Cos,
	diff,
	E,
	evalf,
	integrate,
	Num,
	Pi,
	Sin,
	Sym,
	solve,
	subs,
} from "@tsci/sym";

const x = new Sym("x");
const y = new Sym("y");

function safe(fn: () => string): string {
	try {
		return fn();
	} catch (e) {
		return `⚠ ${e instanceof Error ? e.message : String(e)}`;
	}
}

function safeRoots(fn: () => string[]): string[] {
	try {
		return fn();
	} catch (e) {
		return [`⚠ ${e instanceof Error ? e.message : String(e)}`];
	}
}

// ── Simplification ────────────────────────────────────────────────────────────

export const simplifications = [
	{ input: "x + x", output: safe(() => (x + x).simplify().toString()) },
	{
		input: "2x + 3x",
		output: safe(() => (2 * x + 3 * x).simplify().toString()),
	},
	{
		input: "(x + 1)(x - 1)",
		output: safe(() => ((x + 1) * (x - 1)).simplify().toString()),
	},
	{
		input: "x² · x³",
		output: safe(() => (x ** 2 * x ** 3).simplify().toString()),
	},
	{
		input: "(x + 2y + 1)(x - y) - 2x + 3",
		output: safe(() =>
			((x + 2 * y + 1) * (x - y) - 2 * x + 3).simplify().toString(),
		),
	},
];

// ── Solver ────────────────────────────────────────────────────────────────────

export const solutions = [
	{
		equation: "2x + 4 = 0",
		roots: safeRoots(() => solve(2 * x + 4, x).map(String)),
	},
	{
		equation: "x/2 + 3 = 0",
		roots: safeRoots(() => solve(x / 2 + 3, x).map(String)),
	},
	{
		equation: "x + y = 0  (for x)",
		roots: safeRoots(() => solve(x + y, x).map(String)),
	},
	{
		equation: "x² - 4 = 0",
		roots: safeRoots(() => solve(x ** 2 - 4, x).map(String)),
	},
	{
		equation: "x² + 2x + 1 = 0",
		roots: safeRoots(() => solve(x ** 2 + 2 * x + 1, x).map(String)),
	},
	{
		equation: "x² + x = 0",
		roots: safeRoots(() => solve(x ** 2 + x, x).map(String)),
	},
];

// ── Differentiation ───────────────────────────────────────────────────────────

export const derivatives = [
	{
		input: "x³",
		output: safe(() =>
			diff(x ** 3, x)
				.simplify()
				.toString(),
		),
	},
	{
		input: "x² + 2x + 1",
		output: safe(() =>
			diff(x ** 2 + 2 * x + 1, x)
				.simplify()
				.toString(),
		),
	},
	{
		input: "sin(x)",
		output: safe(() => diff(new Sin(x), x).simplify().toString()),
	},
	{
		input: "cos(x) · x²",
		output: safe(() =>
			diff(new Cos(x) * x ** 2, x)
				.simplify()
				.toString(),
		),
	},
	{
		input: "x² + y²  (∂/∂x)",
		output: safe(() =>
			diff(x ** 2 + y ** 2, x)
				.simplify()
				.toString(),
		),
	},
];

// ── Integration ───────────────────────────────────────────────────────────────

export const integrals = [
	{
		input: "3x²",
		output: safe(() =>
			integrate(3 * x ** 2, x)
				.simplify()
				.toString(),
		),
	},
	{
		input: "x² + 2x",
		output: safe(() =>
			integrate(x ** 2 + 2 * x, x)
				.simplify()
				.toString(),
		),
	},
	{
		input: "sin(x)",
		output: safe(() => integrate(new Sin(x), x).simplify().toString()),
	},
	{
		input: "cos(x)",
		output: safe(() => integrate(new Cos(x), x).simplify().toString()),
	},
	{
		input: "1/x",
		output: safe(() =>
			integrate(1 / x, x)
				.simplify()
				.toString(),
		),
	},
];

// ── Substitution ──────────────────────────────────────────────────────────────

export const substitutions = [
	{
		expr: "x² + y",
		sub: "x → 3",
		output: safe(() =>
			subs(x ** 2 + y, new Map([[x, new Num(3)]]))
				.simplify()
				.toString(),
		),
	},
	{
		expr: "2x + 1",
		sub: "x → y + 1",
		output: safe(() =>
			subs(2 * x + 1, new Map([[x, y + 1]]))
				.simplify()
				.toString(),
		),
	},
	{
		expr: "x² - 1",
		sub: "x → x + 1",
		output: safe(() =>
			subs(x ** 2 - 1, new Map([[x, x + 1]]))
				.simplify()
				.toString(),
		),
	},
];

// ── Numeric evaluation ────────────────────────────────────────────────────────

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toPrecision(6));

export const evaluations = [
	{
		expr: "x² + 1",
		values: "x = 2",
		output: safe(() => fmt(evalf(x ** 2 + 1, new Map([[x, 2]])))),
	},
	{
		expr: "x³ - x",
		values: "x = 3",
		output: safe(() => fmt(evalf(x ** 3 - x, new Map([[x, 3]])))),
	},
	{ expr: "π", values: "", output: safe(() => fmt(evalf(Pi))) },
	{ expr: "e²", values: "", output: safe(() => fmt(evalf(E ** 2))) },
	{
		expr: "sin(π/4)",
		values: "",
		output: safe(() => fmt(evalf(new Sin(Pi / 4)))),
	},
	{ expr: "cos(π)", values: "", output: safe(() => fmt(evalf(new Cos(Pi)))) },
];
