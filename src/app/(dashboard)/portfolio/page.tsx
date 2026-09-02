"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AlertCircle, ArrowRight, BarChart3, Banknote, Bitcoin,
    BriefcaseBusiness, ChevronLeft, ChevronRight, Loader2,
    TrendingUp, Wallet,
} from "lucide-react";
import appClient from "@/lib/appClient";
import type { ClientPortfolioInterface, PortfolioListResponse, PortfolioListSummary } from "@/interface/portfolio";

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    paused: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    matured: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    closed: "bg-slate-500/15 text-slate-400 border-slate-500/20",
    cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const STATUS_LABEL: Record<string, string> = {
    active: "Active", paused: "Paused", matured: "Matured",
    closed: "Closed", cancelled: "Cancelled",
};

const CATEGORY_ICON = {
    monthly: BarChart3, lumpsum: Banknote, crypto: Bitcoin,
} as const;

const CATEGORY_LABEL: Record<string, string> = {
    monthly: "Monthly SIP", lumpsum: "Lump Sum", crypto: "Digital Assets",
};

const MODE_LABEL: Record<string, string> = {
    sip: "SIP", lumpsum: "Lump Sum",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(v: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD", maximumFractionDigits: 0,
    }).format(v);
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[#ffffff]/40">{label}</p>
            <p className="text-[22px] font-bold text-[#ffffff] leading-none">{value}</p>
            {sub && <p className="text-[11.5px] text-[#ffffff]/50">{sub}</p>}
        </div>
    );
}

function PortfolioCard({ p }: { p: ClientPortfolioInterface }) {
    const snapshot = p.planSnapshot;
    const CategoryIcon = CATEGORY_ICON[snapshot.category] ?? BarChart3;
    const statusStyle = STATUS_STYLES[p.status] ?? STATUS_STYLES.active;

    return (
        <Link href={`/portfolio/${p._id}`}
            className="group flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#0B2E84]/20">

            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF4FF]">
                        <CategoryIcon className="h-5 w-5 text-[#0B2E84]" />
                    </div>
                    <div>
                        <p className="text-[13.5px] font-bold text-[#0F172A] leading-tight line-clamp-1">
                            {snapshot.name}
                        </p>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">
                            {MODE_LABEL[p.investmentMode] ?? p.investmentMode}
                        </p>
                    </div>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${statusStyle}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#F8FAFC] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Invested</p>
                    <p className="mt-1 text-[13px] font-bold text-[#0F172A]">{fmt(p.summary.totalInvestedUsd)}</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Est. Profit</p>
                    <p className="mt-1 text-[13px] font-bold text-emerald-600">{fmt(p.summary.totalExpectedProfitUsd)}</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Maturity</p>
                    <p className="mt-1 text-[13px] font-bold text-[#0F172A]">{fmtDate(p.maturityDate)}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                <p className="font-mono text-[11px] text-slate-400">{p.portfolioId}</p>
                <span className="flex items-center gap-1 text-[12px] font-semibold text-[#0B2E84] opacity-0 transition group-hover:opacity-100">
                    View details <ArrowRight className="h-3.5 w-3.5" />
                </span>
            </div>
        </Link>
    );
}

function EmptyState({ filtered }: { filtered: boolean }) {
    return (
        <div className="col-span-full flex flex-col items-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF4FF]">
                <BriefcaseBusiness className="h-8 w-8 text-[#0B2E84]" />
            </div>
            <h3 className="mt-5 text-[16px] font-bold text-[#0F172A]">
                {filtered ? "No portfolios match" : "No investments yet"}
            </h3>
            <p className="mt-2 max-w-xs text-[13px] leading-6 text-slate-500">
                {filtered
                    ? "Try changing the filters to see more portfolios."
                    : "Browse investment plans and make your first investment to get started."}
            </p>
            {!filtered && (
                <Link href="/investments"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B2E84] px-5 py-2.5 text-[13px] font-bold text-[#ffffff] hover:bg-[#082461]">
                    <TrendingUp className="h-4 w-4" /> Browse Plans
                </Link>
            )}
        </div>
    );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

const MODE_FILTERS = [
    { label: "All", value: "" },
    { label: "SIP", value: "sip" },
    { label: "Lump Sum", value: "lumpsum" },
];

const STATUS_FILTERS = [
    { label: "All Status", value: "" },
    { label: "Active", value: "active" },
    { label: "Paused", value: "paused" },
    { label: "Matured", value: "matured" },
    { label: "Closed", value: "closed" },
];

function FilterPill({
    label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick}
            className={`h-8 shrink-0 rounded-full px-4 text-[12.5px] font-semibold transition
                ${active
                    ? "bg-[#0B2E84] text-[#ffffff] shadow-sm"
                    : "bg-white border border-[#E2E8F0] text-[#0F172A]/60 hover:border-[#0B2E84]/30 hover:text-[#0B2E84]"
                }`}>
            {label}
        </button>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="min-h-screen bg-[#EEF3FB]">
            <div className="bg-[#0B1628] px-6 py-10 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="h-6 w-40 animate-pulse rounded-lg bg-white/10" />
                    <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/10" />
                        ))}
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 animate-pulse rounded-2xl bg-white" />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function PortfolioListContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const urlMode = searchParams.get("mode") ?? "";
    const urlStatus = searchParams.get("status") ?? "";
    const urlPage = Number(searchParams.get("page") ?? "1");

    const [portfolios, setPortfolios] = useState<ClientPortfolioInterface[]>([]);
    const [summary, setSummary] = useState<PortfolioListSummary | null>(null);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 9 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [mode, setMode] = useState(urlMode);
    const [status, setStatus] = useState(urlStatus);
    const [page, setPage] = useState(urlPage);

    function syncUrl(nextMode: string, nextStatus: string, nextPage: number) {
        const p = new URLSearchParams();
        if (nextMode) p.set("mode", nextMode);
        if (nextStatus) p.set("status", nextStatus);
        if (nextPage > 1) p.set("page", String(nextPage));
        router.replace(`?${p.toString()}`, { scroll: false });
    }

    const fetchPortfolios = useCallback(async (m: string, s: string, pg: number) => {
        setLoading(true); setError(null);
        try {
            const params: Record<string, string> = { page: String(pg), limit: "9" };
            if (m) params.investmentMode = m;
            if (s) params.status = s;
            const res = await appClient.get("/api/portfolio/my", { params });
            const data = res.data as PortfolioListResponse;
            setPortfolios(data.portfolios ?? []);
            setSummary(data.summary ?? null);
            setPagination(data.pagination ?? { total: 0, page: pg, totalPages: 1, limit: 9 });
        } catch {
            setError("Could not load your portfolios. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void fetchPortfolios(mode, status, page); }, [fetchPortfolios, mode, status, page]);

    function handleMode(v: string) {
        setMode(v); setPage(1); syncUrl(v, status, 1);
    }
    function handleStatus(v: string) {
        setStatus(v); setPage(1); syncUrl(mode, v, 1);
    }
    function handlePage(n: number) {
        setPage(n); syncUrl(mode, status, n);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const isFiltered = !!(mode || status);

    if (loading) return <Skeleton />;

    return (
        <div className="min-h-screen bg-[#EEF3FB]">

            {/* ── Hero stats ── */}
            <div className="bg-[#0B1628]">
                <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                            <BriefcaseBusiness className="h-5 w-5 text-[#ffffff]" />
                        </div>
                        <h1 className="text-[18px] font-bold text-[#ffffff]">My Portfolio</h1>
                    </div>

                    {summary ? (
                        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                            <HeroStat
                                label="Total Invested"
                                value={fmt(summary.totalInvestedUsd)}
                            />
                            <HeroStat
                                label="Expected Profit"
                                value={fmt(summary.totalExpectedProfitUsd)}
                                sub={`Current value ${fmt(summary.totalCurrentValueUsd)}`}
                            />
                            <HeroStat
                                label="Active Portfolios"
                                value={String(summary.activePortfolioCount)}
                                sub={`${summary.lumpsumCount} lump sum`}
                            />
                            <HeroStat
                                label="Monthly SIPs"
                                value={String(summary.monthlySipCount)}
                                sub="Running installments"
                            />
                        </div>
                    ) : (
                        <div className="mt-8 flex items-center gap-3 text-[13px] text-[#ffffff]/50">
                            <Wallet className="h-4 w-4" /> No investments yet
                        </div>
                    )}
                </div>
            </div>

            {/* ── Filters + Grid ── */}
            <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">

                {/* Filter bar */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <div className="flex gap-2">
                        {MODE_FILTERS.map(f => (
                            <FilterPill key={f.value} label={f.label}
                                active={mode === f.value} onClick={() => handleMode(f.value)} />
                        ))}
                    </div>
                    <div className="ml-auto flex gap-2">
                        {STATUS_FILTERS.map(f => (
                            <FilterPill key={f.value} label={f.label}
                                active={status === f.value} onClick={() => handleStatus(f.value)} />
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-[13px] text-rose-700">
                        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                )}

                {/* Grid */}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {portfolios.length === 0
                        ? <EmptyState filtered={isFiltered} />
                        : portfolios.map(p => <PortfolioCard key={p._id} p={p} />)
                    }
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => handlePage(page - 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A]/60 hover:border-[#0B2E84]/30 hover:text-[#0B2E84] disabled:opacity-30 disabled:cursor-not-allowed">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(n => (
                            <button key={n} onClick={() => handlePage(n)}
                                className={`h-9 w-9 rounded-xl text-[13px] font-semibold transition
                                    ${page === n
                                        ? "bg-[#0B2E84] text-[#ffffff]"
                                        : "border border-[#E2E8F0] bg-white text-[#0F172A]/60 hover:border-[#0B2E84]/30 hover:text-[#0B2E84]"
                                    }`}>
                                {n}
                            </button>
                        ))}
                        <button
                            disabled={page >= pagination.totalPages}
                            onClick={() => handlePage(page + 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A]/60 hover:border-[#0B2E84]/30 hover:text-[#0B2E84] disabled:opacity-30 disabled:cursor-not-allowed">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#EEF3FB]"><Loader2 className="h-8 w-8 animate-spin text-[#0B2E84]" /></div>}>
            <PortfolioListContent />
        </Suspense>
    );
}
