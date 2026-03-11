import React, { useMemo, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

const DEMO_SEARCHES = [
  "Klein 11-in-1 screwdriver",
  "Shark Navigator filter",
  "Weber grill cover",
  "Rubbermaid storage tote",
];

const PRESETS = [
  { id: "amazon", name: "Amazon", template: "Find the best Amazon listing for: {query}" },
  { id: "walmart", name: "Walmart", template: "Search Walmart for: {query}" },
  { id: "ebay", name: "eBay", template: "Search eBay sold/comparable items for: {query}" },
  { id: "general", name: "General", template: "Find shopping results for: {query}" },
];

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [presetId, setPresetId] = useState("amazon");
  const [result, setResult] = useState("");
  const [recent, setRecent] = useState([]);

  const selectedPreset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) || PRESETS[0],
    [presetId]
  );

  const preview = query.trim()
    ? selectedPreset.template.replace("{query}", query.trim())
    : "Your generated prompt will appear here.";

  function runSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setResult(selectedPreset.template.replace("{query}", trimmed));
    setRecent((prev) => [trimmed, ...prev.filter((x) => x !== trimmed)].slice(0, 5));
  }

  function resetAll() {
    setQuery("");
    setResult("");
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold">Justified Shop</h1>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/billing">Billing</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <section>
            <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
              Justified Shop SaaS
            </div>

            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Search smarter for parts, products, and replacements
            </h2>

            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Build cleaner shopping prompts, reuse presets, and keep recent searches organized.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/billing")}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                View pricing
              </button>
            </div>

            <div className="mt-10">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Safe demo examples
              </p>
              <div className="flex flex-wrap gap-3">
                {DEMO_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Search phrase
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type a product, part, or replacement item"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Preset
                  </label>
                  <select
                    value={presetId}
                    onChange={(e) => setPresetId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  >
                    {PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Tab replacement preview
                  </p>
                  <p className="text-sm text-slate-600">{preview}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={runSearch}
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Run search
                  </button>

                  <button
                    type="button"
                    onClick={resetAll}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700">Generated output</p>
                  <pre className="whitespace-pre-wrap break-words text-sm text-slate-700">
                    {result || "No result yet. Run a search to generate output."}
                  </pre>
                </div>

                {recent.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-700">Recent searches</p>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setQuery(item)}
                          className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-16 border-t border-slate-200 pt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">
              Simple plans for every stage
            </h3>
            <p className="mt-3 text-slate-600">
              Start free, then upgrade when you are ready to unlock paid features.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Free</p>
              <h4 className="mt-2 text-2xl font-bold">$0</h4>
              <p className="mt-2 text-sm text-slate-600">Great for testing the workflow.</p>
            </div>

            <div className="rounded-3xl border border-slate-900 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Pro Monthly</p>
              <h4 className="mt-2 text-2xl font-bold">$19/mo</h4>
              <p className="mt-2 text-sm text-slate-600">For frequent use and stronger workflows.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Annual Plan</p>
              <h4 className="mt-2 text-2xl font-bold">$190/yr</h4>
              <p className="mt-2 text-sm text-slate-600">Best long-term value once Stripe is connected.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} Justified Shop
      </footer>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Privacy</h1>
      <p className="mt-4">Privacy policy placeholder.</p>
    </div>
  );
}

function TermsPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Terms</h1>
      <p className="mt-4">Terms of service placeholder.</p>
    </div>
  );
}

function BillingPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Billing</h1>
      <p className="mt-4">Stripe billing will go here next.</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/billing" element={<BillingPage />} />
    </Routes>
  );
}

export default App;
