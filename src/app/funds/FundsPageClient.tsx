"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, BarChart3, Banknote, Bitcoin, CalendarDays,
    ChevronLeft, ChevronRight, FileCheck2, Globe2, Landmark,
    Percent, PieChart, RefreshCw, Search, Shield,
    SlidersHorizontal, TrendingUp, UserRoundCheck, Wallet,
} from "lucide-react";
import appClient from "@/lib/appClient";
import { InvestmentPlanInterface } from "@/interface/investmentPlan";

const RISK_CONFIG = {
    low: { label: "Low Risk", badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    medium: { label: "Moderate Risk", badge: "bg-blue-50 text-[#0B3D91]", dot: "bg-blue-500" },
    high: { label: "High Risk", badge: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
    very_high: { label: "High Risk", badge: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
};

const CATEGORY_CONFIG = {
    monthly: { label: "Monthly SIP", Icon: BarChart3 },
    lumpsum: { label: "Lump Sum", Icon: Banknote },
    crypto: { label: "Digital Assets", Icon: Bitcoin },
};

const toFiniteNumber = (value: unknown, fallback: number) =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback;

const fmt = (value: unknown) => {
    const n = toFiniteNumber(value, NaN);
    if (!Number.isFinite(n)) return "N/A";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n);
};

const fmtPlain = (value: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

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

const stripHtml = (html?: string) =>
    (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

const safeMaxAmount = (plan: InvestmentPlanInterface) =>
    Math.max(toFiniteNumber(plan.maxAmount, toFiniteNumber(plan.minAmount, 1000)), toFiniteNumber(plan.minAmount, 1000));

const buildFundHref = (plan: InvestmentPlanInterface) => {
    const slug = plan.slug || plan._id || encodeURIComponent(plan.name.toLowerCase().replace(/\s+/g, "-"));
    const id = plan._id ? `?id=${encodeURIComponent(plan._id)}` : "";
    return `/funds/${slug}${id}`;
};

const SkeletonCard = () => (
    <div className="h-[390px] animate-pulse rounded-2xl border border-[#d7e0f1] bg-white p-6 shadow-[0_18px_45px_rgba(11,35,74,0.06)]">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
        <div className="mt-7 h-5 w-3/4 rounded bg-slate-200" />
        <div className="mt-4 h-3 w-full rounded bg-slate-100" />
        <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
        <div className="mt-10 space-y-4">
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
        </div>
        <div className="mt-8 h-11 rounded-lg bg-slate-100" />
    </div>
);

const EmptyState = ({ onClear }: { onClear: () => void }) => (
    <div className="col-span-full rounded-2xl border border-dashed border-[#cbd7ec] bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eff4ff] text-[#0B3D91]">
            <TrendingUp className="h-6 w-6" />
        </div>
        <p className="mt-5 text-lg font-bold text-[#071F55]">No matching funds found</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
            Try a different risk profile, fund type, or search term to view more Merlion investment plans.
        </p>
        <button
            onClick={onClear}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#0B3D91] px-5 py-3 text-sm font-bold text-[#071F55] transition hover:bg-[#071F55] hover:text-white"
        >
            <RefreshCw className="h-4 w-4" />
            Show All Funds
        </button>
    </div>
);

const TrustStripItem = ({ icon, title, body, isLast }: {
    icon: ReactNode;
    title: string;
    body: string;
    isLast?: boolean;
}) => (
    <div className={`flex items-center gap-5 px-5 py-6 ${isLast ? "" : "lg:border-r lg:border-[#dbe4f2]"}`}>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#f1f5fc] text-[#0B3D91]">
            {icon}
        </div>
        <div>
            <p className="text-base font-bold leading-snug text-[#071F55]">{title}</p>
            <p className="mt-2 text-xs leading-5 text-[#071F55]/75">{body}</p>
        </div>
    </div>
);

const FilterPill = ({ active, label, onClick }: {
    active: boolean;
    label: string;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={[
            "h-11 shrink-0 rounded-2xl border px-7 text-sm font-bold transition",
            active
                ? "border-[#083B93] bg-[#083B93] text-white shadow-[0_10px_20px_rgba(8,59,147,0.16)]"
                : "border-[#cad6ec] bg-white text-[#071F55] hover:border-[#083B93] hover:bg-[#f7faff]",
        ].join(" ")}
    >
        {label}
    </button>
);

const PlanCard = ({ plan, index, onView }: {
    plan: InvestmentPlanInterface;
    index: number;
    onView: (p: InvestmentPlanInterface) => void;
}) => {
    const risk = RISK_CONFIG[plan.riskLevel] ?? RISK_CONFIG.medium;
    const category = CATEGORY_CONFIG[plan.category] ?? CATEGORY_CONFIG.lumpsum;
    const { Icon } = category;
    const description = stripHtml(plan.shortDescription) || "Professionally managed fund strategy focused on disciplined allocation and transparent reporting.";

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, delay: index * 0.035 }}
            className="group flex min-h-[390px] flex-col rounded-2xl border border-[#d7e0f1] bg-white p-6 shadow-[0_18px_45px_rgba(11,35,74,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(11,35,74,0.12)]"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#073889] text-white shadow-[0_10px_22px_rgba(7,56,137,0.18)]">
                    <Icon className="h-6 w-6" />
                </div>
                <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold ${risk.badge}`}>
                    {risk.label}
                </span>
            </div>

            <h3 className="mt-7 text-xl font-bold leading-tight text-[#071F55]">{plan.name}</h3>
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#071F55]/78">{description}</p>

            <div className="mt-8 space-y-3 text-sm">
                <MetricRow label="Min. Investment" value={fmt(plan.minAmount)} />
                <MetricRow label="Expected Annual Return" value={fmtROI(plan)} />
                <MetricRow label="Investment Horizon" value={fmtDuration(plan.durationMinMonths, plan.durationMaxMonths)} />
            </div>

            <button
                onClick={() => onView(plan)}
                className="mt-auto flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#0B3D91] text-sm font-bold text-[#071F55] transition hover:bg-[#071F55] hover:text-white"
            >
                View Details
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
        </motion.article>
    );
};

const MetricRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-4">
        <span className="text-[#071F55]/70">{label}</span>
        <span className="text-right font-bold text-[#071F55]">{value}</span>
    </div>
);

const WhyInvestFeature = ({ icon, title, body }: { icon: ReactNode; title: string; body: string }) => (
    <div className="flex gap-4 border-[#dbe4f2] py-5 sm:border-l sm:pl-7">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eaf1ff] text-[#0B3D91]">
            {icon}
        </div>
        <div>
            <h3 className="text-base font-bold text-[#071F55]">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#071F55]/72">{body}</p>
        </div>
    </div>
);

type CompoundFrequency = "monthly" | "quarterly" | "annually";
type DigitalAssetScenario = "conservative" | "balanced" | "aggressive";

export function InvestmentReturnCalculator({ plan }: { plan?: InvestmentPlanInterface }) {
    const category = plan?.category ?? "lumpsum";
    const defaultAmount = plan ? toFiniteNumber(plan.minAmount, 10000) : 10000;
    const defaultMax = plan ? safeMaxAmount(plan) : 250000;
    const [amount, setAmount] = useState(defaultAmount);
    const [monthlyTopUp, setMonthlyTopUp] = useState(category === "monthly" ? Math.max(100, Math.round(defaultAmount * 0.08)) : 0);
    const [months, setMonths] = useState(plan ? toFiniteNumber(plan.durationMinMonths, 12) : 12);
    const [annualReturn, setAnnualReturn] = useState(plan ? toFiniteNumber(plan.roiMin, 12) : 12);
    const [frequency, setFrequency] = useState<CompoundFrequency>("monthly");
    const [reinvest, setReinvest] = useState(true);
    const [scenario, setScenario] = useState<DigitalAssetScenario>("balanced");

    const result = useMemo(() => {
        const compoundingMap: Record<CompoundFrequency, number> = { monthly: 12, quarterly: 4, annually: 1 };
        const periodsPerYear = compoundingMap[frequency];
        const totalMonths = Math.max(1, months);
        const monthlyRate = annualReturn / 100 / 12;

        if (category === "monthly") {
            let balance = amount;
            for (let month = 1; month <= totalMonths; month += 1) {
                balance = balance * (1 + monthlyRate) + monthlyTopUp;
            }
            const totalContributions = amount + monthlyTopUp * totalMonths;
            return {
                maturity: balance,
                profit: balance - totalContributions,
                totalContributions,
                monthlyIncome: plan?.payoutType === "monthly" ? (balance - totalContributions) / totalMonths : 0,
                label: "Projected SIP Value",
                note: "SIP projection compounds each month after recurring contributions.",
            };
        }

        if (category === "crypto") {
            const scenarioMultiplier: Record<DigitalAssetScenario, number> = {
                conservative: 0.7,
                balanced: 1,
                aggressive: 1.3,
            };
            const adjustedReturn = annualReturn * scenarioMultiplier[scenario];
            const adjustedMonthlyRate = adjustedReturn / 100 / 12;
            let balance = amount;
            for (let month = 1; month <= totalMonths; month += 1) {
                balance = balance * (1 + adjustedMonthlyRate) + monthlyTopUp;
            }
            const totalContributions = amount + monthlyTopUp * totalMonths;
            return {
                maturity: balance,
                profit: balance - totalContributions,
                totalContributions,
                monthlyIncome: 0,
                label: `${scenario[0].toUpperCase()}${scenario.slice(1)} Scenario`,
                note: "Digital asset projection adjusts the expected return by selected market scenario.",
                adjustedReturn,
            };
        }

        const periodicRate = annualReturn / 100 / periodsPerYear;
        const totalPeriods = Math.round((totalMonths / 12) * periodsPerYear);
        let balance = amount;
        for (let i = 0; i < totalPeriods; i += 1) {
            balance *= 1 + periodicRate;
        }

        const simpleProfit = (amount * annualReturn * totalMonths) / 1200;
        if (!reinvest) balance = amount + simpleProfit;

        return {
            maturity: balance,
            profit: balance - amount,
            totalContributions: amount,
            monthlyIncome: plan?.payoutType === "monthly" ? (balance - amount) / totalMonths : 0,
            label: "Projected Maturity Value",
            note: "Lump sum projection compounds only the initial principal over the selected period.",
        };
    }, [amount, annualReturn, category, frequency, monthlyTopUp, months, plan?.payoutType, reinvest, scenario]);

    const maxAmount = plan ? defaultMax : 500000;
    const maxMonths = plan ? Math.max(toFiniteNumber(plan.durationMaxMonths, 60), toFiniteNumber(plan.durationMinMonths, 1)) : 60;
    const minMonths = plan ? toFiniteNumber(plan.durationMinMonths, 1) : 1;
    const maxReturn = Math.max(35, plan ? toFiniteNumber(plan.roiMax, toFiniteNumber(plan.roiMin, 18)) : 18);
    const categoryLabel = CATEGORY_CONFIG[category]?.label ?? "Lump Sum";
    const adjustedReturn = "adjustedReturn" in result && typeof result.adjustedReturn === "number" ? result.adjustedReturn : null;

    return (
        <section className="rounded-2xl border border-[#d7e0f1] bg-white p-6 shadow-[0_18px_55px_rgba(11,35,74,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#0B3D91]">
                        <SlidersHorizontal className="h-4 w-4" />
                        {categoryLabel} Calculator
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#071F55]">Investment Calculator</h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                        {category === "monthly" && "Estimate recurring SIP growth using monthly contributions and monthly compounding."}
                        {category === "lumpsum" && "Estimate one-time investment growth using compounding or payout assumptions."}
                        {category === "crypto" && "Estimate digital asset outcomes with flexible contributions and market scenarios."}
                    </p>
                </div>
                <div className="rounded-xl bg-[#071F55] px-4 py-3 text-right text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">{result.label}</p>
                    <p className="mt-1 text-2xl font-bold">{fmt(result.maturity)}</p>
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="space-y-5">
                    <CalculatorSlider label={category === "monthly" ? "Initial deposit" : "Investment amount"} value={amount} min={plan ? toFiniteNumber(plan.minAmount, 1000) : 1000} max={maxAmount} step={100} prefix="$" onChange={setAmount} />
                    {(category === "monthly" || category === "crypto") && (
                        <CalculatorSlider label={category === "monthly" ? "Monthly SIP contribution" : "Optional monthly accumulation"} value={monthlyTopUp} min={0} max={Math.max(25000, Math.round(maxAmount / 10))} step={100} prefix="$" onChange={setMonthlyTopUp} />
                    )}
                    <CalculatorSlider label="Investment period" value={months} min={minMonths} max={maxMonths} step={1} suffix=" months" onChange={setMonths} />
                    <CalculatorSlider label={category === "crypto" ? "Base expected return" : "Expected annual return"} value={annualReturn} min={1} max={maxReturn} step={0.25} suffix="%" onChange={setAnnualReturn} />

                    <div className="grid gap-3 sm:grid-cols-2">
                        {category === "lumpsum" && (
                            <>
                                <CalculatorSelect
                                    label="Compounding"
                                    value={frequency}
                                    onChange={v => setFrequency(v as CompoundFrequency)}
                                    options={[
                                        { value: "monthly", label: "Monthly" },
                                        { value: "quarterly", label: "Quarterly" },
                                        { value: "annually", label: "Annually" },
                                    ]}
                                />
                                <label className="flex items-center justify-between gap-4 rounded-xl border border-[#d7e0f1] bg-[#f8fbff] px-4 py-3">
                                    <span>
                                        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Return mode</span>
                                        <span className="mt-1 block text-sm font-bold text-[#071F55]">{reinvest ? "Reinvest returns" : "Take payouts"}</span>
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={reinvest}
                                        onChange={e => setReinvest(e.target.checked)}
                                        className="h-5 w-5 accent-[#0B3D91]"
                                    />
                                </label>
                            </>
                        )}
                        {category === "crypto" && (
                            <CalculatorSelect
                                label="Market scenario"
                                value={scenario}
                                onChange={v => setScenario(v as DigitalAssetScenario)}
                                options={[
                                    { value: "conservative", label: "Conservative" },
                                    { value: "balanced", label: "Balanced" },
                                    { value: "aggressive", label: "Aggressive" },
                                ]}
                            />
                        )}
                    </div>
                </div>

                <div className="rounded-2xl bg-[#071F55] p-5 text-white">
                    <div className="grid grid-cols-2 gap-3">
                        <CalculatorResult icon={<Wallet className="h-4 w-4" />} label="Total invested" value={fmt(result.totalContributions)} />
                        <CalculatorResult icon={<TrendingUp className="h-4 w-4" />} label={category === "crypto" ? "Scenario return" : "Estimated profit"} value={category === "crypto" && adjustedReturn !== null ? `${adjustedReturn.toFixed(2)}% p.a.` : fmt(result.profit)} />
                        <CalculatorResult icon={<Percent className="h-4 w-4" />} label="Base return" value={`${annualReturn}% p.a.`} />
                        <CalculatorResult icon={<CalendarDays className="h-4 w-4" />} label="Time horizon" value={`${months} months`} />
                    </div>
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/8 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-bold text-white/55">Growth multiple</span>
                            <span className="text-lg font-extrabold">{(result.maturity / Math.max(result.totalContributions, 1)).toFixed(2)}x</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#60A5FA] to-[#34d399]" style={{ width: `${clamp((result.profit / Math.max(result.maturity, 1)) * 100, 4, 100)}%` }} />
                        </div>
                        {result.monthlyIncome > 0 && (
                            <p className="mt-4 text-sm font-bold text-white/75">Estimated monthly payout: {fmt(result.monthlyIncome)}</p>
                        )}
                        <p className="mt-4 text-[11px] leading-relaxed text-white/45">
                            {result.note} Projection only. Actual performance can vary with market conditions, fees, payout rules, entry timing, and product terms.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

const CalculatorSlider = ({ label, value, min, max, step, prefix = "", suffix = "", onChange }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    prefix?: string;
    suffix?: string;
    onChange: (value: number) => void;
}) => (
    <label className="block">
        <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}</span>
            <span className="rounded-lg bg-[#eef5ff] px-2.5 py-1 text-xs font-extrabold text-[#081B3A]">
                {prefix}{fmtPlain(value)}{suffix}
            </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full accent-[#2563eb]"
        />
    </label>
);

const CalculatorSelect = ({ label, value, options, onChange }: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}) => (
    <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-[#d7e0f1] bg-[#f8fbff] px-4 text-sm font-bold text-[#071F55] outline-none focus:border-[#0B3D91]"
        >
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
    </label>
);

const CalculatorResult = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
        <div className="mb-3 text-[#60A5FA]">{icon}</div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/45">{label}</p>
        <p className="mt-1 text-base font-extrabold text-white">{value}</p>
    </div>
);

const Pagination = ({ page, totalPages, totalDocs, limit, onPageChange, onLimitChange }: {
    page: number; totalPages: number; totalDocs: number; limit: number;
    onPageChange: (p: number) => void; onLimitChange: (l: number) => void;
}) => {
    const from = Math.min((page - 1) * limit + 1, totalDocs);
    const to = Math.min(page * limit, totalDocs);

    return (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d7e0f1] bg-white px-4 py-3.5 shadow-sm">
            <p className="text-xs font-semibold tabular-nums text-[#071F55]/60">
                {totalDocs === 0 ? "No results" : `${from} - ${to} of ${totalDocs} funds`}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d7e0f1] text-[#071F55]/65 transition hover:bg-[#f7faff] disabled:opacity-30"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="rounded-lg bg-[#083B93] px-4 py-2 text-xs font-bold text-white">{page} / {totalPages}</span>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d7e0f1] text-[#071F55]/65 transition hover:bg-[#f7faff] disabled:opacity-30"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <select
                value={limit}
                onChange={e => onLimitChange(Number(e.target.value))}
                className="h-9 rounded-lg border border-[#d7e0f1] bg-white px-3 text-xs font-bold text-[#071F55]/70 outline-none"
            >
                {[4, 8, 12, 24].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
        </div>
    );
};

export default function FundsPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [plans, setPlans] = useState<InvestmentPlanInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"));
    const [limit, setLimit] = useState(8);
    const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
    const [search, setSearch] = useState(searchParams.get("search") ?? "");
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") ?? "all");
    const [riskFilter, setRiskFilter] = useState(searchParams.get("riskLevel") ?? "all");

    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        if (riskFilter !== "all") params.set("riskLevel", riskFilter);
        if (page > 1) params.set("page", String(page));
        const qs = params.toString();
        router.replace(`/funds${qs ? `?${qs}` : ""}`, { scroll: false } as Parameters<typeof router.replace>[1]);
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
                    category: categoryFilter !== "all" ? categoryFilter : undefined,
                    riskLevel: riskFilter !== "all" ? riskFilter : undefined,
                },
            });
            if (res.data?.status) {
                const d = res.data?.data ?? res.data?.plans ?? res.data?.investmentPlans;
                setPlans(d?.docs ?? d ?? []);
                setTotalDocs(d?.totalDocs ?? 0);
                setTotalPages(d?.totalPages ?? 0);
            }
        } catch (err) {
            console.error("Error fetching plans:", err);
            setPlans([]);
            setTotalDocs(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, categoryFilter, riskFilter]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void fetchPlans(); }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchPlans]);

    const setAllFunds = () => {
        setCategoryFilter("all");
        setRiskFilter("all");
        setSearchInput("");
        setPage(1);
    };

    const setRisk = (risk: string) => {
        setRiskFilter(risk);
        setCategoryFilter("all");
        setPage(1);
    };

    const setCategory = (category: string) => {
        setCategoryFilter(category);
        setRiskFilter("all");
        setPage(1);
    };

    const isAll = categoryFilter === "all" && riskFilter === "all" && !searchInput;

    return (
        <main className="min-h-screen bg-white text-[#071F55] antialiased">
            <section
                className="relative min-h-[620px] overflow-hidden bg-[#dcecff] px-4 pt-28 sm:px-6 lg:px-8"
                style={{
                    backgroundImage:
                        "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.78) 35%, rgba(255,255,255,0.16) 70%), linear-gradient(180deg, rgba(7,31,85,0.64) 0%, rgba(7,31,85,0.10) 42%, rgba(255,255,255,0.18) 100%), url('/merlion.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center right",
                }}
            >
                <div className="mx-auto max-w-7xl pb-28 pt-16 lg:pb-36 lg:pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                        className="max-w-xl"
                    >
                        <p className="mb-7 flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.22em] text-[#0B3D91]">
                            <span className="h-px w-8 bg-[#0B3D91]" />
                            Our Funds
                        </p>
                        <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-[#071F55] sm:text-6xl">
                            Diversified Funds.<br />
                            Built for Growth.
                        </h1>
                        <p className="mt-7 max-w-lg text-base leading-8 text-[#071F55]">
                            Explore our professionally managed investment funds designed to deliver long-term value through disciplined strategies and diversified exposure across global markets.
                        </p>
                        <Link
                            href="#investment-funds"
                            className="mt-8 inline-flex items-center gap-3 rounded-lg bg-[#083B93] px-7 py-4 text-sm font-bold text-white shadow-[0_14px_26px_rgba(8,59,147,0.22)] transition hover:bg-[#071F55]"
                        >
                            Explore Investment Plans
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            <section className="relative z-10 -mt-14 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-[#d7e0f1] bg-white/95 shadow-[0_22px_60px_rgba(11,35,74,0.12)] backdrop-blur md:grid-cols-2 lg:grid-cols-4">
                    <TrustStripItem icon={<PieChart className="h-8 w-8" />} title="Diversified Markets" body="Exposure across multiple asset classes and regions." />
                    <TrustStripItem icon={<Shield className="h-8 w-8" />} title="Managed by Experts" body="Professional team with proven investment process." />
                    <TrustStripItem icon={<BarChart3 className="h-8 w-8" />} title="Risk-Adjusted Returns" body="Balanced strategies aimed at long-term growth." />
                    <TrustStripItem icon={<FileCheck2 className="h-8 w-8" />} title="Transparent Reporting" body="Clear, regular updates and performance reports." isLast />
                </div>
            </section>

            <section id="investment-funds" className="px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-16">
                <div className="mx-auto max-w-7xl text-center">
                    <h2 className="text-4xl font-bold leading-tight text-[#071F55]">Our Investment Funds</h2>
                    <div className="mx-auto mt-3 h-0.5 w-16 rounded-full bg-[#0B3D91]" />
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#071F55]/78">
                        Choose a fund that aligns with your financial goals and risk appetite. All funds are managed with a disciplined approach and strong risk management.
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-3 overflow-x-auto pb-2">
                        <FilterPill active={isAll} label="All Funds" onClick={setAllFunds} />
                        <FilterPill active={riskFilter === "low"} label="Low Risk" onClick={() => setRisk("low")} />
                        <FilterPill active={riskFilter === "medium"} label="Moderate Risk" onClick={() => setRisk("medium")} />
                        <FilterPill active={riskFilter === "high" || riskFilter === "very_high"} label="High Risk" onClick={() => setRisk("high")} />
                        <FilterPill active={categoryFilter === "monthly"} label="Monthly SIP" onClick={() => setCategory("monthly")} />
                        <FilterPill active={categoryFilter === "lumpsum"} label="Lump Sum" onClick={() => setCategory("lumpsum")} />
                        <FilterPill active={categoryFilter === "crypto"} label="Digital Assets" onClick={() => setCategory("crypto")} />
                    </div>

                    <div className="mx-auto mt-5 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#071F55]/35" />
                            <input
                                type="text"
                                placeholder="Search funds..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className="h-12 w-full rounded-full border border-[#d7e0f1] bg-white pl-11 pr-4 text-sm font-semibold text-[#071F55] outline-none transition placeholder:text-[#071F55]/35 focus:border-[#0B3D91] focus:ring-4 focus:ring-[#0B3D91]/10"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <AnimatePresence mode="popLayout">
                                {plans.length === 0
                                    ? <EmptyState onClear={setAllFunds} />
                                    : plans.map((plan, i) => (
                                        <PlanCard
                                            key={plan._id ?? plan.slug ?? plan.name}
                                            plan={plan}
                                            index={i}
                                            onView={(selected) => router.push(buildFundHref(selected))}
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
            </section>

            <section className="px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl bg-[#f5f8fd] shadow-[0_18px_55px_rgba(11,35,74,0.06)] lg:grid-cols-[0.85fr_1.65fr]">
                    <div className="border-[#dbe4f2] p-8 lg:border-r lg:p-10">
                        <h2 className="text-3xl font-bold leading-tight text-[#071F55]">Why Invest With Merlion Asset Holdings?</h2>
                        <p className="mt-5 text-base leading-8 text-[#071F55]/75">
                            We combine deep market insights, robust risk management, and advanced technology to deliver consistent and sustainable results.
                        </p>
                        <Link
                            href="/about"
                            className="mt-8 inline-flex items-center gap-3 rounded-lg bg-[#083B93] px-7 py-4 text-sm font-bold text-white shadow-[0_14px_26px_rgba(8,59,147,0.18)] transition hover:bg-[#071F55]"
                        >
                            About Our Approach
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid p-6 sm:grid-cols-2 lg:grid-cols-3 lg:p-8">
                        <WhyInvestFeature icon={<Globe2 className="h-5 w-5" />} title="Diversification" body="Funds are diversified across asset classes to reduce risk and improve outcomes." />
                        <WhyInvestFeature icon={<UserRoundCheck className="h-5 w-5" />} title="Professional Management" body="Experienced managers use data-driven strategies and investment frameworks." />
                        <WhyInvestFeature icon={<Shield className="h-5 w-5" />} title="Risk Management" body="Strict controls and monitoring protect capital and improve risk-adjusted returns." />
                        <WhyInvestFeature icon={<Wallet className="h-5 w-5" />} title="Liquidity & Access" body="Flexible options with simple access to fund information when you need it." />
                        <WhyInvestFeature icon={<Landmark className="h-5 w-5" />} title="Secure & Regulated" body="Institutional-grade security practices and compliance-minded processes." />
                        <WhyInvestFeature icon={<FileCheck2 className="h-5 w-5" />} title="Transparent Performance" body="Regular reporting and clear communication on fund performance updates." />
                    </div>
                </div>
            </section>

            <section className="px-4 py-6 sm:px-6 lg:px-8">
                <div
                    className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 overflow-hidden rounded-xl bg-[#083B93] px-8 py-8 text-white shadow-[0_24px_70px_rgba(8,59,147,0.18)] lg:flex-row lg:items-center"
                    style={{
                        backgroundImage: "linear-gradient(90deg, rgba(8,59,147,0.98), rgba(8,59,147,0.84)), url('/merlion.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="flex items-center gap-6">
                        <div className="hidden h-20 w-20 items-center justify-center rounded-xl bg-white/12 sm:flex">
                            <CalendarDays className="h-10 w-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold leading-tight text-white">Ready to Start Investing?</h2>
                            <p className="mt-3 max-w-xl text-sm leading-7 text-white/85">
                                Choose the right fund for your goals and start your investment journey with confidence.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="#investment-funds"
                        className="inline-flex min-w-[280px] items-center justify-center gap-3 rounded-lg bg-white px-7 py-4 text-sm font-bold text-[#071F55] transition hover:bg-[#f2f6ff]"
                    >
                        Explore Investment Plans
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-start gap-5 rounded-xl bg-[#f5f8fd] px-8 py-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eaf1ff] text-[#0B3D91]">
                        <Shield className="h-7 w-7" />
                    </div>
                    <p className="text-sm leading-7 text-[#071F55]/78">
                        <span className="font-bold text-[#071F55]">Risk Disclaimer:</span> Investments involve risk, including the potential loss of principal. Past performance does not guarantee future results.
                    </p>
                </div>
            </div>
        </main>
    );
}
