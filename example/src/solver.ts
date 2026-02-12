import { solve } from "sym.js";
import { x, y } from "./symbols";

// ── Solver ───────────────────────────────────────────────────────────────────
// Linear: 2x + 4 = 0  →  x = -2
const eq1 = 2 * x + 4;
console.log("\nsolve(2x + 4 = 0):", solve(eq1, x).map(String));
// Rational solution: 3x - 1 = 0  →  x = 1/3
const eq2 = 3 * x - 1;
console.log("solve(3x - 1 = 0):", solve(eq2, x).map(String));
// Rational coefficient: x/2 + 3 = 0  →  x = -6
const eq3 = x / 2 + 3;
console.log("solve(x/2 + 3 = 0):", solve(eq3, x).map(String));
// Multi-variable: x + y = 0  →  x = -y
const eq4 = x + y;
console.log("solve(x + y = 0, x):", solve(eq4, x).map(String));
// Non-linear: x^2 - 1 = 0  →  [] (not yet supported)
const eq5 = x ** 2 - 1;
console.log("solve(x^2 - 1 = 0):", solve(eq5, x).map(String), "(not yet supported)");
