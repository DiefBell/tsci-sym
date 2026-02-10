import { Sym } from "./src";
import { Vector3 } from "./src/Vector3";

let v1 = new Vector3(1, 2, 3);
const v2 = new Vector3(4, 5, 6);

const v3 = v1 + v2;
console.log(`${v1} + ${v2} = ${v3}`);

v1 += v2;
console.log(`v1 += v2 => v1 = ${v1}`);

const v4 = new Vector3(2, 3, 6);
const v5 = new Vector3(3, 2, 6);

console.log(`v4 == v5? ${v4 == v5}`); // expect true
console.log(`v4 === v5? ${v4 === v5}`); // expect false

const x = new Sym("x");
const y = new Sym("y");

const expr = x + 2 * y + 1;

console.log(expr.toString());
