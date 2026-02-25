import { simplifications, solutions } from "./demo";
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
					{simplifications.map(({ input, output }, i) => (
						<div className="card" key={i}>
							<div className="card-label">expression</div>
							<div className={`mono expr`}>{input}</div>
							<div className="divider">↓ simplify()</div>
							<div className={`mono result`}>{output}</div>
						</div>
					))}
				</div>
			</section>

			<section>
				<h2>Solver</h2>
				<div className="card-grid">
					{solutions.map(({ equation, roots }, i) => (
						<div className="card" key={i}>
							<div className="card-label">equation</div>
							<div className={`mono expr`}>{equation}</div>
							<div className="divider">↓ solve()</div>
							{roots.length > 0 ? (
								<div className="roots">
									{roots.map((r, j) => (
										<span className={`mono root-chip`} key={j}>
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
		</div>
	);
}
