import { Expr } from "../Expr";

export class PiConstant extends Expr<readonly []> {
	// TODO: do this how SymPy does it
	/** 50 significant decimal places of π */
	static readonly digits =
		"3.14159265358979323846264338327950288419716939937510";

	private static readonly _instance = new PiConstant();
	private constructor() {
		super();
	}
	static get instance(): PiConstant {
		return PiConstant._instance;
	}

	get args(): readonly [] {
		return [];
	}
	map(_fn: (e: Expr) => Expr): Expr {
		return this;
	}

	key() {
		return "Pi";
	}
	toString() {
		return "Pi";
	}
	simplify(): Expr {
		return this;
	}
}

export const Pi = PiConstant.instance;
