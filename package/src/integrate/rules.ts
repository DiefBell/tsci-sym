import { Abs } from "../Abs";
import { Add } from "../Add";
import { EulerNumber } from "../constants/E";
import type { Expr } from "../Expr";
import { Log } from "../Log";
import { Mul } from "../Mul";
import { Neg } from "../Neg";
import { Num } from "../Num";
import { Pow } from "../Pow";
import { Rational } from "../Rational";
import { Sym } from "../Sym";
import { Cos } from "../trig/Cos";
import { Sin } from "../trig/Sin";
import { Tan } from "../trig/Tan";
import { diff } from "../utilities/diff";
import {
	containsSym,
	innerComposites,
	isNumericCoeff,
	substitute,
	tryExtract,
} from "./helpers";

/** Function signature of `integrate` itself, threaded into rules that recurse. */
export type IntegrateFn = (expr: Expr, sym: Sym) => Expr;

/**
 * A rule tries to integrate `expr` w.r.t. `sym`.
 * Returns the antiderivative, or `null` if the rule does not apply.
 * Rules that recurse receive `intFn` (the top-level integrate function) to avoid
 * a circular module dependency between rules.ts and integrate.ts.
 */
export type Rule = (expr: Expr, sym: Sym, intFn: IntegrateFn) => Expr | null;

// ─── atomic / table rules (no recursion needed) ──────────────────────────────

/** ∫ c dx = c·x  (c does not contain x) */
export const constantRule: Rule = (expr, sym) => {
	if (containsSym(expr, sym)) return null;
	return new Mul(expr, sym).simplify();
};

/**
 * ∫ x^n dx = x^(n+1) / (n+1)  for constant n ≠ -1.
 * Also handles the bare symbol case ∫ x dx = x²/2.
 */
export const powerRule: Rule = (expr, sym) => {
	// Bare symbol: ∫ x dx = x²/2
	if (expr.key() === sym.key())
		return new Mul(new Rational(1, 2), new Pow(sym, new Num(2))).simplify();

	if (!(expr instanceof Pow)) return null;
	if (expr.base.key() !== sym.key()) return null;
	if (containsSym(expr.exponent, sym)) return null;

	const exp = expr.exponent.simplify();

	// Skip -1 (handled by reciprocalRule)
	if (exp instanceof Num && exp.value === -1) return null;
	if (
		exp instanceof Rational &&
		exp.numerator === -1n &&
		exp.denominator === 1n
	)
		return null;

	// Compute n+1; handle Rational exponents directly to avoid Add.simplify() gaps
	let newExp: Expr;
	if (exp instanceof Rational) {
		newExp = new Rational(
			exp.numerator + exp.denominator,
			exp.denominator,
		).simplify();
	} else {
		newExp = new Add(exp, new Num(1)).simplify();
	}

	// Return (1/(n+1)) · x^(n+1), coefficient first for clean Mul simplification
	const recip = new Pow(newExp, new Num(-1)).simplify();
	return new Mul(recip, new Pow(sym, newExp)).simplify();
};

/** ∫ x^(-1) dx = ln(x) */
export const reciprocalRule: Rule = (expr, sym) => {
	if (!(expr instanceof Pow)) return null;
	if (expr.base.key() !== sym.key()) return null;
	const exp = expr.exponent.simplify();
	if (exp instanceof Num && exp.value === -1) return new Log(sym);
	if (
		exp instanceof Rational &&
		exp.numerator === -1n &&
		exp.denominator === 1n
	)
		return new Log(sym);
	return null;
};

/** ∫ e^x dx = e^x */
export const expRule: Rule = (expr, sym) => {
	if (!(expr instanceof Pow)) return null;
	if (!(expr.base instanceof EulerNumber)) return null;
	if (expr.exponent.key() !== sym.key()) return null;
	return expr;
};

/** ∫ a^x dx = a^x / ln(a)  (constant base a, not e) */
export const expBaseRule: Rule = (expr, sym) => {
	if (!(expr instanceof Pow)) return null;
	if (containsSym(expr.base, sym)) return null;
	if (expr.exponent.key() !== sym.key()) return null;
	return new Mul(expr, new Pow(new Log(expr.base), new Num(-1))).simplify();
};

/** ∫ ln(x) dx = x·ln(x) − x  (integration by parts, table entry) */
export const logRule: Rule = (expr, sym) => {
	if (!(expr instanceof Log)) return null;
	if (expr.inner.key() !== sym.key()) return null;
	return new Add(new Mul(sym, new Log(sym)), new Neg(sym)).simplify();
};

/** ∫ sin(x) dx = -cos(x) */
export const sinRule: Rule = (expr, sym) => {
	if (!(expr instanceof Sin)) return null;
	if (expr.inner.key() !== sym.key()) return null;
	return new Neg(new Cos(sym)).simplify();
};

/** ∫ cos(x) dx = sin(x) */
export const cosRule: Rule = (expr, sym) => {
	if (!(expr instanceof Cos)) return null;
	if (expr.inner.key() !== sym.key()) return null;
	return new Sin(sym);
};

/** ∫ tan(x) dx = -ln|cos(x)| */
export const tanRule: Rule = (expr, sym) => {
	if (!(expr instanceof Tan)) return null;
	if (expr.inner.key() !== sym.key()) return null;
	return new Neg(new Log(new Abs(new Cos(sym)))).simplify();
};

// ─── structural rules (recurse into sub-integrals) ───────────────────────────

/** ∫ (f + g) dx = ∫f dx + ∫g dx */
export const addRule: Rule = (expr, sym, intFn) => {
	if (!(expr instanceof Add)) return null;
	return new Add(intFn(expr.left, sym), intFn(expr.right, sym)).simplify();
};

/**
 * ∫ c·f dx = c·∫f dx
 * Only applies when one factor is constant w.r.t. sym.
 */
export const constantMultRule: Rule = (expr, sym, intFn) => {
	if (!(expr instanceof Mul)) return null;
	if (!containsSym(expr.left, sym))
		return new Mul(expr.left, intFn(expr.right, sym)).simplify();
	if (!containsSym(expr.right, sym))
		return new Mul(expr.right, intFn(expr.left, sym)).simplify();
	return null;
};

/**
 * U-substitution: detects ∫ f(g(x)) · g'(x) dx patterns.
 *
 * Algorithm for each candidate g(x) found in inner composite positions:
 *   1. Compute g'(x) and split as coeff · core  (e.g. 2x → coeff=2, core=x)
 *   2. Structurally extract `core` as a factor from the integrand
 *   3. Substitute g(x) → u in the remainder; bail if x still appears
 *   4. Integrate in u, back-substitute u → g(x), scale result by 1/coeff
 */
export const uSubRule: Rule = (expr, sym, intFn) => {
	const candidates = innerComposites(expr, sym);

	for (const g of candidates) {
		const gPrime = diff(g, sym).simplify();
		if (gPrime instanceof Num && gPrime.value === 0) continue;

		// Split g' into numeric coefficient and core expression
		let coeff: Expr = new Num(1);
		let core: Expr = gPrime;
		if (gPrime instanceof Mul && isNumericCoeff(gPrime.left)) {
			coeff = gPrime.left;
			core = gPrime.right;
		} else if (isNumericCoeff(gPrime)) {
			coeff = gPrime;
			core = new Num(1);
		}

		// Extract the core factor from the integrand (or use whole expr when core = 1)
		let rest: Expr;
		if (core instanceof Num && core.value === 1) {
			rest = expr;
		} else {
			const extracted = tryExtract(expr, core);
			if (extracted === null) continue;
			rest = extracted;
		}

		// Substitute g → u; bail if sym still appears
		const u = new Sym("u");
		const withU = substitute(rest, g, u).simplify();
		if (containsSym(withU, sym)) continue;

		// Integrate in u, back-substitute, and scale by 1/coeff
		try {
			const antideriv = intFn(withU, u).simplify();
			const backSub = substitute(antideriv, u, g);
			return new Mul(
				new Pow(coeff, new Num(-1)).simplify(),
				backSub,
			).simplify();
		} catch {
			// intFn threw (e.g. no rule matched inner integral) — try next candidate
		}
	}

	return null;
};

// ─── ordered rule list ────────────────────────────────────────────────────────

export const RULES: Rule[] = [
	constantRule,
	addRule,
	constantMultRule,
	powerRule,
	reciprocalRule,
	expRule,
	expBaseRule,
	logRule,
	sinRule,
	cosRule,
	tanRule,
	uSubRule,
];
