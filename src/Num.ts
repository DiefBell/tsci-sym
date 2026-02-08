import { Expr } from "./Expr";

export class Num extends Expr {
  constructor(public value: number) {
    super();
  }

  toString() {
    return this.value.toString();
  }
}
