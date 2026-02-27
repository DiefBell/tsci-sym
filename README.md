# sym-js

Monorepo for [sym.js](./package/) — a SymPy-style symbolic mathematics library for JavaScript.

## Packages

| Directory | Description |
|---|---|
| [`package/`](./package/) | The `sym.js` npm package |
| [`example/`](./example/) | React + Vite demo app |
| [`sympy/`](./sympy/) | SymPy Python source, kept locally as an algorithmic reference |

## Development

Requires [Bun](https://bun.sh).

```sh
bun install       # install all workspace dependencies
```

### Building the library

```sh
cd package
bun run build     # tsc + boperate validate
bun run test      # run tests
```

### Running the example app

```sh
cd example
bun run dev       # Vite dev server
bun run build     # production build
```

## Architecture

The library is an expression tree CAS (computer algebra system). Each node (`Add`, `Mul`, `Pow`, etc.) extends the abstract `Expr` base class defined in `package/src/Expr.ts`. The boperators transform rewrites native operators (`+`, `*`, `**`, etc.) into calls to static methods on `Expr` subclasses at build time.

Key directories under `package/src/`:

| Directory | Contents |
|---|---|
| `core/` | `Sym`, `Num`, `Rational`, `Add`, `Mul`, `Neg`, `Pow` |
| `functions/` | `Sin`, `Cos`, `Tan`, `Asin`, `Acos`, `Atan`, `Log`, `Abs` |
| `constants/` | `Pi`, `E`, `I` |
| `utilities/` | `diff`, `integrate`, `solve`, `subs`, `evalf`, `sqrt`, `log` |

## Linting and formatting

```sh
bun run check     # Biome lint
bun run format    # Biome format
```
