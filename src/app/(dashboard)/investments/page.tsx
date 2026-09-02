"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, BarChart3, Banknote, Bitcoin,
    ChevronLeft, ChevronRight, RefreshCw, Search,
    TrendingUp, SlidersHorizontal, X,
} from "lucide-react";
import appClient from "@/lib/appClient";
import type { InvestmentPlanInterface } from "@/interface/investmentPlan";

// ─── Config ──────────────────────────────────────────────────────────────────

const RISK_CONFIG = {
    low:      { label: "Low Risk",      badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
    medium:   { label: "Moderate Risk", badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",          dot: "bg-blue-500"    },
    high:     { label: "High Risk",     badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",          dot: "bg-rose-500"    },
    very_high:{ label: "Very High",     badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",          dot: "bg-rose-500"    },
};

const CATEGORY_CONFIG: Record<string, { label: string; Icon: React.FC<{ className?: string }> }> = {
    monthly: { label: "Monthly SIP",    Icon: BarChart3  },
    lumpsum: { label: "Lump Sum",       Icon: Banknote   },
    crypto:  { label: "Digital Assets", Icon: Bitcoin    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toNum(v: unknown, fallback = NaN) {
    return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function fmt(v: unknown) {
    const n = toNum(v);
    if (!Number.isFinite(n)) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtROI(plan: InvestmentPlanInterface) {
    const min = toNum(plan.roiMin);
    const max = toNum(plan.roiMax, min);
    if (!Number.isFinite(min)) return "N/A";
    return plan.roiType === "fixed" || min === max ? `${min}%` : `${min}% – ${max}%`;
}

function fmtDuration(minV: unknown, maxV: unknown) {
    const min = toNum(minV);
    const max = toNum(maxV, min);
    if (!Number.isFinite(min)) return "Flexible";
    return min === max ? `${min} Months` : `${min} – ${max} Months`;
}

function stripHtml(html?: string) {
    return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildHref(plan: InvestmentPlanInterface) {
    const slug = plan.slug || plan._id || encodeURIComponent(plan.name.toLowerCase().replace(/\s+/g, "-"));
    const id   = plan._id ? `?id=${encodeURIComponent(plan._id)}` : "";
    return `/investments/${slug}${id}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={[
                "h-9 shrink-0 rounded-xl border px-5 text-[13px] font-semibold transition",
                active
                    ? "border-[#083B93] bg-[#083B93] text-white shadow-[0_6px_16px_rgba(8,59,147,0.18)]"
                    : "border-[#E2E8F0] bg-white text-[#0F172A]/65 hover:border-[#083B93]/40 hover:bg-[#f7faff] hover:text-[#083B93]",
            ].join(" ")}
        >
            {label}
        </button>
    );
}

function MetricRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-[#0F172A]/55">{label}</span>
            <span className="text-right text-[13px] font-bold text-[#0F172A]">{value}</span>
        </div>
    );
}

function PlanCard({ plan, index, onView }: {
    plan: InvestmentPlanInterface;
    index: number;
    onView: (p: InvestmentPlanInterface) => void;
}) {
    const risk     = RISK_CONFIG[plan.riskLevel] ?? RISK_CONFIG.medium;
    const category = CATEGORY_CONFIG[plan.category] ?? CATEGORY_CONFIG.lumpsum;
    const { Icon } = category;
    const desc = stripHtml(plan.shortDescription) || "Professionally managed strategy focused on disciplined allocation and transparent reporting.";

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className="group flex flex-col rounded-2xl border border-[#D7E0F1] bg-white p-6 shadow-[0_8px_32px_rgba(11,35,74,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(11,35,74,0.12)]"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#073889] text-white shadow-[0_8px_18px_rgba(7,56,137,0.18)]">
                    <Icon className="h-5.5 w-5.5" />
                </div>
                <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${risk.badge}`}>
                    {risk.label}
                </span>
            </div>

            <h3 className="mt-5 text-[17px] font-bold leading-snug text-[#071F55]">{plan.name}</h3>
            <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-[#071F55]/65">{desc}</p>

            <div className="mt-6 space-y-2.5">
                <MetricRow label="Min. Investment"        value={fmt(plan.minAmount)} />
                <MetricRow label="Expected Annual Return" value={fmtROI(plan)} />
                <MetricRow label="Investment Horizon"     value={fmtDuration(plan.durationMinMonths, plan.durationMaxMonths)} />
            </div>

            <button
                onClick={() => onView(plan)}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0B3D91] text-[13px] font-bold text-[#071F55] transition hover:bg-[#071F55] hover:text-white"
            >
                View Details
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
        </motion.article>
    );
}

function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-2xl border border-[#D7E0F1] bg-white p-6">
            <div className="h-12 w-12 rounded-xl bg-slate-200" />
            <div className="mt-5 h-4 w-3/4 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-full rounded bg-slate-100" />
            <div className="mt-1.5 h-3 w-4/5 rounded bg-slate-100" />
            <div className="mt-6 space-y-3">
                <div className="h-3.5 rounded bg-slate-100" />
                <div className="h-3.5 rounded bg-slate-100" />
                <div className="h-3.5 rounded bg-slate-100" />
            </div>
            <div className="mt-6 h-11 rounded-xl bg-slate-100" />
        </div>
    );
}

function EmptyState({ onClear }: { onClear: () => void }) {
    return (
        <div className="col-span-full rounded-2xl border border-dashed border-[#CBD7EC] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF4FF] text-[#0B3D91]">
                <TrendingUp className="h-6 w-6" />
            </div>
            <p className="mt-5 text-[17px] font-bold text-[#071F55]">No matching plans found</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-slate-500">
                Try a different risk level, category, or search term.
            </p>
            <button
                onClick={onClear}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#0B3D91] px-5 py-2.5 text-sm font-bold text-[#071F55] transition hover:bg-[#071F55] hover:text-white"
            >
                <RefreshCw className="h-4 w-4" /> Show all plans
            </button>
        </div>
    );
}

function Pagination({ page, totalPages, totalDocs, limit, onPageChange, onLimitChange }: {
    page: number; totalPages: number; totalDocs: number; limit: number;
    onPageChange: (p: number) => void; onLimitChange: (l: number) => void;
}) {
    const from = Math.min((page - 1) * limit + 1, totalDocs);
    const to   = Math.min(page * limit, totalDocs);

    return (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D7E0F1] bg-white px-5 py-3.5 shadow-sm">
            <p className="text-[12px] font-semibold tabular-nums text-[#071F55]/55">
                {totalDocs === 0 ? "No results" : `${from}–${to} of ${totalDocs} plans`}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D7E0F1] text-[#071F55]/60 transition hover:bg-[#f7faff] disabled:opacity-30"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="rounded-lg bg-[#083B93] px-3.5 py-1.5 text-[12px] font-bold text-white">
                    {page} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D7E0F1] text-[#071F55]/60 transition hover:bg-[#f7faff] disabled:opacity-30"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <select
                value={limit}
                onChange={e => onLimitChange(Number(e.target.value))}
                className="h-8 rounded-lg border border-[#D7E0F1] bg-white px-3 text-[12px] font-semibold text-[#071F55]/65 outline-none"
            >
                {[6, 9, 12, 24].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function BrowsePlansContent() {
    const router       = useRouter();
    const searchParams = useSearchParams();

    const [plans, setPlans]           = useState<InvestmentPlanInterface[]>([]);
    const [loading, setLoading]       = useState(true);
    const [totalDocs, setTotalDocs]   = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [page, setPage]               = useState(() => Number(searchParams.get("page") ?? "1"));
    const [limit, setLimit]             = useState(9);
    const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "");
    const [search, setSearch]           = useState(() => searchParams.get("search") ?? "");
    const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get("category") ?? "all");
    const [riskFilter, setRiskFilter]         = useState(() => searchParams.get("riskLevel") ?? "all");
    const [filterOpen, setFilterOpen]         = useState(false);

    // Debounce search input → committed search value
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 380);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Sync filters → URL (shallow replace, no scroll)
    useEffect(() => {
        const params = new URLSearchParams();
        if (search)                params.set("search",   search);
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        if (riskFilter     !== "all") params.set("riskLevel", riskFilter);
        if (page > 1)              params.set("page",     String(page));
        const qs = params.toString();
        router.replace(`/investments${qs ? `?${qs}` : ""}`, { scroll: false } as Parameters<typeof router.replace>[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, categoryFilter, riskFilter, page]);

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await appClient.get("/api/investment-plans/get", {
                params: {
                    page,
                    limit,
                    search,
                    status: "active",
                    category:  categoryFilter !== "all" ? categoryFilter  : undefined,
                    riskLevel: riskFilter    !== "all" ? riskFilter     : undefined,
                },
            });
            if (res.data?.status) {
                const d = res.data?.data ?? res.data?.plans ?? res.data?.investmentPlans;
                setPlans(d?.docs ?? d ?? []);
                setTotalDocs(d?.totalDocs  ?? 0);
                setTotalPages(d?.totalPages ?? 0);
            }
        } catch {
            setPlans([]); setTotalDocs(0); setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, categoryFilter, riskFilter]);

    useEffect(() => { void fetchPlans(); }, [fetchPlans]);

    const clearAll = () => {
        setCategoryFilter("all"); setRiskFilter("all");
        setSearchInput(""); setSearch(""); setPage(1);
    };

    const pickRisk = (r: string) => { setRiskFilter(r); setCategoryFilter("all"); setPage(1); };
    const pickCat  = (c: string) => { setCategoryFilter(c); setRiskFilter("all"); setPage(1); };

    const isFiltered = categoryFilter !== "all" || riskFilter !== "all" || !!search;

    const activeFilterLabel = useMemo(() => {
        if (categoryFilter !== "all") return CATEGORY_CONFIG[categoryFilter]?.label;
        if (riskFilter !== "all") return RISK_CONFIG[riskFilter as keyof typeof RISK_CONFIG]?.label;
        return null;
    }, [categoryFilter, riskFilter]);

    return (
        <div className="min-h-screen bg-[#EEF3FB]">

            {/* ── Page header ── */}
            <div className="border-b border-[#E2E8F0] bg-white px-6 py-6 sm:px-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#083B93]/70">
                    Dashboard
                </p>
                <h1 className="mt-1 text-[24px] font-bold text-[#0F172A]">Browse Plans</h1>
                <p className="mt-0.5 text-[13px] text-[#0F172A]/45">
                    Discover investment plans tailored to your goals and risk appetite.
                </p>
            </div>

            {/* ── Filters bar ── */}
            <div className="border-b border-[#E2E8F0] bg-white px-6 py-4 sm:px-8">
                <div className="flex flex-wrap items-center gap-3">

                    {/* Search */}
                    <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#0F172A]/30" />
                        <input
                            type="text"
                            placeholder="Search plans…"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-4 text-[13px] font-semibold text-[#0F172A] placeholder:text-[#0F172A]/30 outline-none focus:border-[#083B93] focus:ring-2 focus:ring-[#083B93]/10"
                        />
                        {searchInput && (
                            <button onClick={() => setSearchInput("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0F172A]/30 hover:text-[#0F172A]">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter toggle (mobile) */}
                    <button
                        onClick={() => setFilterOpen(o => !o)}
                        className={`flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold transition sm:hidden ${
                            filterOpen || isFiltered
                                ? "border-[#083B93] bg-[#083B93] text-white"
                                : "border-[#E2E8F0] bg-white text-[#0F172A]/65"
                        }`}
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Filters
                        {isFiltered && <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[10px]">1</span>}
                    </button>

                    {/* Pills — hidden on mobile unless filterOpen */}
                    <div className={`flex flex-wrap items-center gap-2 sm:flex ${filterOpen ? "flex" : "hidden"} w-full sm:w-auto`}>
                        <div className="h-5 w-px bg-[#E2E8F0] hidden sm:block" />
                        <FilterPill active={categoryFilter === "all" && riskFilter === "all" && !search} label="All Plans"      onClick={clearAll} />
                        <FilterPill active={riskFilter === "low"}                                         label="Low Risk"      onClick={() => pickRisk("low")} />
                        <FilterPill active={riskFilter === "medium"}                                      label="Moderate Risk" onClick={() => pickRisk("medium")} />
                        <FilterPill active={riskFilter === "high" || riskFilter === "very_high"}          label="High Risk"     onClick={() => pickRisk("high")} />
                        <div className="h-5 w-px bg-[#E2E8F0]" />
                        <FilterPill active={categoryFilter === "monthly"} label="Monthly SIP"    onClick={() => pickCat("monthly")} />
                        <FilterPill active={categoryFilter === "lumpsum"} label="Lump Sum"       onClick={() => pickCat("lumpsum")} />
                        <FilterPill active={categoryFilter === "crypto"}  label="Digital Assets" onClick={() => pickCat("crypto")} />
                    </div>

                    {/* Active filter chip */}
                    {isFiltered && (
                        <div className="flex items-center gap-1.5 rounded-xl bg-[#EFF4FF] px-3 py-1.5 text-[12px] font-semibold text-[#083B93]">
                            {activeFilterLabel ?? search ? (activeFilterLabel || `"${search}"`) : "Filtered"}
                            <button onClick={clearAll} className="ml-0.5 hover:text-[#071F55]">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Plan grid ── */}
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

                {/* Results count */}
                {!loading && totalDocs > 0 && (
                    <p className="mb-5 text-[12.5px] font-semibold text-[#0F172A]/40">
                        {totalDocs} plan{totalDocs !== 1 ? "s" : ""} found
                        {activeFilterLabel ? ` · ${activeFilterLabel}` : ""}
                        {search ? ` · "${search}"` : ""}
                    </p>
                )}

                {loading ? (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {plans.length === 0
                                ? <EmptyState onClear={clearAll} />
                                : plans.map((plan, i) => (
                                    <PlanCard
                                        key={plan._id ?? plan.slug}
                                        plan={plan}
                                        index={i}
                                        onView={(p) => router.push(buildHref(p))}
                                    />
                                ))
                            }
                        </AnimatePresence>
                    </div>
                )}

                {!loading && totalPages > 1 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalDocs={totalDocs}
                        limit={limit}
                        onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        onLimitChange={l => { setLimit(l); setPage(1); }}
                    />
                )}
            </div>
        </div>
    );
}

export default function BrowsePlansPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#EEF3FB]">
                <div className="border-b border-[#E2E8F0] bg-white px-6 py-6 sm:px-8">
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-6 w-40 animate-pulse rounded bg-slate-200" />
                    <div className="mt-1.5 h-3 w-64 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="border-b border-[#E2E8F0] bg-white px-6 py-4 sm:px-8">
                    <div className="flex gap-3">
                        <div className="h-9 w-48 animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
                    </div>
                </div>
                <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="animate-pulse rounded-2xl border border-[#D7E0F1] bg-white p-6">
                                <div className="h-12 w-12 rounded-xl bg-slate-200" />
                                <div className="mt-5 h-4 w-3/4 rounded bg-slate-200" />
                                <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                                <div className="mt-1.5 h-3 w-4/5 rounded bg-slate-100" />
                                <div className="mt-6 space-y-3">
                                    <div className="h-3.5 rounded bg-slate-100" />
                                    <div className="h-3.5 rounded bg-slate-100" />
                                    <div className="h-3.5 rounded bg-slate-100" />
                                </div>
                                <div className="mt-6 h-11 rounded-xl bg-slate-100" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        }>
            <BrowsePlansContent />
        </Suspense>
    );
}
