"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, FileText, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import appClient from "@/lib/appClient";
import type { BondInterface, BondPageResult } from "@/interface/bond";

const riskStyle: Record<string, string> = {
    low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    medium: "bg-blue-50 text-blue-700 ring-blue-200",
    high: "bg-amber-50 text-amber-700 ring-amber-200",
    very_high: "bg-rose-50 text-rose-700 ring-rose-200",
};

const label = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const termText = (months: number) => months % 12 === 0 ? `${months / 12} year${months === 12 ? "" : "s"}` : `${months} months`;

export default function BondsCatalog() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [result, setResult] = useState<BondPageResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const page = Number(searchParams.get("page") || 1);
    const search = searchParams.get("search") || "";
    const term = searchParams.get("term") || "";
    const couponFrequency = searchParams.get("couponFrequency") || "";
    const riskLevel = searchParams.get("riskLevel") || "";

    const setFilter = useCallback((key: string, value: string) => {
        const next = new URLSearchParams(searchParams.toString());
        if (value) next.set(key, value); else next.delete(key);
        if (key !== "page") next.delete("page");
        router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`);
    }, [pathname, router, searchParams]);

    const load = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const response = await appClient.get("/api/bonds", { params: { page, limit: 8, search, term, couponFrequency, riskLevel } });
            setResult(response.data.bonds);
        } catch (err: unknown) {
            const typed = err as { response?: { data?: { message?: string } } };
            setError(typed.response?.data?.message || "We could not load available bonds.");
        } finally { setLoading(false); }
    }, [couponFrequency, page, riskLevel, search, term]);

    useEffect(() => { void load(); }, [load]);

    const hasFilters = Boolean(search || term || couponFrequency || riskLevel);
    const clearFilters = () => router.replace(pathname);

    return (
        <div className="min-h-screen bg-[#EEF3FB]">
            <header className="border-b border-[#E2E8F0] bg-white px-6 py-6 sm:px-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#083B93]/70">Dashboard</p>
                <h1 className="mt-1 text-[24px] font-bold text-[#0F172A]">Explore Bonds</h1>
                <p className="mt-0.5 text-[13px] text-[#0F172A]/45">Discover fixed-income opportunities for your long-term financial goals.</p>
            </header>

            <section className="border-b border-[#E2E8F0] bg-white px-6 py-4 sm:px-8">
                <div className="grid gap-3 md:grid-cols-[1.6fr_repeat(3,1fr)]">
                <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 focus-within:border-[#0b3d91] focus-within:bg-white">
                    <Search className="h-4 w-4" />
                    <input value={search} onChange={(event) => setFilter("search", event.target.value)} placeholder="Search bonds" className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
                </label>
                <Filter value={term} onChange={(value) => setFilter("term", value)} label="Term" options={[["", "All terms"], ["short", "Up to 3 years"], ["medium", "3–5 years"], ["long", "More than 5 years"]]} />
                <Filter value={couponFrequency} onChange={(value) => setFilter("couponFrequency", value)} label="Coupon frequency" options={[["", "All frequencies"], ["monthly", "Monthly"], ["quarterly", "Quarterly"], ["semiannual", "Semi-annual"], ["annual", "Annual"], ["maturity", "At maturity"]]} />
                <Filter value={riskLevel} onChange={(value) => setFilter("riskLevel", value)} label="Risk" options={[["", "All risk levels"], ["low", "Low"], ["medium", "Medium"], ["high", "High"], ["very_high", "Very high"]]} />
                </div>
                {hasFilters && <button onClick={clearFilters} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#EFF4FF] px-3 py-1.5 text-[12px] font-semibold text-[#083B93]">Clear filters <X className="h-3.5 w-3.5" /></button>}
            </section>

            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
                {!loading && result && <p className="mb-5 text-[12.5px] font-semibold text-[#0F172A]/40">{result.totalDocs} bond{result.totalDocs === 1 ? "" : "s"} found</p>}
                {error ? <Empty title="Bonds are unavailable" body={error} retry={load} /> : loading ? <LoadingCards /> : result?.docs.length ? (
                    <section className="space-y-3">
                        {result.docs.map((bond) => <BondCard key={bond._id} bond={bond} />)}
                        <Pagination result={result} onPage={(next) => setFilter("page", String(next))} />
                    </section>
                ) : <Empty title="No bonds match these filters" body="Try changing the search or filters to see available bond offerings." retry={clearFilters} />}
            </div>
        </div>
    );
}

function Filter({ value, onChange, label: title, options }: { value: string; onChange: (value: string) => void; label: string; options: string[][] }) {
    return <label className="relative"><span className="sr-only">{title}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm font-medium text-slate-600 outline-none transition focus:border-[#0b3d91]"><option disabled value="">{options[0][1]}</option>{options.slice(1).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select><span className="pointer-events-none absolute right-3 top-3 text-xs text-slate-400">⌄</span></label>;
}

function BondCard({ bond }: { bond: BondInterface }) {
    return <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1d4ed8]/30 hover:shadow-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-[#0b3d91]"><FileText className="h-6 w-6" /></div>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="font-serif text-2xl font-semibold text-[#08204a]">{bond.name}</h2><span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${riskStyle[bond.riskLevel] || riskStyle.medium}`}>{label(bond.riskLevel)} risk</span></div><p className="mt-1 line-clamp-1 text-sm text-slate-500">{bond.shortDescription || bond.description || "A fixed-income offering from Merlion Asset Holdings."}</p></div>
            <div className="grid grid-cols-2 gap-x-7 gap-y-3 text-sm sm:grid-cols-4 lg:contents">
                <Metric label="Annual coupon" value={`${bond.couponRateAnnual.toFixed(2)}%`} />
                <Metric label="Term" value={termText(bond.termMonths)} />
                <Metric label="Minimum" value={money(bond.minInvestment)} />
                <Metric label="Coupon frequency" value={label(bond.couponFrequency)} />
            </div>
            <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end"><span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500"><FileText className="h-4 w-4 text-[#0b3d91]" /> Offering document</span><Link href={`/bonds/${encodeURIComponent(bond.slug)}`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#082e6f] px-4 text-sm font-semibold text-white transition hover:bg-[#0b3d91]">View details <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
    </article>;
}

function Metric({ label: title, value }: { label: string; value: string }) { return <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</p><p className="mt-0.5 font-semibold text-[#08204a]">{value}</p></div>; }
function LoadingCards() { return <section className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</section>; }
function Empty({ title, body, retry }: { title: string; body: string; retry: () => void }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><ShieldCheck className="mx-auto h-9 w-9 text-[#0b3d91]" /><h2 className="mt-4 text-lg font-semibold text-[#08204a]">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{body}</p><button onClick={retry} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0b3d91]"><RefreshCw className="h-4 w-4" /> Reset filters</button></div>; }
function Pagination({ result, onPage }: { result: BondPageResult; onPage: (page: number) => void }) { return <div className="flex items-center justify-between pt-2 text-sm text-slate-500"><span>{result.totalDocs} available bond{result.totalDocs === 1 ? "" : "s"}</span><div className="flex gap-2"><button disabled={!result.hasPrevPage} onClick={() => onPage(result.page - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="px-2 py-2">Page {result.page} of {result.totalPages || 1}</span><button disabled={!result.hasNextPage} onClick={() => onPage(result.page + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>; }
