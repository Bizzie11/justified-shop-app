import { useMemo, useState } from "react";
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
} from "lucide-react";

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
      `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(term)}&LH_Sold=1&LH_Complete=1`,
  },
  {
    name: "Home Depot",
    free: true,
    buildUrl: (term) => `https://www.homedepot.com/s/${encodeURIComponent(term)}`,
  },
  {
    name: "Lowe's",
    free: true,
    buildUrl: (term) => `https://www.lowes.com/search?searchTerm=${encodeURIComponent(term)}`,
  },
  {
    name: "Google",
    free: true,
    buildUrl: (term) => `https://www.google.com/search?q=${encodeURIComponent(term)}`,
  },
];

const FREE_SITE_NAMES = SITE_CONFIG.filter((site) => site.free).map((site) => site.name);

const presetMap = {
  "Amazon + eBay Sold + Walmart": ["Amazon", "eBay Sold", "Walmart"],
  Hardware: ["Amazon", "Home Depot", "Lowe's", "Google"],
  Plumbing: ["Amazon", "Walmart", "Home Depot", "Google"],
  Wholesale: ["Amazon", "Walmart", "eBay", "Google"],
};

const presetNames = Object.keys(presetMap);

const recent = [
  "Milwaukee hole saw kit 49-22-5605",
  "Delta RP19804 cartridge",
  "Ridgid shop vac filter",
  "Klein screwdriver set",
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    desc: "Try the workflow and see how fast it feels.",
    items: ["Limited daily searches", "Core marketplaces", "Open selected sites"],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$19/mo",
    desc: "For serious sellers checking products every day.",
    items: ["Unlimited searches", "Saved presets", "Search history", "eBay Sold access"],
    cta: "Start Pro",
    featured: true,
  },
  {
    name: "Founders",
    price: "$49 once",
    desc: "Limited early supporter offer.",
    items: ["Lifetime access", "All current Pro features", "Priority feedback lane"],
    cta: "Claim Founders",
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function cleanSearchTerm(value, searchType) {
  const trimmed = value.trim();
  const noExtraSpaces = trimmed.replace(/\s+/g, " ");

  if (!noExtraSpaces) return "";
  if (searchType === "UPC") return noExtraSpaces.replace(/[^0-9]/g, "");
  if (searchType === "Exact") return noExtraSpaces;

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
  urls.forEach((item) => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  });
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
          <a href="#pricing" className="rounded-2xl bg-emerald-400 px-4 py-2 font-semibold text-slate-950">
            Start Free
          </a>
        </nav>

        <button
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
            Built for Amazon, Walmart, and eBay sellers
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-white md:text-6xl">
            Search Once. Check Every Marketplace.
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-emerald-300">
            Search Faster. Source Smarter.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Instantly open product searches across Amazon, Walmart, eBay, eBay Sold,
            Home Depot, Lowe's, Google, and more from one clean workflow built for
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
              Milwaukee hole saw kit 49-22-5605
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
                Exact Search
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
                Amazon + eBay Sold + Walmart
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
                Copy Search Term
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
    <section id="features" className="mx-auto max-w-7xl px-6 py-20 md:px-10">
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
  const [search, setSearch] = useState("Milwaukee hole saw kit 49-22-5605");
  const [searchType, setSearchType] = useState("Exact");
  const [selectedPreset, setSelectedPreset] = useState(presetNames[0]);
  const [selectedSites, setSelectedSites] = useState([...presetMap[presetNames[0]]]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [toast, setToast] = useState("");

  const selectedCount = useMemo(() => selectedSites.length, [selectedSites]);
  const cleanedTerm = useMemo(() => cleanSearchTerm(search, searchType), [search, searchType]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(""), 2200);
  };

  const handlePresetSelect = () => {
    const nextIndex = (presetNames.indexOf(selectedPreset) + 1) % presetNames.length;
    const nextPreset = presetNames[nextIndex];
    setSelectedPreset(nextPreset);
    setSelectedSites([...presetMap[nextPreset]]);
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

  const openSelected = () => {
    if (!cleanedTerm) return showToast("Enter a search term first.");
    if (!selectedSites.length) return showToast("Choose at least one site.");
    openUrlsInTabs(buildUrls(cleanedTerm, selectedSites));
    showToast(`Opened ${selectedSites.length} site${selectedSites.length === 1 ? "" : "s"}.`);
  };

  const openAll = () => {
    if (!cleanedTerm) return showToast("Enter a search term first.");
    openUrlsInTabs(buildUrls(cleanedTerm, FREE_SITE_NAMES));
    showToast(`Opened ${FREE_SITE_NAMES.length} free marketplaces.`);
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

  return (
    <section id="dashboard" className="border-y border-white/10 bg-white/5">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <SectionTitle
          eyebrow="Main dashboard"
          title="This is the screen that sells the product."
          text="Big search box. Clean site selection. Obvious primary action. That is the heart of the customer version."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Search</p>
                <h3 className="text-2xl font-semibold text-white">Check a product fast</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {selectedCount} sites selected
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && openSelected()}
                  className="w-full bg-transparent text-lg text-white outline-none placeholder:text-slate-500"
                  placeholder="Enter product name, model number, or UPC"
                />
              </div>
            </div>

            <div className="mt-3 text-sm text-slate-400">
              Cleaned search term: <span className="text-slate-200">{cleanedTerm || "—"}</span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm text-slate-400">Search type</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Exact", "Broad", "UPC"].map((type) => (
                    <button
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
                <button
                  onClick={handlePresetSelect}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                >
                  <span>{selectedPreset}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-400">Choose marketplaces</p>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={selectAllFree}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300"
                  >
                    Select All
                  </button>
                  <button
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

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <button
                onClick={openSelected}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3.5 font-semibold text-slate-950"
              >
                <ExternalLink className="h-4 w-4" /> Open Selected Sites
              </button>
              <button
                onClick={openAll}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white"
              >
                Open All
              </button>
              <button
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
                  <p className="text-sm text-slate-400">Recent searches</p>
                  <h3 className="text-xl font-semibold text-white">Jump back in</h3>
                </div>
                <Clock3 className="h-5 w-5 text-slate-500" />
              </div>
              <div className="mt-4 space-y-3">
                {recent.map((item) => (
                  <button
                    key={item}
                    onClick={() => setSearch(item)}
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
                {presetNames.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setSelectedPreset(preset);
                      setSelectedSites([...presetMap[preset]]);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10"
                  >
                    <span>{preset}</span>
                    <ExternalLink className="h-4 w-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {toast ? (
          <div className="fixed bottom-6 right-6 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl shadow-black/30">
            {toast}
          </div>
        ) : null}

        {showUpgrade ? <UpgradeModal onClose={() => setShowUpgrade(false)} /> : null}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 md:px-10">
      <SectionTitle
        eyebrow="Pricing"
        title="Start simple. Validate fast."
        text="This pricing structure is built to help you launch, get users, and improve from real feedback without overcomplicating version one."
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
                <p className="mt-3 text-slate-300">{tier.desc}</p>
              </div>
              {tier.featured ? (
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950">
                  Most Popular
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
    <section id="login" className="border-t border-white/10 bg-white/5">
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
              <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" defaultValue="seller@example.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Password</label>
              <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" defaultValue="password123" />
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
          <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300">
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
              <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4" /> Unlimited searches</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4" /> Saved presets</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4" /> Search history</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4" /> eBay Sold access</div>
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
                $19<span className="text-lg font-medium text-slate-400">/mo</span>
              </p>
              <button className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-3.5 font-semibold text-slate-950">
                Start Pro
              </button>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-semibold text-white">Founders Access</h4>
                  <p className="mt-2 text-slate-300">Limited early supporter offer</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Limited
                </div>
              </div>
              <p className="mt-4 text-4xl font-bold text-white">
                $49<span className="text-lg font-medium text-slate-400"> one-time</span>
              </p>
              <button className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white">
                Claim Founders Plan
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
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 text-sm text-slate-400 md:px-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-white">Justified Shop</p>
          <p>Search Faster. Source Smarter.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a href="#features">Features</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#pricing">Pricing</a>
          <a href="#login">Login</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
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