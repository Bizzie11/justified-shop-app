import React from "react";
import { Routes, Route, Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-4 flex justify-between">
          <h1 className="font-bold text-lg">Justified Shop</h1>

          <div className="flex gap-4 text-sm">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/billing">Billing</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-4xl font-bold">
          Search smarter for parts, products, and replacements
        </h2>

        <p className="mt-4 text-slate-600">
          Build cleaner shopping prompts, reuse presets, and keep recent
          searches organized.
        </p>

        <div className="mt-8 grid gap-4">
          <button className="border rounded p-3">
            Klein 11-in-1 screwdriver
          </button>

          <button className="border rounded p-3">
            Shark Navigator filter
          </button>

          <button className="border rounded p-3">
            Weber grill cover
          </button>

          <button className="border rounded p-3">
            Rubbermaid storage tote
          </button>
        </div>
      </main>

      <footer className="border-t border-slate-200 text-center py-6 text-sm">
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
