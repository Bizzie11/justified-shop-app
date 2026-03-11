import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";

const DEMO_SEARCHES = [
  "Klein 11-in-1 screwdriver",
  "Shark Navigator filter",
  "Weber grill cover",
  "Rubbermaid storage tote",
];

const DEFAULT_PRESETS = [
  {
    id: "amazon",
    name: "Amazon",
    label: "Amazon style lookup",
    replaceTemplate: "Find the best listing match for: {query}",
  },
  {
    id: "walmart",
    name: "Walmart",
    label: "Walmart style lookup",
    replaceTemplate: "Search Walmart for: {query}",
  },
  {
    id: "ebay",
    name: "eBay",
    label: "eBay style lookup",
    replaceTemplate: "Search eBay sold/comparable items for: {query}",
  },
  {
    id: "general",
    name: "General",
    label: "General shopping lookup",
    replaceTemplate: "Find shopping results for: {query}",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/billing" element={<BillingPage />} />
      </Routes>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [selectedPresetId, setSelectedPresetId] = useState(DEFAULT_PRESETS[0].id);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("justified-shop-recent-searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [savedPresets, setSavedPresets] = useState(() => {
    try {
      const saved = localStorage.getItem("justified-shop-presets");
      return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
    } catch {
      return DEFAULT_PRESETS;
    }
  });
  const [resultText, setResultText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "justified-shop-recent-searches",
      JSON.stringify(recentSearches)
    );
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem("justified-shop-presets", JSON.stringify(savedPresets));
  }, [savedPresets]);

  const selectedPreset = useMemo(() => {
    return (
      savedPresets.find((preset) => preset.id === selectedPresetId) || savedPresets[0]
    );
  }, [savedPresets, selectedPresetId]);

  const builtPrompt = useMemo(() => {
    if (!selectedPreset) return query.trim();
    return selectedPreset.replaceTemplate.replace("{query}", query.trim());
  }, [selectedPreset, query]);

  const handleRunSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 8);
      return next;
    });

    setResultText(builtPrompt);
    setActiveTab("results");
  };

  const handleUseDemo = (demo) => {
    setQuery(demo);
    setResultText("");
    setCopied(false);
  };

  const handleUseRecent = (item) => {
    setQuery(item);
    setResultText("");
    setCopied(false);
  };

  const handleCopyResult = async () => {
    if (!resultText) return;
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setResultText("");
    setCopied(false);
    setActiveTab("search");
  };

  const handleAddPreset = () => {
    const name = window.prompt("Preset name");
    if (!name) return;

    const replaceTemplate = window.prompt(
      'Prompt template. Use "{query}" where the search should go.',
      "Find shopping results for: {query}"
    );

    if (!replaceTemplate || !replaceTemplate.includes("{query}")) {
      window.alert('Preset must include "{query}"');
      return;
    }

    const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    const newPreset = {
      id,
      name,
      label: name,
      replaceTemplate,
    };

    setSavedPresets((prev) => [...prev, newPreset]);
    setSelectedPresetId(id);
  };

  const handleDeletePreset = (presetId) => {
    const defaults = DEFAULT_PRESETS.map((p) => p.id);
    if (defaults.includes(presetId)) {
      window.alert("Default presets cannot be deleted.");
      return;
    }

    setSavedPresets((prev) => prev.filter((preset) => preset.id !== presetId));

    if (selectedPresetId === presetId) {
      setSelectedPresetId(DEFAULT_PRESETS[0].id);
    }
  };

  return (
    <>
      <Header />

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                Justified Shop SaaS
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Search smarter for parts, products, and replacements
              </h1>

              <p className="mt-4 max-w-xl text-lg text-slate-600">
                Build cleaner shopping prompts, reuse presets, and keep recent searches
                organized in one simple workflow.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open workspace
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/billing")}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                      onClick={() => handleUseDemo(item)}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("search")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      activeTab === "search"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("results")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      activeTab === "results"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Results
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("presets")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      activeTab === "presets"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Presets
                  </button>
                </div>

                <div id="workspace">
                  {activeTab === "search" && (
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
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-slate-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Preset
                        </label>
                        <select
                          value={selectedPresetId}
                          onChange={(e) => setSelectedPresetId(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                        >
                          {savedPresets.map((preset) => (
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
                        <p className="text-sm text-slate-600">
                          {query.trim()
                            ? builtPrompt
                            : 'Your generated prompt will appear here once you enter a search.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleRunSearch}
                          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Run search
                        </button>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Reset
                        </button>
                      </div>

                      {recentSearches.length > 0 && (
                        <div>
                          <p className="mb-3 text-sm font-semibold text-slate-700">
                            Recent searches
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recentSearches.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => handleUseRecent(item)}
                                className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "results" && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-slate-700">
                          Generated output
                        </p>
                        <pre className="whitespace-pre-wrap break-words text-sm text-slate-700">
                          {resultText || "No result yet. Run a search from the Search tab."}
                        </pre>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleCopyResult}
                          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          {copied ? "Copied" : "Copy result"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("search")}
                          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Back to search
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "presets" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Saved presets
                          </p>
                          <p className="text-sm text-slate-500">
                            Use templates with {"{query}"} to control replacement behavior.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddPreset}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Add preset
                        </button>
                      </div>

                      <div className="space-y-3">
                        {savedPresets.map((preset) => (
                          <div
                            key={preset.id}
                            className="rounded-2xl border border-slate-200 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">{preset.name}</p>
                                <p className="mt-1 text-sm text-slate-600">
                                  {preset.replaceTemplate}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedPresetId(preset.id)}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  Use
                                </button>

                                {!DEFAULT_PRESETS.some((p) => p.id === preset.id) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePreset(preset.id)}
                                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <PricingSection />
      </main>

      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">
          Justified Shop
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
          <a href="#workspace" className="hover:text-slate-900">
            Workspace
          </a>
          <Link to="/billing" className="hover:text-slate-900">
            Billing
          </Link>
          <Link to="/privacy" className="hover:text-slate-900">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-slate-900">
            Terms
          </Link>
        </nav>
      </div>
    </header>
  );
}

function PricingSection() {
  const navigate = useNavigate();

  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Simple plans for every stage
          </h2>
          <p className="mt-3 text-slate-600">
            Start free, then upgrade when you are ready to unlock paid features.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Free
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">$0</h3>
            <p className="mt-2 text-sm text-slate-600">
              Great for testing the workflow and basic search formatting.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li>Basic searches</li>
              <li>Recent searches</li>
              <li>Default presets</li>
            </ul>

            <button
              type="button"
              className="mt-8 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Current plan
            </button>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Pro Monthly
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">$19/mo</h3>
            <p className="mt-2 text-sm text-slate-600">
              For frequent use and more powerful shopping workflows.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li>Everything in Free</li>
              <li>More saved presets</li>
              <li>Premium features placeholder</li>
            </ul>

            <button
              type="button"
              onClick={() => navigate("/billing")}
              className="mt-8 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Upgrade soon
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Annual Plan
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">$190/yr</h3>
            <p className="mt-2 text-sm text-slate-600">
              Best value for long-term use once Stripe is connected.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li>Everything in Pro</li>
              <li>Lower yearly cost</li>
              <li>Annual billing placeholder</li>
            </ul>

            <button
              type="button"
              onClick={() => navigate("/billing")}
              className="mt-8 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Available soon
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BillingPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const checkoutStatus = params.get("checkout");

  return (
    <>
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing</h1>
        <p className="mt-3 text-slate-600">
          Your billing page is ready for Stripe. For now, these buttons are placeholders.
        </p>

        {checkoutStatus === "success" && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Subscription checkout completed successfully.
          </div>
        )}

        {checkoutStatus === "cancelled" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Checkout was cancelled.
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Free</h2>
            <p className="mt-2 text-sm text-slate-600">
              Continue using the basic version at no cost.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Current / Get started
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Pro Monthly</h2>
            <p className="mt-2 text-sm text-slate-600">
              Stripe button goes here next.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={() => window.alert("Stripe checkout will be connected next.")}
            >
              Upgrade to Pro Monthly
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Annual Plan</h2>
            <p className="mt-2 text-sm text-slate-600">
              Stripe annual checkout goes here next.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={() => window.alert("Stripe annual plan will be connected next.")}
            >
              Upgrade to Annual
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function PrivacyPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
        <div className="mt-6 space-y-5 text-slate-700">
          <p>
            Justified Shop collects only the information needed to operate the app,
            improve the product, and provide customer support.
          </p>
          <p>
            We may store account details, basic usage activity, and app preferences such
            as presets and recent searches.
          </p>
          <p>
            We do not sell your personal information. Payment processing will be handled
            by Stripe once billing is enabled.
          </p>
          <p>
            Contact support if you need help with account or privacy-related requests.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}

function TermsPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
        <div className="mt-6 space-y-5 text-slate-700">
          <p>
            By using Justified Shop, you agree to use the service only for lawful business
            or consumer shopping purposes.
          </p>
          <p>
            We may update features, pricing, and plan limits over time. Continued use of
            the service means you accept those updates.
          </p>
          <p>
            Paid plans, when enabled, will be billed through Stripe and subject to the
            checkout terms presented at purchase.
          </p>
          <p>
            The service is provided as-is without guarantees of uninterrupted availability.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Justified Shop</p>

        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-slate-900">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-slate-900">
            Terms
          </Link>
          <Link to="/billing" className="hover:text-slate-900">
            Billing
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default App;
