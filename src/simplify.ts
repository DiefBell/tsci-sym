import { Add } from "./Add";
import { Expr } from "./Expr";
import { Mul } from "./Mul";
import { Num } from "./Num";

export function simplify(expr: Expr): Expr {
  if (expr instanceof Add) {
    const l = simplify(expr.left);
    const r = simplify(expr.right);

    if (l instanceof Num && l.value === 0) return r;
    if (r instanceof Num && r.value === 0) return l;

    if (l instanceof Num && r instanceof Num) {
      return new Num(l.value + r.value);
    }

    return new Add(l, r);
  }

  if (expr instanceof Mul) {
    const l = simplify(expr.left);
    const r = simplify(expr.right);

    if (l instanceof Num && l.value === 1) return r;
    if (r instanceof Num && r.value === 1) return l;
    if (l instanceof Num && r instanceof Num) {
      return new Num(l.value * r.value);
    }

    return new Mul(l, r);
  }

  return expr;
}
