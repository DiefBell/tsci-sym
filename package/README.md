# sym.js

A symbolic mathematics library for JavaScript. Build and simplify algebraic expressions using native operators.

## Prerequisites

sym.js relies on [boperators](https://github.com/nicolo-ribaudo/tc39-proposal-operator-overloading) for operator overloading. Your project needs the boperators TypeScript plugins configured so that `+`, `-`, `*`, and `**` work directly on expressions.

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

Build with `tspc` (from [ts-patch](https://github.com/nicolo-ribaudo/ts-patch)) instead of `tsc` to apply the transform.

## Usage

```ts
import { Sym } from "sym.js";

const x = new Sym("x");
const y = new Sym("y");

const expr = (x + 2 * y + 1) * (x - y) - (x + x) + 3;

console.log(expr.simplify().toString());
```

Numbers on either side of an operator are automatically wrapped into `Num` nodes, so `x + 1` and `2 * y` work as expected.

## Expression types

| Class | Description | Example |
|-------|-------------|---------|
| `Sym` | Symbolic variable | `new Sym("x")` |
| `Num` | Numeric constant | `new Num(3)` |
| `Add` | Addition | `x + y` |
| `Mul` | Multiplication | `x * y` |
| `Neg` | Unary negation | `-x` |
| `Pow` | Exponentiation | `x ** 2` |

All expression types extend the abstract `Expr` base class and implement `simplify()` and `toString()`.

## Simplification

Calling `.simplify()` on any expression applies algebraic rules recursively:

- **Constant folding** &mdash; `2 + 3` &rarr; `5`, `2 * 3` &rarr; `6`
- **Identity elimination** &mdash; `x + 0` &rarr; `x`, `x * 1` &rarr; `x`
- **Zero multiplication** &mdash; `x * 0` &rarr; `0`
- **Like-term combining** &mdash; `x + x` &rarr; `2 * x`
- **Double negation** &mdash; `--x` &rarr; `x`
- **Distributive property** &mdash; `(a + b) * c` &rarr; `a*c + b*c`
- **Power rules** &mdash; `x^0` &rarr; `1`, `x^1` &rarr; `x`, `x * x` &rarr; `x^2`

## Exports

All types are exported from the package root, with longer aliases available:

```ts
import {
  Expr,       // or Expression
  Sym,        // or Symbol
  Num,        // or Number
  Add,
  Mul,        // or Multiply
  Neg,        // or UnaryNegation
  Pow,        // or Power (type-only)
} from "sym.js";
```

## API

Every expression node exposes:

- **`simplify(): Expr`** &mdash; returns a new, simplified expression tree.
- **`toString(): string`** &mdash; returns a parenthesised string representation of the expression.

## Building

```sh
bun run build
```

Linting and formatting are handled by [Biome](https://biomejs.dev/):

```sh
bun run check       # lint
bun run format      # format
```
