import { Add } from "./Add";
import { Mul } from "./Mul";
import { Num } from "./Num";

export abstract class Expr {
	abstract toString(): string;
	
  static readonly ["+"] = [
    function(lhs: Expr, rhs: Expr): Expr {
      return new Add(lhs, rhs);
    },
    function(lhs: Expr, rhs: number): Expr {
      return new Add(lhs, new Num(rhs));
    },
    function(lhs: number, rhs: Expr): Expr {
      return new Add(new Num(lhs), rhs);
    }
  ];
  
  static readonly ["*"] = [
    function(lhs: Expr, rhs: Expr): Expr {
      return new Mul(lhs, rhs);
    },
    function(lhs: Expr, rhs: number): Expr {
      return new Mul(lhs, new Num(rhs));
    },
    function(lhs: number, rhs: Expr): Expr {
      return new Mul(new Num(lhs), rhs);
    }
  ];
}
