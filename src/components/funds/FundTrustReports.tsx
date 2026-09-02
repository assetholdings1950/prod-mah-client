"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CircleDollarSign, FileText, Info, PieChart, TrendingUp, Users } from "lucide-react";
import appClient from "@/lib/appClient";

type ActivityPeriod = {
    id?: string;
    rowId?: string;
    label: string;
    days: number;
    from?: string;
    to?: string;
    clients: number;
    capital: number;
};

type Allocation = {
    id?: string;
    rowId?: string;
    name: string;
    percentage: number;
    amount?: number;
    description?: string;
};

type ProfitPeriod = {
    id?: string;
    rowId?: string;
    label: string;
    days: number;
    from?: string;
    to?: string;
    profit: number;
    returnPercentage: number;
    feeBasis?: string;
    profitType?: string;
};

type FundTrustReport = {
    id: string;
    title: string;
    reportDate: string;
    reportTime: string;
    timezone: string;
    summary: string;
    methodology: string;
    disclosure?: string;
    activity: ActivityPeriod[];
    allocations: Allocation[];
    profits: ProfitPeriod[];
    allocationSource?: string;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function stripHtml(value?: string) {
    if (!value) return "";
    if (typeof window === "undefined") return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const parsed = new DOMParser().parseFromString(value, "text/html");
    return parsed.body.textContent?.replace(/\s+/g, " ").trim() || "";
}

function shortDate(value?: string) {
    if (!value) return "—";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function formatReportDate(value: string, time: string, timezone: string) {
    return `As of ${shortDate(value)} · ${time} ${timezone.toUpperCase()}`;
}

function sourceCapital(report: FundTrustReport) {
    const source = report.activity.find((item) => [item.id, item.rowId].filter(Boolean).includes(report.allocationSource));
    return Number(source?.capital ?? report.activity.reduce((largest, item) => item.days > largest.days ? item : largest, report.activity[0])?.capital ?? 0);
}

export default function FundTrustReports({ fundId, fundSlug }: { fundId?: string; fundSlug: string }) {
    const [reports, setReports] = useState<FundTrustReport[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const loadReports = async () => {
            setLoading(true);
            try {
                const response = await appClient.get("/api/fund-trust-reports/public", { params: { fundId, fundSlug, limit: 12 } });
                const nextReports = Array.isArray(response.data?.reports) ? response.data.reports : [];
                if (active) {
                    setReports(nextReports);
                    setSelectedId(nextReports[0]?.id ?? null);
                }
            } catch (error) {
                console.error("Error fetching fund trust reports:", error);
                if (active) setReports([]);
            } finally {
                if (active) setLoading(false);
            }
        };
        void loadReports();
        return () => { active = false; };
    }, [fundId, fundSlug]);

    const selected = useMemo(() => reports.find((report) => report.id === selectedId) ?? reports[0], [reports, selectedId]);

    if (loading) return <section aria-label="Loading fund trust reports" className="mx-auto max-w-5xl rounded-2xl border border-[#E2E8F0] bg-white p-7"><div className="h-7 w-56 animate-pulse rounded bg-slate-200" /><div className="mt-6 h-52 animate-pulse rounded-xl bg-slate-100" /></section>;
    if (!selected) return null;

    const capital = sourceCapital(selected);
    const disclosure = stripHtml(selected.disclosure) || stripHtml(selected.methodology);

    return (
        <section aria-labelledby="fund-trust-reports-title" className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#D8E2F0] bg-white shadow-[0_22px_70px_rgba(15,46,132,0.08)]">
            <div className="border-b border-[#E2E8F0] bg-gradient-to-r from-[#F4F7FF] via-white to-[#F8FBFF] px-6 py-7 sm:px-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#155EEF]">Transparent fund reporting</p>
                        <h2 id="fund-trust-reports-title" className="mt-2 font-serif text-2xl font-semibold text-[#0B2E84] sm:text-3xl">Fund trust reports</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Review client investment activity, where capital is allocated, and the profit reported for every published period.</p>
                    </div>
                    {reports.length > 1 && <div className="flex max-w-full gap-2 overflow-x-auto pb-1">{reports.map((report, index) => <button key={report.id} type="button" onClick={() => setSelectedId(report.id)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition ${report.id === selected.id ? "border-[#0B2E84] bg-[#0B2E84] text-white" : "border-[#CBD5E1] bg-white text-slate-600 hover:border-[#0B2E84]"}`}>{index === 0 ? "Latest report" : shortDate(report.reportDate)}</button>)}</div>}
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-7 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2.5"><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">Published</span><span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{formatReportDate(selected.reportDate, selected.reportTime, selected.timezone)}</span></div>
                        <h3 className="mt-3 font-serif text-xl font-semibold text-[#0B2E84] sm:text-2xl">{selected.title}</h3>
                        {selected.summary && <p className="mt-2 text-sm leading-6 text-slate-600">{stripHtml(selected.summary)}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-3 rounded-xl border border-[#DCE6F5] bg-[#F8FAFF] px-4 py-3"><FileText className="h-5 w-5 text-[#155EEF]" /><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Reporting currency</p><p className="mt-0.5 text-sm font-bold text-[#0B2E84]">USD</p></div></div>
                </div>

                <ReportSection icon={Users} eyebrow="Client participation" title="Investment activity by period" description="Aggregated client participation and capital received for every reporting window.">
                    <div className="grid gap-3 lg:grid-cols-3">
                        {selected.activity.map((period) => <article key={period.id ?? period.rowId ?? period.label} className="rounded-xl border border-[#E2E8F0] bg-[#FBFDFF] p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#155EEF]">{period.label}</p><p className="mt-2 text-[11px] text-slate-500">{shortDate(period.from)} — {shortDate(period.to)}</p><div className="mt-5 grid grid-cols-2 gap-4"><Detail label="Unique clients" value={Number(period.clients || 0).toLocaleString("en-US")} /><Detail label="Capital received" value={money.format(Number(period.capital || 0))} /></div></article>)}
                    </div>
                </ReportSection>

                <ReportSection icon={PieChart} eyebrow="Capital deployment" title="Where we invest" description={`Allocation is calculated against ${money.format(capital)} of received capital.`}>
                    <div className="space-y-3">
                        {selected.allocations.map((allocation) => {
                            const amount = Number(allocation.amount || capital * (Number(allocation.percentage || 0) / 100));
                            return <article key={allocation.id ?? allocation.rowId ?? allocation.name} className="grid gap-4 rounded-xl border border-[#E2E8F0] p-4 sm:grid-cols-[minmax(0,1fr)_160px_150px] sm:items-center"><div><h4 className="text-sm font-bold text-[#0F172A]">{allocation.name}</h4><p className="mt-1 text-xs leading-5 text-slate-500">{allocation.description || "Diversified allocation within the fund strategy."}</p></div><div><div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-500">Portfolio share</span><strong className="text-[#0B2E84]">{Number(allocation.percentage || 0).toFixed(0)}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-[#E8EEF8]"><div className="h-full rounded-full bg-gradient-to-r from-[#155EEF] to-[#0B2E84]" style={{ width: `${Math.min(100, Math.max(0, Number(allocation.percentage || 0)))}%` }} /></div></div><Detail label="Converted amount" value={money.format(amount)} /></article>;
                        })}
                    </div>
                </ReportSection>

                <ReportSection icon={TrendingUp} eyebrow="Published performance" title="Profit earned by period" description="Reported profit and return for each period. These figures describe past performance and are not guaranteed future returns.">
                    <div className="grid gap-3 lg:grid-cols-3">
                        {selected.profits.map((period) => <article key={period.id ?? period.rowId ?? period.label} className="rounded-xl border border-[#E2E8F0] bg-[#FBFDFF] p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#155EEF]">{period.label}</p><p className="mt-2 text-[11px] text-slate-500">{shortDate(period.from)} — {shortDate(period.to)}</p></div><BarChart3 className="h-5 w-5 text-[#155EEF]" /></div><div className="mt-5 grid grid-cols-2 gap-4"><Detail label="Profit earned" value={money.format(Number(period.profit || 0))} /><Detail label="Reported return" value={`${Number(period.returnPercentage || 0) >= 0 ? "+" : ""}${Number(period.returnPercentage || 0).toFixed(2)}%`} /></div><p className="mt-4 border-t border-[#E2E8F0] pt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">{period.feeBasis || "Net"} · {period.profitType || "Reported"}</p></article>)}
                    </div>
                </ReportSection>

                <div className="mt-8 flex gap-3 rounded-xl border border-[#DCE6F5] bg-[#F8FAFF] p-4 sm:p-5"><Info className="mt-0.5 h-5 w-5 shrink-0 text-[#155EEF]" /><div><p className="text-sm font-bold text-[#0B2E84]">Methodology & disclosure</p><p className="mt-1.5 text-xs leading-6 text-slate-600">{disclosure || "Reported figures use the published methodology for this fund. Past performance is not indicative of future results."}</p></div></div>
            </div>
        </section>
    );
}

function ReportSection({ icon: Icon, eyebrow, title, description, children }: { icon: typeof Users; eyebrow: string; title: string; description: string; children: React.ReactNode }) {
    return <section className="border-b border-[#E2E8F0] py-8 last:border-b-0"><div className="mb-5 flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#155EEF]"><Icon className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#155EEF]">{eyebrow}</p><h3 className="mt-1 font-serif text-xl font-semibold text-[#0B2E84]">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></div>{children}</section>;
}

function Detail({ label, value }: { label: string; value: string }) {
    return <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{label}</p><p className="mt-1 break-words font-serif text-lg font-semibold text-[#0B2E84]">{value}</p></div>;
}
