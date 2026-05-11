import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

function Landing() {
  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            FloodSentinelAI
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-bold leading-[0.92] text-white md:text-7xl">
            AI-powered IoT flood intelligence.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A Vite React entrypoint using the same premium routing structure as
            the FastAPI-served homepage, admin panel, and live dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-cyan-200 px-5 py-3 font-black text-slate-950" to="/dashboard">
              Open Dashboard
            </Link>
            <Link className="rounded-xl border border-slate-700 px-5 py-3 font-bold text-slate-100" to="/">
              Home
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-2xl backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            {["NodeMCU ESP8266", "HC-SR04", "YF-S201", "SIM800L"].map((item) => (
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4" key={item}>
                <span className="mb-3 block h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.7)]" />
                <strong>{item}</strong>
                <p className="mt-2 text-sm text-slate-400">Telemetry online</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
