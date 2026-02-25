import { Expr } from "../Expr";

export class EulerNumber extends Expr<readonly []> {
	// TODO: do this how SymPy does it
	/** 50 significant decimal places of e */
	static readonly digits =
		"2.71828182845904523536028747135266249775724709369995";

	private static readonly _instance = new EulerNumber();
	private constructor() {
		super();
	}
	static get instance(): EulerNumber {
		return EulerNumber._instance;
	}

	get args(): readonly [] {
		return [];
	}
	map(_fn: (e: Expr) => Expr): Expr {
		return this;
	}

	key() {
		return "E";
	}
	toString() {
		return "E";
	}
	simplify(): Expr {
		return this;
	}
}

export const E = EulerNumber.instance;
