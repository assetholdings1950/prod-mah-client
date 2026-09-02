"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight, Banknote, BarChart3, Bitcoin, CalendarDays,
    CheckCircle2, ChevronDown, Clock, FileText, Landmark,
    LockKeyhole, Shield, ShieldCheck, TrendingUp, Wallet, Info,
} from "lucide-react";
import appClient from "@/lib/appClient";
import { InvestmentPlanInterface } from "@/interface/investmentPlan";
import FundTrustReports from "@/components/funds/FundTrustReports";

/* ─────────────────── CONFIG ─────────────────── */

const RISK_CONFIG = {
    low: { label: "Low", className: "bg-emerald-50 text-emerald-700" },
    medium: { label: "Medium", className: "bg-blue-50 text-[#0B2E84]" },
    high: { label: "High", className: "bg-rose-50 text-rose-700" },
    very_high: { label: "Very High", className: "bg-rose-50 text-rose-700" },
};

const CATEGORY_CONFIG = {
    monthly: { label: "Monthly SIP", eyebrow: "Monthly SIP Fund", Icon: BarChart3 },
    lumpsum: { label: "Lump Sum", eyebrow: "Lump Sum Fund", Icon: Banknote },
    crypto: { label: "Digital Assets", eyebrow: "Digital Asset Fund", Icon: Bitcoin },
};

const PAYOUT_LABEL: Record<InvestmentPlanInterface["payoutType"], string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    maturity: "At Maturity",
};

/* How each plan type works, in plain language — this is the thing that
   should make a first-time investor feel "okay, I get it." */
const HOW_IT_WORKS: Record<InvestmentPlanInterface["category"], (plan: InvestmentPlanInterface) => { icon: typeof CalendarDays; title: string; desc: string }[]> = {
    monthly: () => [
        { icon: CalendarDays, title: "Invest every month", desc: "Choose a fixed amount and contribute it every month — as simple as a standing instruction." },
        { icon: TrendingUp, title: "Your money grows", desc: "Each contribution is invested and grows steadily over your chosen SIP period." },
        { icon: Wallet, title: "Withdraw at maturity", desc: "Once your plan matures, withdraw your full contributions plus the interest earned." },
    ],
    lumpsum: plan => [
        { icon: Banknote, title: "Invest once", desc: "Make a single investment to get started — no recurring payments needed." },
        { icon: LockKeyhole, title: `${plan.lockInMonths ?? 12}-month lock-in`, desc: "Your money stays invested for this period so it has time to grow." },
        { icon: Wallet, title: "Withdraw with interest", desc: "Once the lock-in period ends, withdraw your full investment plus interest earned." },
    ],
    crypto: () => [
        { icon: Bitcoin, title: "Invest once", desc: "Allocate your funds in a single investment into our digital asset strategy." },
        { icon: CalendarDays, title: "Earn monthly payouts", desc: "Every month, interest earned on your investment becomes available to you." },
        { icon: Wallet, title: "Withdraw anytime", desc: "Withdraw your monthly payout in full, in part, or let it stay invested — your choice." },
    ],
};

/* Platform charges — shown transparently before the investor commits.
   `appliesNow` charges are deducted at the moment of investment; the rest
   only apply later, under the conditions described. */
type ChargeItem = { label: string; percent: number; appliesNow: boolean; note: string };

const CHARGES: Record<InvestmentPlanInterface["category"], (plan: InvestmentPlanInterface) => ChargeItem[]> = {
    monthly: () => [
        { label: "Processing Fee", percent: 1, appliesNow: true, note: "Deducted from each monthly contribution before it's invested." },
        { label: "Maturity Payout Fee", percent: 0.5, appliesNow: false, note: "Applied once, only when you withdraw your matured amount." },
    ],
    lumpsum: plan => [
        { label: "One-Time Setup Fee", percent: 1.5, appliesNow: true, note: "Deducted from your investment amount today." },
        { label: "Early Exit Penalty", percent: toFiniteNumber(plan.exitPenaltyPercent, 2), appliesNow: false, note: `Only applies if you withdraw before the ${plan.lockInMonths ?? 12}-month lock-in ends.` },
    ],
    crypto: () => [
        { label: "One-Time Setup Fee", percent: 2, appliesNow: true, note: "Covers custody and network costs, deducted upfront." },
        { label: "Monthly Withdrawal Fee", percent: 1, appliesNow: false, note: "Applied each time you withdraw a monthly payout." },
    ],
};

/* ─────────────────── HELPERS ─────────────────── */

function toFiniteNumber(value: unknown, fallback: number) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

const fmt = (value: unknown) => {
    const n = toFiniteNumber(value, NaN);
    if (!Number.isFinite(n)) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
};

const fmtROI = (plan: InvestmentPlanInterface) => {
    const min = toFiniteNumber(plan.roiMin, NaN);
    const max = toFiniteNumber(plan.roiMax, min);
    if (!Number.isFinite(min)) return "N/A";
    return plan.roiType === "fixed" || min === max ? `${min}%` : `${min}% - ${max}%`;
};

const fmtDuration = (minValue: unknown, maxValue: unknown) => {
    const min = toFiniteNumber(minValue, NaN);
    const max = toFiniteNumber(maxValue, min);
    if (!Number.isFinite(min)) return "Flexible";
    return min === max ? `${min} Months` : `${min} - ${max} Months`;
};

const isPlan = (value: unknown): value is InvestmentPlanInterface =>
    !!value && typeof value === "object" && "name" in value && "slug" in value && "minAmount" in value;

const normalizePlanPayload = (payload: unknown): InvestmentPlanInterface | null => {
    const data = payload as {
        data?: InvestmentPlanInterface | { docs?: InvestmentPlanInterface[] };
        plan?: InvestmentPlanInterface;
        investmentPlan?: InvestmentPlanInterface;
    };
    if (isPlan(data?.plan)) return data.plan;
    if (isPlan(data?.investmentPlan)) return data.investmentPlan;
    if (isPlan(data?.data)) return data.data;
    return null;
};

const normalizePlanList = (payload: unknown): InvestmentPlanInterface[] => {
    const data = payload as {
        data?: { docs?: InvestmentPlanInterface[] } | InvestmentPlanInterface[];
        plans?: { docs?: InvestmentPlanInterface[] } | InvestmentPlanInterface[];
        investmentPlans?: { docs?: InvestmentPlanInterface[] } | InvestmentPlanInterface[];
    };
    const raw = data?.data ?? data?.plans ?? data?.investmentPlans;
    if (Array.isArray(raw)) return raw;
    return raw?.docs ?? [];
};

/* ─────────────────── SKELETON ─────────────────── */

const DetailSkeleton = () => (
    <main className="min-h-screen bg-[#F8FAFC] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
            <div className="h-44 rounded-2xl bg-slate-200" />
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="h-[420px] rounded-2xl bg-slate-100" />
                <div className="h-[420px] rounded-2xl bg-slate-100" />
            </div>
        </div>
    </main>
);

/* ─────────────────── MAIN COMPONENT ─────────────────── */

export default function FundDetailPageClient({ slug, id }: { slug: string; id?: string }) {
    const [plan, setPlan] = useState<InvestmentPlanInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [investAmount, setInvestAmount] = useState(10000);
    const [termsOpen, setTermsOpen] = useState(false);

    const fetchPlan = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (id) {
                const res = await appClient.get("/api/investment-plans/get", { params: { id } });
                const selected = normalizePlanPayload(res.data);
                if (selected) {
                    setPlan(selected);
                    setInvestAmount(toFiniteNumber(selected.minAmount, 10000));
                    return;
                }
            }
            const decodedSlug = decodeURIComponent(slug);
            const res = await appClient.get("/api/investment-plans/get", {
                params: { page: 1, limit: 100, search: decodedSlug, status: "active" },
            });
            const list = normalizePlanList(res.data);
            const selected = list.find(item => item.slug === decodedSlug || item.slug === slug || item._id === id) ?? list[0] ?? null;
            setPlan(selected);
            if (selected) setInvestAmount(toFiniteNumber(selected.minAmount, 10000));
            if (!selected) setError("This investment plan could not be found.");
        } catch (err) {
            console.error("Error fetching fund detail:", err);
            setError("This investment plan could not be loaded right now.");
        } finally {
            setLoading(false);
        }
    }, [id, slug]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void fetchPlan(); }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchPlan]);

    const derived = useMemo(() => {
        if (!plan) return null;
        const risk = RISK_CONFIG[plan.riskLevel] ?? RISK_CONFIG.medium;
        const category = CATEGORY_CONFIG[plan.category] ?? CATEGORY_CONFIG.lumpsum;
        const steps = (HOW_IT_WORKS[plan.category] ?? HOW_IT_WORKS.lumpsum)(plan);
        const charges = (CHARGES[plan.category] ?? CHARGES.lumpsum)(plan);
        return { risk, category, CategoryIcon: category.Icon, steps, charges };
    }, [plan]);

    if (loading) return <DetailSkeleton />;

    if (!plan || !derived) {
        return (
            <main className="min-h-screen bg-[#F8FAFC] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                    <Shield className="mx-auto h-10 w-10 text-[#0B2E84]" />
                    <h1 className="mt-5 text-2xl font-bold text-[#0F172A]">Fund not found</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{error ?? "Please return to the funds page and choose another plan."}</p>
                    <Link href="/funds" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B2E84] px-5 py-3 text-sm font-bold text-white">
                        Back to Funds
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </main>
        );
    }

    const { risk, category, CategoryIcon, steps, charges } = derived;
    const isMonthly = plan.category === "monthly";

    // Amount step + presets differ slightly for SIP (smaller, recurring) vs one-time plans
    const presets = isMonthly
        ? [toFiniteNumber(plan.minAmount, 500), 1000, 2500, 5000].filter((v, i, a) => a.indexOf(v) === i)
        : [toFiniteNumber(plan.minAmount, 10000), 25000, 50000, 100000].filter((v, i, a) => a.indexOf(v) === i);

    const chargedNowPercent = charges.filter(c => c.appliesNow).reduce((sum, c) => sum + c.percent, 0);
    const chargedNowAmount = (investAmount * chargedNowPercent) / 100;

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">

            {/* ══════════════════ SIMPLE HERO ══════════════════ */}
            <section className="bg-white px-4 pb-10 pt-28 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <Link href="/" className="hover:text-[#0B2E84]">Home</Link>
                        <span>›</span>
                        <Link href="/funds" className="hover:text-[#0B2E84]">Funds</Link>
                        <span>›</span>
                        <span className="font-semibold text-[#0F172A]">{plan.name}</span>
                    </div>

                    <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-lg bg-[#0B2E84]/8 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[#0B2E84]">
                                <CategoryIcon className="h-3.5 w-3.5" />
                                {category.eyebrow}
                            </div>
                            <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-[#0F172A] sm:text-4xl">
                                {plan.name}
                            </h1>
                        </div>

                        {plan.photourl && (
                            <div className="relative hidden h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-[#F1F5F9] sm:block">
                                <Image src={plan.photourl} alt={plan.name} fill className="object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Simple stat chips */}
                    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatChip label="Target Return" value={`${fmtROI(plan)} p.a.`} />
                        <StatChip label="Minimum" value={fmt(plan.minAmount)} />
                        <StatChip label="Risk Level" value={risk.label} badgeClassName={risk.className} />
                        <StatChip label={plan.category === "lumpsum" ? "Lock-in" : "Duration"} value={plan.category === "lumpsum" ? `${plan.lockInMonths ?? 12} Months` : fmtDuration(plan.durationMinMonths, plan.durationMaxMonths)} />
                    </div>
                </div>
            </section>

            {/* ══════════════════ MAIN CONTENT ══════════════════ */}
            <section className="px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.5fr_1fr]">

                    {/* ── Left: content ── */}
                    <div className="space-y-6">

                        {/* About */}
                        <Card title="About This Fund">
                            {plan.description ? (
                                <div
                                    className="rich-text-preview text-sm leading-7 text-slate-700"
                                    dangerouslySetInnerHTML={{ __html: plan.description }}
                                />
                            ) : plan.shortDescription ? (
                                <div
                                    className="rich-text-preview text-sm leading-7 text-slate-700"
                                    dangerouslySetInnerHTML={{ __html: plan.shortDescription }}
                                />
                            ) : (
                                <p className="text-sm italic text-slate-400">Description coming soon.</p>
                            )}
                        </Card>

                        {/* How it works */}
                        <Card title="How It Works" subtitle="A simple, 3-step process — no complicated paperwork.">
                            <div className="grid gap-4 sm:grid-cols-3">
                                {steps.map((step, i) => (
                                    <div key={step.title} className="relative rounded-xl bg-[#F8FAFC] p-5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B2E84] text-xs font-bold text-white">
                                            {i + 1}
                                        </div>
                                        <step.icon className="mt-4 h-5 w-5 text-[#0B2E84]" />
                                        <h3 className="mt-3 text-sm font-bold text-[#0F172A]">{step.title}</h3>
                                        <p className="mt-1.5 text-xs leading-5 text-slate-600">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Key facts */}
                        <Card title="Fund Details">
                            <div className="divide-y divide-[#E2E8F0]">
                                <InfoRow icon={<CategoryIcon className="h-4 w-4" />} label="Fund Type" value={category.label} />
                                <InfoRow icon={<CalendarDays className="h-4 w-4" />} label={isMonthly ? "SIP Period" : "Investment Horizon"} value={fmtDuration(plan.durationMinMonths, plan.durationMaxMonths)} />
                                <InfoRow icon={<Wallet className="h-4 w-4" />} label="Base Currency" value={plan.currency ?? "USD"} />
                                <InfoRow icon={<Clock className="h-4 w-4" />} label="Payout" value={PAYOUT_LABEL[plan.payoutType] ?? "By Terms"} />
                                <InfoRow icon={<LockKeyhole className="h-4 w-4" />} label="Lock-in Period" value={plan.lockInMonths ? `${plan.lockInMonths} Months` : "Flexible"} />
                                <InfoRow icon={<Landmark className="h-4 w-4" />} label="Fund Manager" value="Merlion Asset Management" />
                            </div>
                        </Card>

                        {/* Terms & Conditions — collapsible since legal text runs long */}
                        <Card title="Terms & Conditions">
                            {plan.termsAndConditions ? (
                                <div>
                                    <div
                                        className={`rich-text-preview text-sm leading-7 text-slate-700 ${termsOpen ? "" : "max-h-32 overflow-hidden"}`}
                                        style={!termsOpen ? { maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" } : undefined}
                                        dangerouslySetInnerHTML={{ __html: plan.termsAndConditions }}
                                    />
                                    <button
                                        onClick={() => setTermsOpen(o => !o)}
                                        className="mt-3 flex items-center gap-1.5 text-sm font-bold text-[#0B2E84] hover:underline"
                                    >
                                        {termsOpen ? "Show less" : "Read full terms"}
                                        <ChevronDown className={`h-4 w-4 transition-transform ${termsOpen ? "rotate-180" : ""}`} />
                                    </button>
                                </div>
                            ) : (
                                <p className="flex items-center gap-2 text-sm text-slate-500">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    Terms will be shared during your investor review call.
                                </p>
                            )}
                        </Card>
                    </div>

                    {/* ── Right: invest panel ── */}
                    <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
                            <h2 className="text-xl font-bold text-[#0B2E84]">Invest in This Fund</h2>

                            <label className="mt-5 block">
                                <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                                    {isMonthly ? "Monthly Contribution (USD)" : "Investment Amount (USD)"}
                                </span>
                                <div className="mt-2 flex h-12 items-center rounded-lg border border-[#CBD5E1] bg-white px-4">
                                    <span className="mr-2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        value={investAmount}
                                        onChange={e => setInvestAmount(Number(e.target.value))}
                                        className="w-full bg-transparent text-sm font-bold text-[#0F172A] outline-none"
                                    />
                                </div>
                            </label>

                            <div className="mt-3 grid grid-cols-2 gap-2.5">
                                {presets.map(value => (
                                    <button
                                        key={value}
                                        onClick={() => setInvestAmount(value)}
                                        className={[
                                            "h-10 rounded-lg border px-3 text-xs font-bold transition",
                                            investAmount === value
                                                ? "border-[#0B2E84] bg-[#0B2E84] text-white"
                                                : "border-[#CBD5E1] text-[#0F172A] hover:border-[#0B2E84]",
                                        ].join(" ")}
                                    >
                                        {fmt(value)}
                                    </button>
                                ))}
                            </div>


                            <Link href="/investments" className="mt-6 flex h-12 items-center justify-center rounded-lg bg-[#0B2E84] text-sm font-bold text-white transition hover:bg-[#082461]">
                                Invest Now
                            </Link>
                            <Link href="/contact" className="mt-3 flex h-12 items-center justify-center rounded-lg border border-[#0B2E84] text-sm font-bold text-[#0B2E84] transition hover:bg-[#F8FAFC]">
                                Schedule a Call
                            </Link>

                            <div className="mt-7 flex gap-3 border-t border-[#E2E8F0] pt-6">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0B2E84]" />
                                <p className="text-xs leading-5 text-slate-600">
                                    <span className="block font-bold text-[#0F172A]">Secure & Encrypted</span>
                                    Your capital is protected with industry-standard security and advisor review.
                                </p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                            <h2 className="text-base font-bold text-[#0B2E84]">Before You Invest</h2>
                            <div className="mt-4 space-y-3">
                                {[
                                    "Review how this plan works.",
                                    "Read the terms & conditions in full.",
                                    "Schedule a call if you have any questions.",
                                ].map(item => (
                                    <div key={item} className="flex gap-2.5">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                                        <p className="text-sm leading-6 text-slate-600">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </section>

            {/* Standalone, full-width client trust reporting */}
            <section className="border-t border-[#E2E8F0] bg-[#F4F7FB] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <FundTrustReports fundId={plan._id} fundSlug={plan.slug} />
            </section>

            {/* ══════════════════ RISK DISCLOSURE ══════════════════ */}
            <div className="bg-[#0B2E84] px-4 py-4 text-white sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 text-center text-xs">
                    <Shield className="h-4 w-4 shrink-0" />
                    <p>Investments involve risk, including the potential loss of principal. Past performance does not guarantee future results.</p>
                </div>
            </div>
        </main>
    );
}

/* ─────────────────── SMALL COMPONENTS ─────────────────── */

const Card = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-7">
        <h2 className="text-xl font-bold text-[#0B2E84]">{title}</h2>
        {subtitle && <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>}
        <div className="mt-5">{children}</div>
    </section>
);

const StatChip = ({ label, value, badgeClassName }: { label: string; value: string; badgeClassName?: string }) => (
    <div className={`rounded-xl p-4 ${badgeClassName ? badgeClassName : "bg-[#F1F5F9]"}`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-current opacity-70">{label}</p>
        <p className="mt-1.5 text-base font-bold text-current">{value}</p>
    </div>
);

const InfoRow = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
    <div className="grid grid-cols-[24px_1fr_1fr] items-center gap-3 py-3 text-sm">
        <span className="text-[#0B2E84]">{icon}</span>
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-[#0F172A]">{value}</span>
    </div>
);
