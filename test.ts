import { Sym } from "./src";

const x = new Sym("x");
const y = new Sym("y");

const expr = (x + 2 * y + 1) * (x - y) - (x + x) + 3;
console.log(expr.toString());
console.log("type:", expr.constructor.name);

const simplified = expr.simplify();
// expect x^2 + xy - 2y^2 -x -y + 3
console.log(simplified.toString());
