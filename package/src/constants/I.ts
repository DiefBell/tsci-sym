import { Expr } from "../Expr";

/**
 * The imaginary unit i, where i² = -1.
 *
 * Singleton — always use ImaginaryUnit.instance (or the exported `I` alias).
 */
export class ImaginaryUnit extends Expr<readonly []> {
	private static readonly _instance = new ImaginaryUnit();
	private constructor() {
		super();
	}
	static get instance(): ImaginaryUnit {
		return ImaginaryUnit._instance;
	}

	get args(): readonly [] {
		return [];
	}
	map(_fn: (e: Expr) => Expr): Expr {
		return this;
	}

	key() {
		return "I";
	}
	toString() {
		return "i";
	}
	protected _simplify(): Expr {
		return this;
	}
}

export const I = ImaginaryUnit.instance;
