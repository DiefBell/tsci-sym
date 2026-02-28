# @tsci/sym

A SymPy-style symbolic mathematics library for JavaScript. Build, simplify, differentiate, integrate, and solve algebraic expressions using native TypeScript operators.

```ts
import { Sym, Pi, Sin, diff, solve } from "@tsci/sym";

const x = new Sym("x");

(x ** 2 - 4).simplify().toString();          // "(x^2 - 4)"
solve(x ** 2 - 4, x).map(String);            // ["-2", "2"]
diff(new Sin(x) * x ** 2, x).toString();     // product rule result
```

## Prerequisites

@tsci/sym uses [boperators](https://github.com/nicolo-ribaudo/tc39-proposal-operator-overloading) for operator overloading, so `+`, `-`, `*`, `/`, and `**` work directly on expression nodes. You need the boperators plugin configured for your build tool.

**Vite:**

```ts
// vite.config.ts
import { boperators } from "@boperators/plugin-vite";
export default defineConfig({ plugins: [boperators()] });
```

```jsonc
// tsconfig.json — for editor support
{
  "compilerOptions": {
    "plugins": [{ "name": "@boperators/plugin-ts-language-server" }]
  }
}
```

**Other bundlers / plain tsc:**

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "plugins": [
      { "name": "@boperators/plugin-ts-language-server" },
      { "transform": "@boperators/plugin-tsc", "transformProgram": true }
    ]
  }
}
```

Build with `tspc` (from [ts-patch](https://github.com/nonara/ts-patch)) instead of `tsc`.

## Installation

```sh
npm install @tsci/sym boperators
```

## Expression nodes

All nodes extend the abstract `Expr` base class and support `simplify()` and `toString()`.

### Core

| Class | Aliases | Description |
|---|---|---|
| `Sym` | `Symbol` | Symbolic variable |
| `Num` | `Number` | Numeric constant (numeric literals beside a `Sym` are auto-wrapped) |
| `Rational` | | Exact fraction — `new Rational(1, 3)` → `1/3` |
| `Add` | | Addition — `x + y` |
| `Mul` | `Multiply` | Multiplication — `x * y` |
| `Neg` | `UnaryNegation` | Unary negation — `-x` |
| `Pow` | `Power` | Exponentiation — `x ** 2` |

### Functions

| Class | Description |
|---|---|
| `Sin`, `Cos`, `Tan` | Trigonometric |
| `Asin`, `Acos`, `Atan` | Inverse trigonometric |
| `Log` | Natural logarithm |
| `Abs` | Absolute value |

### Constants

| Export | Description |
|---|---|
| `Pi` / `PiConstant` | π |
| `E` / `EulerNumber` | Euler's number |
| `I` / `ImaginaryUnit` | Imaginary unit |

## Simplification

```ts
const x = new Sym("x");
const y = new Sym("y");

(x + x).simplify().toString();                          // "2x"
(2 * x + 3 * x).simplify().toString();                  // "5x"
((x + 1) * (x - 1)).simplify().toString();              // "(x^2 - 1)"
((x + 2 * y + 1) * (x - y) - 2 * x + 3).simplify().toString();
```

Rules applied: constant folding, identity elimination (`+0`, `*1`, `*0`), like-term combining, double negation, distributive expansion, and power rules (`x^0`, `x^1`, `x^a * x^b`).

## Differentiation

```ts
import { diff } from "@tsci/sym";

diff(x ** 3, x).simplify().toString();                  // "3x^2"
diff(new Sin(x), x).simplify().toString();              // "cos(x)"
diff(new Cos(x) * x ** 2, x).simplify().toString();     // product rule
diff(x ** 2 + y ** 2, x).simplify().toString();         // partial w.r.t. x → "2x"
```

## Integration

```ts
import { integrate } from "@tsci/sym";

integrate(3 * x ** 2, x).simplify().toString();         // "x^3"
integrate(new Sin(x), x).simplify().toString();         // "-cos(x)"
integrate(1 / x, x).simplify().toString();              // "log(x)"
```

## Solving

```ts
import { solve } from "@tsci/sym";

solve(2 * x + 4, x).map(String);                       // ["-2"]
solve(x ** 2 - 4, x).map(String);                      // ["-2", "2"]
solve(x ** 2 + 2 * x + 1, x).map(String);              // ["-1"]
```

## Substitution

```ts
import { subs } from "@tsci/sym";

subs(x ** 2 + y, new Map([[x, new Num(3)]])).simplify().toString();  // "(y + 9)"
subs(2 * x + 1, new Map([[x, y + 1]])).simplify().toString();        // "(2y + 3)"
```

## Numeric evaluation

```ts
import { evalf, Pi, E } from "@tsci/sym";

evalf(Pi);                                              // 3.141592653589793
evalf(E ** 2);                                         // 7.38905609893065
evalf(x ** 2 + 1, new Map([[x, 2]]));                  // 5
```

## Utilities

| Export | Description |
|---|---|
| `sqrt(x)` | Square root — `Pow(x, Rational(1, 2))` |
| `log(x)` | Natural log — `Log(x)` |

## API

Every expression node exposes:

- **`simplify(): Expr`** — returns a new simplified expression tree
- **`toString(): string`** — returns a human-readable string representation
- **`key(): string`** — returns a canonical string for structural equality checks (`a.key() === b.key()`)

## Limitations

@tsci/sym is a focused library, not a full CAS. Current known limitations:

- **`solve`** handles linear and quadratic equations only. Higher-degree or transcendental equations are not supported.
- **`integrate`** recognises specific patterns: power rule, trig rules, exponential, log, and u-substitution. Integration by parts for arbitrary expressions (e.g. `x · sin(x)`) is not supported.
- **Trig identities** are not simplified — `sin²(x) + cos²(x)` will not reduce to `1`.
- **Complex numbers** — the `I` constant is available, but complex arithmetic is not implemented beyond it.
- **`x ** -1`** — due to a [bug in boperators 0.3.1](https://github.com/nicolo-ribaudo/tc39-proposal-operator-overloading), the expression `x ** -1` is not correctly transformed at build time. Use `1 / x` instead.
- **Node.js without a bundler** — the package is ESM-only and uses directory imports that require a bundler (Vite, Rollup, webpack) to resolve. Since boperators itself requires a build-time transform, this is the expected usage.

## License

MIT. Inspired by [SymPy](https://www.sympy.org).
