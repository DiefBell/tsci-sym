import { Sym, solve } from "sym.js";

const x = new Sym("x");
const y = new Sym("y");

export const simplifications = [
	{
		input: "x + x",
		output: (x + x).simplify().toString(),
	},
	{
		input: "2x + 3x",
		output: (2 * x + 3 * x).simplify().toString(),
	},
	{
		input: "(x + 1)(x - 1)",
		output: ((x + 1) * (x - 1)).simplify().toString(),
	},
	{
		input: "x² · x³",
		output: (x ** 2 * x ** 3).simplify().toString(),
	},
	{
		input: "(x + 2y + 1)(x - y) - 2x + 3",
		output: ((x + 2 * y + 1) * (x - y) - 2 * x + 3).simplify().toString(),
	},
];

export const solutions = [
	{
		equation: "2x + 4 = 0",
		roots: solve(2 * x + 4, x).map(String),
	},
	{
		equation: "x/2 + 3 = 0",
		roots: solve(x / 2 + 3, x).map(String),
	},
	{
		equation: "x + y = 0  (for x)",
		roots: solve(x + y, x).map(String),
	},
	{
		equation: "x² - 4 = 0",
		roots: solve(x ** 2 - 4, x).map(String),
	},
	{
		equation: "x² + 2x + 1 = 0",
		roots: solve(x ** 2 + 2 * x + 1, x).map(String),
	},
	{
		equation: "x² + x = 0",
		roots: solve(x ** 2 + x, x).map(String),
	},
];
