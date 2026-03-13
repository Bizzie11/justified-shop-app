import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  Clock3,
  Copy,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Lock,
  CreditCard,
  Menu,
  X,
  Settings2,
  Trash2,
  Pencil,
  Star,
  Save,
} from "lucide-react";

const STORAGE_KEYS = {
  presets: "justifiedshop.presets",
  selectedPresetId: "justifiedshop.selectedPresetId",
  selectedSites: "justifiedshop.selectedSites",
  recentSearches: "justifiedshop.recentSearches",
};

const SITE_CONFIG = [
  {
    name: "Amazon",
    free: true,
    buildUrl: (term) => `https://www.amazon.com/s?k=${encodeURIComponent(term)}`,
  },
  {
    name: "Walmart",
    free: true,
    buildUrl: (term) => `https://www.walmart.com/search?q=${encodeURIComponent(term)}`,
  },
  {
    name: "eBay",
    free: true,
    buildUrl: (term) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(term)}`,
  },
  {
    name: "eBay Sold",
    free: false,
    buildUrl: (term) =>
      `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
        term
      )}&LH_Sold=1&LH_Complete=1`,
  },
{
  name: "Google",
  free: true,
  buildUrl: (term) => `https://www.google.com/search?q=${encodeURIComponent(term)}`,
},

{
  name: "Target",
  free: true,
  buildUrl: (term) => `https://www.target.com/s?searchTerm=${encodeURIComponent(term)}`,
},
];

const FREE_SITE_NAMES = SITE_CONFIG.filter((site) => site.free).map((site) => site.name);

const DEFAULT_PRESETS = [
  {
    id: "preset-arbitrage",
    name: "Amazon + eBay Sold + Walmart",
    sites: ["Amazon", "eBay Sold", "Walmart"],
    isDefault: true,
    isSystem: true,
  },
  {
    id: "preset-hardware",
    name: "Hardware",
    sites: ["Amazon", "Google"],
    isDefault: false,
    isSystem: true,
  },
  {
    id: "preset-plumbing",
    name: "Plumbing",
    sites: ["Amazon", "Walmart", "Google"],
    isDefault: false,
    isSystem: true,
  },
  {
    id: "preset-wholesale",
    name: "Wholesale",
    sites: ["Amazon", "Walmart", "eBay", "Google"],
    isDefault: false,
    isSystem: true,
  },
];

const DEFAULT_RECENT = [
  "Klein 11-in-1 screwdriver",
  "Shark Navigator filter",
  "Weber grill cover",
  "Rubbermaid storage tote",
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    desc: "Try the workflow before upgrading.",
    items: ["Core marketplaces", "Open selected sites", "Test the workflow first"],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$29/mo",
    desc: "For sellers who check products every day and want full flexibility month to month.",
    items: [
      "Unlimited searches",
      "Saved presets",
      "Recent search history",
      "eBay Sold access",
    ],
    cta: "Start Pro",
  },
  {
    name: "Annual Plan",
    price: "$239/yr",
    subprice: "Equivalent to $19.99/month, billed annually",
    desc: "Best value for sellers who want full access and lower annual pricing.",
    items: [
      "Everything in Pro",
      "Save $109 per year vs monthly",
      "Annual billing discount",
      "Priority product feedback consideration",
    ],
    cta: "Choose Annual Plan",
    featured: true,
    badge: "Best Value",
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function readStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

function createPresetId() {
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePresets(input) {
  if (!Array.isArray(input) || input.length === 0) return DEFAULT_PRESETS;

  const next = input
    .filter((item) => item && typeof item.name === "string" && Array.isArray(item.sites))
    .map((item) => ({
      id: item.id || createPresetId(),
      name: item.name.trim() || "Untitled Preset",
      sites: item.sites.filter(Boolean),
      isDefault: Boolean(item.isDefault),
      isSystem: Boolean(item.isSystem),
    }));

  if (next.length === 0) return DEFAULT_PRESETS;
  if (next.some((item) => item.isDefault)) return next;

  return next.map((item, index) => ({
    ...item,
    isDefault: index === 0,
  }));
}

function getDefaultPresetId(presets) {
  return presets.find((preset) => preset.isDefault)?.id || presets[0]?.id || "";
}

function getPresetById(presets, presetId) {
  return presets.find((preset) => preset.id === presetId) || null;
}

function mergeSelectedPresetId(savedId, presets) {
  return presets.some((preset) => preset.id === savedId) ? savedId : getDefaultPresetId(presets);
}

function cleanSearchTerm(value, searchType) {
  const trimmed = value.trim();
  const noExtraSpaces = trimmed.replace(/\s+/g, " ");

  if (!noExtraSpaces) return "";
  if (searchType === "UPC") return noExtraSpaces.replace(/[^0-9]/g, "");
  if (searchType === "Exact Part #") return noExtraSpaces;

  return noExtraSpaces
    .replace(/["']/g, "")
    .replace(/[^a-zA-Z0-9\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildUrls(term, siteNames) {
  return SITE_CONFIG.filter((site) => siteNames.includes(site.name)).map((site) => ({
    name: site.name,
    url: site.buildUrl(term),
  }));
}

function openUrlsInTabs(urls) {
  return [...urls]
    .reverse()
    .map((item) => {
      try {
        return window.open(item.url, "_blank");
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20">
      <Sparkles className="h-5 w-5" />
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, text, center = false }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
        {title}
      </h2>
      {text ? <p className="mt-4 text-slate-300">{text}</p> : null}
    </div>
  );
}

function SiteCard({ name, selected, onClick, locked }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left transition duration-150",
        selected
          ? "border-emerald-400/50 bg-emerald-400/10 text-white"
          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{name}</span>
        {locked ? (
          <Lock className="h-4 w-4 text-slate-500" />
        ) : selected ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        ) : null}
      </div>
    </button>
  );
}

function PresetManagerModal({
  open,
  onClose,
  presets,
  selectedPresetId,
  selectedSites,
  setSelectedPresetId,
  setSelectedSites,
  setPresets,
  showToast,
}) {
  const [draftId, setDraftId] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftSites, setDraftSites] = useState([]);

  useEffect(() => {
    if (!open) return;
    setDraftId("");
    setDraftName("");
    setDraftSites([...selectedSites]);
  }, [open, selectedSites]);

  if (!open) return null;

  const resetDraft = () => {
    setDraftId("");
    setDraftName("");
    setDraftSites([...selectedSites]);
  };

  const editPreset = (preset) => {
    setDraftId(preset.id);
    setDraftName(preset.name);
    setDraftSites([...preset.sites]);
  };

  const toggleDraftSite = (site) => {
    const locked = !site.free;
    if (locked) {
      showToast("eBay Sold stays part of the future paid plan.");
      return;
    }

    setDraftSites((current) =>
      current.includes(site.name)
        ? current.filter((item) => item !== site.name)
        : [...current, site.name]
    );
  };

  const savePreset = () => {
    const name = draftName.trim();
    const sites = draftSites.filter(Boolean);

    if (!name) return showToast("Give your preset a name.");
    if (!sites.length) return showToast("Choose at least one marketplace.");

    if (draftId) {
      setPresets((current) =>
        current.map((preset) =>
          preset.id === draftId ? { ...preset, name, sites } : preset
        )
      );

      if (selectedPresetId === draftId) {
        setSelectedSites(sites);
      }

      showToast("Preset updated.");
    } else {
      const nextPreset = {
        id: createPresetId(),
        name,
        sites,
        isDefault: false,
        isSystem: false,
      };
      setPresets((current) => [...current, nextPreset]);
      showToast("Preset saved.");
    }

    resetDraft();
  };

  const applyPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setSelectedSites([...preset.sites]);
    showToast(`${preset.name} applied.`);
    onClose();
  };

  const setDefaultPreset = (presetId) => {
    setPresets((current) =>
      current.map((preset) => ({
        ...preset,
        isDefault: preset.id === presetId,
      }))
    );
    showToast("Default preset updated.");
  };

  const deletePreset = (presetId) => {
    const target = getPresetById(presets, presetId);
    if (!target || target.isSystem) return;

    const nextRaw = presets.filter((preset) => preset.id !== presetId);
    const next = target.isDefault
      ? nextRaw.map((preset, index) => ({
          ...preset,
          isDefault: index === 0,
        }))
      : nextRaw;

    setPresets(next);

    if (selectedPresetId === presetId) {
      const fallbackId = getDefaultPresetId(next);
      const fallbackPreset = getPresetById(next, fallbackId);
      setSelectedPresetId(fallbackId);
      setSelectedSites(fallbackPreset?.sites || []);
    }

    if (draftId === presetId) resetDraft();
    showToast("Preset deleted.");
  };

  const applyDraftToDashboard = () => {
    if (!draftSites.length) return showToast("Choose at least one marketplace.");
    setSelectedSites(draftSites);
    showToast("Draft applied to dashboard.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-[32px] border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40 md:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Preset manager</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">Manage presets</h3>
            <p className="mt-2 text-sm text-slate-300">
              Create custom presets, set a default, and keep the dashboard cleaner.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[28px] border border-white/10 bg-slate-950 p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-white">
                {draftId ? "Edit preset" : "Create custom preset"}
              </h4>
              {draftId ? (
                <button
                  type="button"
                  onClick={resetDraft}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-400">Preset name</label>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Example: Wholesale Quick Check"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="mt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">Marketplaces</p>
                <button
                  type="button"
                  onClick={() => setDraftSites([...FREE_SITE_NAMES])}
                  className="text-sm text-emerald-300 hover:text-emerald-200"
                >
                  Select all free
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {SITE_CONFIG.map((site) => (
                  <SiteCard
                    key={site.name}
                    name={site.name}
                    selected={draftSites.includes(site.name)}
                    locked={!site.free}
                    onClick={() => toggleDraftSite(site)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={savePreset}
                className="flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950"
              >
                <Save className="h-4 w-4" />
                {draftId ? "Save Changes" : "Save Preset"}
              </button>
              <button
                type="button"
                onClick={applyDraftToDashboard}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white"
              >
                Apply to Dashboard
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950 p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-white">Saved presets</h4>
              <span className="text-sm text-slate-400">{presets.length} total</span>
            </div>

            <div className="mt-4 space-y-3">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{preset.name}</p>
                    {preset.isDefault ? (
                      <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-[11px] font-semibold text-slate-950">
                        Default
                      </span>
                    ) : null}
                    {preset.isSystem ? (
                      <span className="rounded-full border border-white/10 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300">
                        System
                      </span>
                    ) : null}
                    {selectedPresetId === preset.id ? (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{preset.sites.join(", ")}</p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <button
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="font-medium text-emerald-300 hover:text-emerald-200"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => editPreset(preset)}
                      className="inline-flex items-center gap-1 font-medium text-slate-300 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultPreset(preset.id)}
                      className="inline-flex items-center gap-1 font-medium text-slate-300 hover:text-white"
                    >
                      <Star className="h-3.5 w-3.5" /> Set Default
                    </button>
                    {!preset.isSystem ? (
                      <button
                        type="button"
                        onClick={() => deletePreset(preset.id)}
                        className="inline-flex items-center gap-1 font-medium text-red-300 hover:text-red-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-lg font-semibold text-white">Justified Shop</p>
            <p className="text-sm text-slate-400">Search Faster. Source Smarter.</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#dashboard" className="hover:text-white">Dashboard</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#login" className="hover:text-white">Login</a>
          <a
            href="#pricing"
            className="rounded-2xl bg-emerald-400 px-4 py-2 font-semibold text-slate-950"
          >
            Start Free
          </a>
        </nav>

        <button
          type="button"
          className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-slate-300">
            <a href="#features">Features</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#pricing">Pricing</a>
            <a href="#login">Login</a>
            <a
              href="#pricing"
              className="mt-2 rounded-2xl bg-emerald-400 px-4 py-3 text-center font-semibold text-slate-950"
            >
              Start Free
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),transparent_30%),radial-gradient(circle_at_left,rgba(16,185,129,0.08),transparent_28%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm text-emerald-300">
            Built for arbitrage sellers and wholesale sellers
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-white md:text-6xl">
            Search Once. Check Every Marketplace.
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-emerald-300">
            Search Faster. Source Smarter.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Instantly open product searches across Amazon, Walmart, eBay, eBay Sold,
            Home Depot, Lowe&apos;s, Google, and more from one clean workflow built for
            resellers.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#pricing"
              className="rounded-2xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
            >
              Start Free
            </a>
            <a
              href="#dashboard"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white"
            >
              See the Dashboard
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {SITE_CONFIG.map((site) => (
              <Pill key={site.name}>{site.name}</Pill>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="rounded-[28px] border border-white/10 bg-slate-950 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Product search preview</p>
                <h3 className="text-xl font-semibold text-white">
                  Search Faster. Source Smarter.
                </h3>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Live preview
              </div>
            </div>
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-slate-300">
              Klein 11-in-1 screwdriver
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
                Exact Part #
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
                Clean preset dropdown
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {SITE_CONFIG.slice(0, 6).map((site) => (
                <div
                  key={site.name}
                  className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-200"
                >
                  {site.name}
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button className="rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
                Open Selected Sites
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white">
                Save Preset
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      title: "Search once, check everywhere",
      text: "Enter a product name, model number, or UPC and instantly open results across the marketplaces sellers already use every day.",
    },
    {
      title: "Built for real sourcing speed",
      text: "Stop opening tabs one by one. Check more products faster and keep your sourcing flow moving.",
    },
    {
      title: "Made by an actual seller",
      text: "Built from a real e-commerce workflow by someone who understands wholesale, marketplaces, and daily sourcing pain.",
    },
  ];

  return (
    <section id="features" className="scroll-mt-28 mx-auto max-w-7xl px-6 py-20 md:px-10">
      <SectionTitle
        eyebrow="Why it works"
        title="A clean workflow beats a cluttered tool."
        text="The customer version should feel obvious from the first click. No crowded dashboard. No bloated features. Just a faster way to check products."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-slate-300">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardPreview() {
  const initialPresets = useMemo(
    () => normalizePresets(readStorage(STORAGE_KEYS.presets, DEFAULT_PRESETS)),
    []
  );

  const [search, setSearch] = useState("");
  const searchInputRef = useRef(null);
  const [searchType, setSearchType] = useState("Exact Part #");
  const [presets, setPresets] = useState(initialPresets);
  const [selectedPresetId, setSelectedPresetId] = useState(() =>
    mergeSelectedPresetId(readStorage(STORAGE_KEYS.selectedPresetId, ""), initialPresets)
  );
  const [selectedSites, setSelectedSites] = useState(() => {
    const saved = readStorage(STORAGE_KEYS.selectedSites, null);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    const activePresetId = mergeSelectedPresetId(
      readStorage(STORAGE_KEYS.selectedPresetId, ""),
      initialPresets
    );
    return getPresetById(initialPresets, activePresetId)?.sites || [];
  });
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = readStorage(STORAGE_KEYS.recentSearches, null);
    return Array.isArray(saved) && saved.length ? saved.slice(0, 8) : DEFAULT_RECENT;
  });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [replaceOpenTabs, setReplaceOpenTabs] = useState(true);
  const [openedSearchWindows, setOpenedSearchWindows] = useState([]);
  const [toast, setToast] = useState("");
  const activeTrackedTabs = openedSearchWindows.filter((tab) => tab && !tab.closed).length;
  const showingExampleSearches = recentSearches.every((item) => DEFAULT_RECENT.includes(item));

  const selectedCount = useMemo(() => selectedSites.length, [selectedSites]);
  const cleanedTerm = useMemo(() => cleanSearchTerm(search, searchType), [search, searchType]);
  const selectedPreset = useMemo(
    () => getPresetById(presets, selectedPresetId),
    [presets, selectedPresetId]
  );
  const mockSnapshot = [
  { site: "Amazon", price: "$24.99" },
  { site: "Walmart", price: "$21.88" },
  { site: "eBay", price: "$19.50" },
  { site: "Target", price: "No result" },
];

const snapshotPrices = mockSnapshot
  .map((item) => {
    const value = Number(String(item.price).replace(/[^0-9.]/g, ""));
    return Number.isFinite(value) ? value : null;
  })
  .filter((value) => value !== null);

const lowestPrice =
  snapshotPrices.length > 0 ? `$${Math.min(...snapshotPrices).toFixed(2)}` : "—";

const highestPrice =
  snapshotPrices.length > 0 ? `$${Math.max(...snapshotPrices).toFixed(2)}` : "—";

const spreadPrice =
  snapshotPrices.length > 1
    ? `$${(Math.max(...snapshotPrices) - Math.min(...snapshotPrices)).toFixed(2)}`
    : "—";
const presetMatchesSelection = useMemo(() => {
  if (!selectedPreset) return false;

  if (selectedPreset.sites.length !== selectedSites.length) return false;

  return selectedPreset.sites.every((site) => selectedSites.includes(site));
}, [selectedPreset, selectedSites]);
  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    writeStorage(STORAGE_KEYS.presets, presets);
  }, [presets]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.selectedPresetId, selectedPresetId);
  }, [selectedPresetId]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.selectedSites, selectedSites);
  }, [selectedSites]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.recentSearches, recentSearches);
  }, [recentSearches]);

  useEffect(() => {
    const mergedId = mergeSelectedPresetId(selectedPresetId, presets);
    if (mergedId !== selectedPresetId) {
      setSelectedPresetId(mergedId);
      setSelectedSites(getPresetById(presets, mergedId)?.sites || []);
    }
  }, [presets, selectedPresetId]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const closeTrackedTabs = () => {
    if (!openedSearchWindows.length) return 0;

    let closedCount = 0;
    openedSearchWindows.forEach((tab) => {
      try {
        if (tab && !tab.closed) {
          tab.close();
          closedCount += 1;
        }
      } catch {
        // ignore browser tab close issues
      }
    });

    setOpenedSearchWindows([]);
    return closedCount;
  };

  const handlePresetChange = (event) => {
    const nextPreset = getPresetById(presets, event.target.value);
    if (!nextPreset) return;
    setSelectedPresetId(nextPreset.id);
    setSelectedSites([...nextPreset.sites]);
  };

  const toggleSite = (site) => {
    if (!site.free) {
      setShowUpgrade(true);
      return;
    }

    setSelectedSites((current) =>
      current.includes(site.name)
        ? current.filter((item) => item !== site.name)
        : [...current, site.name]
    );
  };

  const selectAllFree = () => setSelectedSites([...FREE_SITE_NAMES]);
  const clearAll = () => setSelectedSites([]);

  const openSearchUrls = (siteNames, successMessage) => {
    if (!cleanedTerm) return showToast("Enter a search term first.");
    if (!siteNames.length) return showToast("Choose at least one site.");

    let replacedCount = 0;
    if (replaceOpenTabs) {
      replacedCount = closeTrackedTabs();
    }

    const urls = buildUrls(cleanedTerm, siteNames);
    const newTabs = openUrlsInTabs(urls);

    setOpenedSearchWindows(newTabs);
    setRecentSearches((current) =>
      [cleanedTerm, ...current.filter((item) => item !== cleanedTerm)].slice(0, 8)
    );

    if (!newTabs.length) {
      showToast("Your browser blocked the tabs. Allow pop-ups for smoother searching.");
      return;
    }

    showToast(
      replacedCount > 0
        ? `${successMessage} Replaced ${replacedCount} previous tab${
            replacedCount === 1 ? "" : "s"
          }.`
        : successMessage
    );
  };

  const openSelected = () => {
    openSearchUrls(
      selectedSites,
      `Opened ${selectedSites.length} site${selectedSites.length === 1 ? "" : "s"}.`
    );
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const openAll = () => {
    openSearchUrls(FREE_SITE_NAMES, `Opened ${FREE_SITE_NAMES.length} free marketplaces.`);
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const closeLastSearchTabs = () => {
    const closedCount = closeTrackedTabs();
    if (!closedCount) {
      window.requestAnimationFrame(() => searchInputRef.current?.focus());
      return showToast("No previous search tabs are open right now.");
    }
    showToast(`Closed ${closedCount} tab${closedCount === 1 ? "" : "s"}.`);
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const copySearchTerm = async () => {
    if (!cleanedTerm) return showToast("Nothing to copy yet.");
    try {
      await navigator.clipboard.writeText(cleanedTerm);
      showToast("Search term copied.");
    } catch {
      showToast("Clipboard blocked in preview, but the button logic is ready.");
    }
  };

  const saveCurrentAsPreset = () => {
    setShowPresetManager(true);
  };

  return (
    <section id="dashboard" className="scroll-mt-28 border-y border-white/10 bg-white/5">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <SectionTitle
          eyebrow="Main dashboard"
          title="Search once. Check every marketplace instantly."
          text="Paste a product name, model number, or UPC and instantly open results across Amazon, Walmart, eBay, Home Depot, Lowe's, Google and more."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-slate-950 p-5 shadow-2xl shadow-black/30 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-slate-400">Search</p>
                <h3 className="text-2xl font-semibold text-white">Check products instantly</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {selectedCount} sites selected
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-slate-500" />
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && openSelected()}
                  className="w-full bg-transparent text-lg text-white outline-none placeholder:text-slate-500"
                  placeholder="Paste product name, model number, or UPC"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      window.requestAnimationFrame(() => searchInputRef.current?.focus());
                    }}
                    className="rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={openSelected}
                  className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-300"
                >
                  Search
                </button>
              </div>
            </div>
<div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
  <div className="flex items-start justify-between gap-3">
    <div>
      <p className="text-sm font-medium text-white">Quick Snapshot</p>
      <p className="text-sm text-slate-400">Fast price check across marketplaces</p>
    </div>
    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
      Preview
    </div>
  </div>

  <div className="mt-4 space-y-3">
    {mockSnapshot.map((item) => (
      <div
        key={item.site}
        className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
      >
        <span className="text-sm text-slate-300">{item.site}</span>
        <span
          className={cn(
            "text-sm font-semibold",
            item.price === "No result" ? "text-slate-500" : "text-white"
          )}
        >
          {item.price}
        </span>
      </div>
    ))}
  </div>

  <div className="mt-4 grid gap-3 sm:grid-cols-3">
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">Lowest found</p>
      <p className="mt-1 text-lg font-semibold text-emerald-300">{lowestPrice}</p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">Highest found</p>
      <p className="mt-1 text-lg font-semibold text-white">{highestPrice}</p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">Spread</p>
      <p className="mt-1 text-lg font-semibold text-white">{spreadPrice}</p>
    </div>
  </div>
</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm text-slate-400">Search type</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Exact Part #", "Broad", "UPC"].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setSearchType(type)}
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm font-medium",
                        searchType === type
                          ? "bg-emerald-400 font-semibold text-slate-950"
                          : "border border-white/10 bg-white/5 text-slate-300"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-slate-400">Preset</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selectedPresetId}
                      onChange={handlePresetChange}
                      className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white outline-none"
                    >
                      {presets.map((preset) => (
                        <option key={preset.id} value={preset.id} className="bg-slate-900 text-white">
                          {preset.name}
                          {preset.isDefault ? " • Default" : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={saveCurrentAsPreset}
                    className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Save Preset</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-400">
               Active preset: <span className="text-slate-200">{presetMatchesSelection ? selectedPreset?.name : "Custom"}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetManager(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
              >
                <Settings2 className="h-4 w-4" /> Manage Presets
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Tab handling</p>
                  <p className="text-sm text-slate-400">
                    Automatically close the last batch of search tabs before opening a new one.
                  </p>
                </div>
                <label className="inline-flex items-center gap-3 text-sm text-slate-300">
                  <button
                    type="button"
                    onClick={() => setReplaceOpenTabs((value) => !value)}
                    className={cn(
                      "relative h-7 w-12 rounded-full border transition",
                      replaceOpenTabs
                        ? "border-emerald-400/40 bg-emerald-400/20"
                        : "border-white/10 bg-slate-900"
                    )}
                    aria-pressed={replaceOpenTabs}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-5 w-5 rounded-full bg-white transition",
                        replaceOpenTabs ? "left-6" : "left-1"
                      )}
                    />
                  </button>
                  <span>{replaceOpenTabs ? "Replace previous tabs" : "Keep tabs open"}</span>
                </label>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-slate-400">
                  Tracked open search tabs: <span className="text-slate-200">{activeTrackedTabs}</span>
                </span>
                <button
                  type="button"
                  onClick={closeLastSearchTabs}
                  className="rounded-full border border-white/10 bg-slate-900 px-3 py-1.5 text-slate-300 hover:bg-white/10"
                >
                  Close Previous Tabs
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-400">Choose marketplaces</p>
                <div className="flex gap-2 text-sm">
                  <button
                    type="button"
                    onClick={selectAllFree}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {SITE_CONFIG.map((site) => (
                  <SiteCard
                    key={site.name}
                    name={site.name}
                    selected={selectedSites.includes(site.name)}
                    locked={!site.free}
                    onClick={() => toggleSite(site)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={openSelected}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3.5 font-semibold text-slate-950"
              >
                <ExternalLink className="h-4 w-4" /> Open Selected Sites
              </button>
              <button
                type="button"
                onClick={openAll}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white"
              >
                Open All
              </button>
              <button
                type="button"
                onClick={closeLastSearchTabs}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white"
              >
                Close Previous Tabs
              </button>
              <button
                type="button"
                onClick={copySearchTerm}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white"
              >
                <Copy className="h-4 w-4" /> Copy Search Term
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-slate-950 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    {showingExampleSearches ? "Example searches" : "Recent searches"}
                  </p>
                  <h3 className="text-xl font-semibold text-white">
                    {showingExampleSearches ? "Try one of these" : "Jump back in"}
                  </h3>
                </div>
                <Clock3 className="h-5 w-5 text-slate-500" />
              </div>

              <p className="mt-3 text-sm text-slate-400">
                {showingExampleSearches
                  ? "Starter examples to help new users test the workflow."
                  : "Your latest searches stay saved in this browser for quick repeat checks."}
              </p>

              <div className="mt-4 space-y-3">
                {recentSearches.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => {
                      setSearch(item);
                      window.requestAnimationFrame(() => searchInputRef.current?.focus());
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-950 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Saved presets</p>
                  <h3 className="text-xl font-semibold text-white">Fast workflows</h3>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="mt-4 space-y-3">
                {presets.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setSelectedSites([...preset.sites]);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10"
                  >
                    <span className="truncate pr-3">{preset.name}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {toast ? (
          <div className="fixed bottom-6 right-6 z-40 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl shadow-black/30">
            {toast}
          </div>
        ) : null}

        {showUpgrade ? <UpgradeModal onClose={() => setShowUpgrade(false)} /> : null}
        <PresetManagerModal
          open={showPresetManager}
          onClose={() => setShowPresetManager(false)}
          presets={presets}
          selectedPresetId={selectedPresetId}
          selectedSites={selectedSites}
          setSelectedPresetId={setSelectedPresetId}
          setSelectedSites={setSelectedSites}
          setPresets={setPresets}
          showToast={showToast}
        />
      </div>
    </section>
  );
}
const startCheckout = async (plan) => {
  try {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Checkout failed");
    }

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Checkout failed. Please try again.");
  }
};

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-28 mx-auto max-w-7xl px-6 py-20 md:px-10">
      <SectionTitle
        eyebrow="Pricing"
        title="A $29 tool that can save hours of sourcing every week."
        text="Built for people who actually source products and compare marketplaces every day."
        center
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {pricing.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "rounded-[32px] border p-6",
              tier.featured
                ? "border-emerald-400/40 bg-emerald-400/10 shadow-xl shadow-emerald-500/10"
                : "border-white/10 bg-white/5"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
                <p className="mt-3 text-4xl font-bold text-white">{tier.price}</p>
                {tier.subprice ? (
                  <p className="mt-2 text-sm text-emerald-300">{tier.subprice}</p>
                ) : null}
                <p className="mt-3 text-slate-300">{tier.desc}</p>
              </div>
              {tier.featured ? (
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950">
                  {tier.badge || "Most Popular"}
                </span>
              ) : null}
            </div>
            <ul className="mt-6 space-y-3 text-slate-200">
              {tier.items.map((item) => (
                <li key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
    <button
  onClick={() => {
    if (tier.name === "Pro") startCheckout("pro-monthly")
    else if (tier.name === "Annual Plan") startCheckout("annual")
  }}
  className={cn(
    "mt-6 w-full rounded-2xl px-4 py-3 font-semibold",
    tier.featured
      ? "bg-emerald-400 text-slate-950"
      : "border border-white/10 bg-white/5 text-white"
  )}
>
  {tier.cta}
</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function LoginPreview() {
  return (
    <section id="login" className="scroll-mt-28 border-t border-white/10 bg-white/5">
      <div className="mx-auto grid max-w-7xl gap-0 px-6 py-20 md:px-10 lg:grid-cols-2">
        <div className="rounded-t-[32px] border border-white/10 bg-slate-950 p-8 lg:rounded-l-[32px] lg:rounded-tr-none lg:border-r-0">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="text-lg font-semibold text-white">Justified Shop</p>
              <p className="text-sm text-slate-400">Search Faster. Source Smarter.</p>
            </div>
          </div>
          <h3 className="mt-10 text-4xl font-bold text-white">Welcome back.</h3>
          <p className="mt-4 max-w-md text-slate-300">
            Log in and get back to checking products across every marketplace in seconds.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Pill>Fast</Pill>
            <Pill>Focused</Pill>
            <Pill>Seller-built</Pill>
          </div>
        </div>

        <div className="rounded-b-[32px] border border-white/10 bg-slate-900 p-8 lg:rounded-r-[32px] lg:rounded-bl-none">
          <p className="text-sm text-slate-400">Account access</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Sign in</h3>
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-400">Email</label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                defaultValue="seller@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Password</label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                defaultValue="password123"
              />
            </div>
            <button className="w-full rounded-2xl bg-emerald-400 px-5 py-3.5 font-semibold text-slate-950">
              Sign In
            </button>
            <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white">
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function UpgradeModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-[32px] border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/40 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-slate-400" />
            <h3 className="text-2xl font-semibold text-white">Upgrade to Pro</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-6">
            <p className="text-sm text-emerald-300">Move faster every day</p>
            <h4 className="mt-2 text-3xl font-bold text-white">Unlock the full workflow</h4>
            <p className="mt-4 text-emerald-50/90">
              Get saved presets, unlimited searches, search history, and eBay Sold access in one clean upgrade.
            </p>
            <div className="mt-6 space-y-3 text-sm text-emerald-50/90">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4" /> Unlimited searches
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4" /> Saved presets
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4" /> Search history
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4" /> eBay Sold access
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-semibold text-white">Pro Monthly</h4>
                  <p className="mt-2 text-slate-300">Best for daily sourcing</p>
                </div>
                <div className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950">
                  Most Popular
                </div>
              </div>
              <p className="mt-4 text-4xl font-bold text-white">
                $29<span className="text-lg font-medium text-slate-400">/mo</span>
              </p>
              <button className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-3.5 font-semibold text-slate-950">
                Start Pro
              </button>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-semibold text-white">Annual Plan</h4>
                  <p className="mt-2 text-slate-300">Best value for committed users</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Best Value
                </div>
              </div>
              <p className="mt-4 text-4xl font-bold text-white">
                $239<span className="text-lg font-medium text-slate-400"> / year</span>
              </p>
              <button className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white">
                Choose Annual Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="flex flex-col gap-6 text-sm text-slate-400 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-medium text-white">Justified Shop</p>
            <p>Search Faster. Source Smarter.</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 md:text-right">
            <a href="#features">Features</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#pricing">Pricing</a>
            <a href="#login">Login</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/billing">Billing &amp; Cancellations</a>
            <a href="mailto:support@justifiedventuresllc.com">support@justifiedventuresllc.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LegalPageLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="text-lg font-semibold text-white">Justified Shop</p>
              <p className="text-sm text-slate-400">Search Faster. Source Smarter.</p>
            </div>
          </div>
          <a
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 md:px-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 md:p-10">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{title}</h1>
          <div className="mt-8 space-y-6 text-sm leading-7 text-slate-300 md:text-base">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p>
        Justified Shop collects only the information needed to operate the service, such as
        account details, support requests, and basic usage information.
      </p>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">What we collect</h2>
        <p>
          We may collect your email address, subscription status, support communications, and
          standard technical information needed to keep the service running.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">How we use it</h2>
        <p>
          We use this information to provide access to the app, improve the product, process
          billing, respond to support requests, and maintain platform security.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Payments</h2>
        <p>
          Payment information is processed securely by our payment provider. Justified Shop does
          not store full credit card details on its own servers.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Data sharing</h2>
        <p>
          We do not sell your personal information. We may share limited information only with
          providers needed to operate the service, such as payment processors, hosting providers,
          or analytics tools.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Questions</h2>
        <p>
          If you have questions about this policy, contact us at{" "}
          <a
            className="text-emerald-300 hover:text-emerald-200"
            href="mailto:support@justifiedventuresllc.com"
          >
            support@justifiedventuresllc.com
          </a>
          .
        </p>
      </div>
    </LegalPageLayout>
  );
}

function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <p>
        Justified Shop provides marketplace research and workflow tools for sellers. By using the
        service, you agree to use it responsibly and in compliance with applicable marketplace,
        platform, and payment-provider rules.
      </p>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Use of the service</h2>
        <p>
          You are responsible for how you use the product, how you interpret search results, and
          how you conduct your business on third-party marketplaces.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Accounts and access</h2>
        <p>
          Access to paid features may require an active subscription. We may suspend or terminate
          access for misuse, abuse, fraud, or actions that threaten the service or other users.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">No business guarantees</h2>
        <p>
          Justified Shop is a productivity tool. We do not guarantee profits, sourcing outcomes,
          marketplace approvals, listing success, or uninterrupted access to third-party platforms.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Changes</h2>
        <p>
          We may update the service, pricing, or terms from time to time. Continued use of the
          service after changes means you accept the updated terms.
        </p>
      </div>
    </LegalPageLayout>
  );
}

function BillingPage() {
  return (
    <LegalPageLayout title="Billing & Cancellations">
      <p>
        Paid subscriptions renew automatically unless canceled before the next billing date.
        Monthly and annual plans remain active until the end of the current paid period.
      </p>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Plans</h2>
        <p>
          Justified Shop currently offers monthly and annual subscription options. Pricing is shown
          clearly at checkout before purchase.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Cancellation</h2>
        <p>
          You may cancel at any time before renewal. Canceling stops future billing but does not
          automatically create a refund for time already billed.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Refunds</h2>
        <p>
          Refund requests are reviewed case by case. If you need help with a billing issue, contact
          us at{" "}
          <a
            className="text-emerald-300 hover:text-emerald-200"
            href="mailto:support@justifiedventuresllc.com"
          >
            support@justifiedventuresllc.com
          </a>
          .
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Support</h2>
        <p>
          For billing questions, subscription problems, or cancellation help, email{" "}
          <a
            className="text-emerald-300 hover:text-emerald-200"
            href="mailto:support@justifiedventuresllc.com"
          >
            support@justifiedventuresllc.com
          </a>
          .
        </p>
      </div>
    </LegalPageLayout>
  );
}

export default function App() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

  if (pathname === "/privacy") {
    return <PrivacyPage />;
  }

  if (pathname === "/terms") {
    return <TermsPage />;
  }

  if (pathname === "/billing") {
    return <BillingPage />;
  }
if (pathname === "/success") {
  return <SuccessPage />;
}
  if (pathname === "/cancel") {
  return <CancelPage />;
}
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />
      <Hero />
      <Features />
      <DashboardPreview />
      <Pricing />
      <LoginPreview />
      <Footer />
    </div>
  );
}
function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
        <h1 className="text-3xl font-bold text-emerald-400 mb-4">
          Payment Successful
        </h1>
        <p className="text-slate-300 text-lg mb-4">
          Thank you for subscribing to Justified Shop Pro.
        </p>
        <p className="text-slate-400 mb-8">
          Your subscription is now active.
        </p>
        <a
          href="/"
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
function CancelPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
        <h1 className="text-3xl font-bold text-red-400 mb-4">
          Checkout Cancelled
        </h1>

        <p className="text-slate-300 text-lg mb-4">
          No payment was made.
        </p>

        <p className="text-slate-400 mb-8">
          You can come back anytime and subscribe when you're ready.
        </p>

        <a
          href="/"
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}









