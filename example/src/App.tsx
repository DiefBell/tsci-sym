import {
	derivatives,
	evaluations,
	integrals,
	simplifications,
	solutions,
	substitutions,
} from "./demo";
import "./App.css";

export default function App() {
	return (
		<div className="app">
			<header className="app-header">
				<h1>sym.js</h1>
				<p>Symbolic math in TypeScript with operator overloading</p>
			</header>

			<section>
				<h2>Simplification</h2>
				<div className="card-grid">
					{simplifications.map(({ input, output }) => (
						<div className="card" key={input}>
							<div className="card-label">expression</div>
							<div className="mono expr">{input}</div>
							<div className="divider">↓ simplify()</div>
							<div className="mono result">{output}</div>
						</div>
					))}
				</div>
			</section>

			<section>
				<h2>Solver</h2>
				<div className="card-grid">
					{solutions.map(({ equation, roots }) => (
						<div className="card" key={equation}>
							<div className="card-label">equation</div>
							<div className="mono expr">{equation}</div>
							<div className="divider">↓ solve()</div>
							{roots.length > 0 ? (
								<div className="roots">
									{roots.map((r) => (
										<span className="mono root-chip" key={r}>
											x = {r}
										</span>
									))}
								</div>
							) : (
								<div className="no-solution">no closed-form solution</div>
							)}
						</div>
					))}
				</div>
			</section>

			<section>
				<h2>Differentiation</h2>
				<div className="card-grid">
					{derivatives.map(({ input, output }) => (
						<div className="card" key={input}>
							<div className="card-label">expression</div>
							<div className="mono expr">{input}</div>
							<div className="divider">↓ diff(_, x)</div>
							<div className="mono result">{output}</div>
						</div>
					))}
				</div>
			</section>

			<section>
				<h2>Integration</h2>
				<div className="card-grid">
					{integrals.map(({ input, output }) => (
						<div className="card" key={input}>
							<div className="card-label">expression</div>
							<div className="mono expr">{input}</div>
							<div className="divider">↓ integrate(_, x)</div>
							<div className="mono result">{output}</div>
						</div>
					))}
				</div>
			</section>

			<section>
				<h2>Substitution</h2>
				<div className="card-grid">
					{substitutions.map(({ expr, sub, output }) => (
						<div className="card" key={expr}>
							<div className="card-label">expression</div>
							<div className="mono expr">{expr}</div>
							<div className="card-label secondary">{sub}</div>
							<div className="divider">↓ subs()</div>
							<div className="mono result">{output}</div>
						</div>
					))}
				</div>
			</section>

			<section>
				<h2>Numeric Evaluation</h2>
				<div className="card-grid">
					{evaluations.map(({ expr, values, output }) => (
						<div className="card" key={expr}>
							<div className="card-label">expression</div>
							<div className="mono expr">{expr}</div>
							{values && <div className="card-label secondary">{values}</div>}
							<div className="divider">↓ evalf()</div>
							<div className="mono result">{output}</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
