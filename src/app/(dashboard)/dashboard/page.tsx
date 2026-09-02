"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Activity,
    ArrowDownLeft,
    ArrowRight,
    ArrowUpRight,
    Banknote,
    BarChart3,
    Bitcoin,
    BriefcaseBusiness,
    CalendarDays,
    ChevronRight,
    Clock3,
    Eye,
    EyeOff,
    Loader2,
    Plus,
    RefreshCw,
    ShieldCheck,
    TrendingUp,
    Wallet,
} from "lucide-react";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";
import type {
    ClientPortfolioInterface,
    PortfolioListResponse,
    PortfolioListSummary,
} from "@/interface/portfolio";
import type { TransactionInterface, TransactionType } from "@/interface/transaction";

type FundWallet = {
    _id?: string;
    currency: string;
    balance: number;
    totalDeposited?: number;
    totalWithdrawn?: number;
};

type DashboardState = {
    portfolios: ClientPortfolioInterface[];
    portfolioSummary: PortfolioListSummary;
    wallets: FundWallet[];
    transactions: TransactionInterface[];
    pendingDeposits: number;
    pendingWithdrawals: number;
};

type TrendPoint = { label: string; value: number };

const EMPTY_SUMMARY: PortfolioListSummary = {
    totalInvestedUsd: 0,
    totalExpectedProfitUsd: 0,
    totalCurrentValueUsd: 0,
    activePortfolioCount: 0,
    monthlySipCount: 0,
    lumpsumCount: 0,
};

const EMPTY_STATE: DashboardState = {
    portfolios: [],
    portfolioSummary: EMPTY_SUMMARY,
    wallets: [],
    transactions: [],
    pendingDeposits: 0,
    pendingWithdrawals: 0,
};

const CURRENCY_SYMBOL: Record<string, string> = {
    USD: "$",
    SGD: "S$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    AED: "د.إ",
    BTC: "₿",
    ETH: "Ξ",
    USDT: "₮",
    SOL: "◎",
    TRX: "T",
};

const CATEGORY_META = {
    monthly: { label: "Monthly SIP", icon: BarChart3 },
    lumpsum: { label: "Lump Sum", icon: Banknote },
    crypto: { label: "Digital Assets", icon: Bitcoin },
} as const;

const TRANSACTION_META: Record<TransactionType, {
    label: string;
    icon: typeof ArrowUpRight;
    positive: boolean;
    iconClass: string;
}> = {
    deposit: { label: "Wallet deposit", icon: ArrowDownLeft, positive: true, iconClass: "bg-emerald-50 text-emerald-600" },
    earning: { label: "Investment earning", icon: TrendingUp, positive: true, iconClass: "bg-blue-50 text-blue-600" },
    withdrawal: { label: "Withdrawal", icon: ArrowUpRight, positive: false, iconClass: "bg-amber-50 text-amber-600" },
    investment: { label: "Portfolio investment", icon: BriefcaseBusiness, positive: false, iconClass: "bg-indigo-50 text-indigo-600" },
    penalty: { label: "Exit penalty", icon: ArrowUpRight, positive: false, iconClass: "bg-rose-50 text-rose-600" },
    charge: { label: "Account charge", icon: ArrowUpRight, positive: false, iconClass: "bg-slate-100 text-slate-600" },
};

function formatUsd(value: number, compact = false) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: compact ? "compact" : "standard",
        maximumFractionDigits: compact ? 1 : 0,
    }).format(Number.isFinite(value) ? value : 0);
}

function formatWalletAmount(wallet: FundWallet, hidden: boolean) {
    if (hidden) return "••••••";
    const code = wallet.currency.toUpperCase();
    const isFiat = ["USD", "SGD", "EUR", "GBP", "INR", "AED"].includes(code);
    const value = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: isFiat ? 2 : 0,
        maximumFractionDigits: isFiat ? 2 : 6,
    }).format(wallet.balance);
    return `${CURRENCY_SYMBOL[code] ?? ""}${value}${isFiat ? "" : ` ${code}`}`;
}

function formatDate(value?: string | null, includeYear = false) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        ...(includeYear ? { year: "numeric" } : {}),
    });
}

function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function safeDocs(value: unknown, key?: string): unknown[] {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object") return [];
    const record = value as Record<string, unknown>;
    if (key && Array.isArray(record[key])) return record[key] as unknown[];
    if (Array.isArray(record.docs)) return record.docs;
    if (record.data && typeof record.data === "object") return safeDocs(record.data, key);
    return [];
}

function getTotalDocs(value: unknown): number {
    if (!value || typeof value !== "object") return 0;
    const record = value as Record<string, unknown>;
    if (typeof record.totalDocs === "number") return record.totalDocs;
    if (typeof record.total === "number") return record.total;
    if (record.data && typeof record.data === "object") return getTotalDocs(record.data);
    return safeDocs(value).length;
}

function deriveSummary(portfolios: ClientPortfolioInterface[]): PortfolioListSummary {
    return portfolios.reduce<PortfolioListSummary>((summary, portfolio) => {
        summary.totalInvestedUsd += portfolio.summary?.totalInvestedUsd ?? portfolio.amountUsd ?? 0;
        summary.totalExpectedProfitUsd += portfolio.summary?.totalExpectedProfitUsd ?? 0;
        summary.totalCurrentValueUsd += portfolio.summary?.currentValueUsd ?? portfolio.summary?.totalInvestedUsd ?? 0;
        if (portfolio.status === "active") summary.activePortfolioCount += 1;
        if (portfolio.investmentMode === "sip") summary.monthlySipCount += 1;
        if (portfolio.investmentMode === "lumpsum") summary.lumpsumCount += 1;
        return summary;
    }, { ...EMPTY_SUMMARY });
}

function buildCapitalTrend(portfolios: ClientPortfolioInterface[], months: number): TrendPoint[] {
    const now = new Date();
    const points = Array.from({ length: months }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        const value = portfolios.reduce((total, portfolio) => {
            const started = new Date(portfolio.startedAt || portfolio.createdAt).getTime();
            if (Number.isNaN(started) || started > end.getTime()) return total;
            return total + (portfolio.summary?.totalInvestedUsd ?? portfolio.amountUsd ?? 0);
        }, 0);
        return {
            label: date.toLocaleDateString("en-US", { month: "short" }),
            value,
        };
    });

    const currentInvested = portfolios.reduce(
        (total, portfolio) => total + (portfolio.summary?.totalInvestedUsd ?? portfolio.amountUsd ?? 0),
        0,
    );
    if (points.every((point) => point.value === 0) && currentInvested > 0) {
        return points.map((point) => ({ ...point, value: currentInvested }));
    }
    return points;
}

function chartGeometry(points: TrendPoint[]) {
    const width = 680;
    const height = 164;
    const top = 12;
    const bottom = 20;
    const values = points.map((point) => point.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = Math.max(max - min, 1);
    const coordinates = points.map((point, index) => {
        const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
        const y = top + ((max - point.value) / range) * (height - top - bottom);
        return { x, y };
    });
    const line = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
    const area = coordinates.length
        ? `M ${coordinates[0].x} ${height - bottom} L ${coordinates.map((point) => `${point.x} ${point.y}`).join(" L ")} L ${coordinates.at(-1)?.x ?? width} ${height - bottom} Z`
        : "";
    return { coordinates, line, area, max };
}

function statusClass(status: string) {
    if (["completed", "approved", "active"].includes(status)) return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
    if (["pending", "paused"].includes(status)) return "bg-amber-50 text-amber-700 ring-amber-600/10";
    if (["failed", "rejected", "cancelled"].includes(status)) return "bg-rose-50 text-rose-700 ring-rose-600/10";
    return "bg-slate-100 text-slate-600 ring-slate-500/10";
}

function DashboardSkeleton() {
    return (
        <div className="mx-auto min-h-full max-w-[1560px] animate-pulse space-y-5 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
                <div className="space-y-2"><div className="h-6 w-52 rounded-lg bg-slate-200" /><div className="h-3 w-72 rounded bg-slate-200/70" /></div>
                <div className="h-10 w-48 rounded-xl bg-slate-200" />
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,.8fr)]">
                <div className="h-64 rounded-[24px] bg-slate-300" />
                <div className="h-64 rounded-[24px] bg-white" />
            </div>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,.7fr)]">
                <div className="h-72 rounded-[24px] bg-white" />
                <div className="h-72 rounded-[24px] bg-white" />
            </div>
        </div>
    );
}

function EmptyActivity() {
    return (
        <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3FB] text-[#1D4ED8]">
                <Activity className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-bold text-[#0F172A]">No account activity yet</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">Your deposits, investments, earnings, and withdrawals will appear here.</p>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const clientId = user?._id;
    const [data, setData] = useState<DashboardState>(EMPTY_STATE);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [balanceHidden, setBalanceHidden] = useState(false);
    const [trendMonths, setTrendMonths] = useState<6 | 12>(6);
    const [loadError, setLoadError] = useState(false);

    const loadDashboard = useCallback(async (background = false) => {
        if (!clientId) {
            setLoading(false);
            return;
        }

        if (background) setRefreshing(true);
        else setLoading(true);
        setLoadError(false);

        const results = await Promise.allSettled([
            appClient.get("/api/portfolio/my", { params: { page: 1, limit: 100 } }),
            appClient.get("/api/transactions/fund-balances", { params: { userId: clientId, userModel: "Client" } }),
            appClient.get("/api/transactions/my", {
                params: { clientId, page: 1, limit: 5, sortBy: "createdAt", sortOrder: "desc" },
            }),
            appClient.get("/api/deposits/my", { params: { page: 1, limit: 1, status: "pending" } }),
            appClient.get("/api/withdrawals/my", { params: { page: 1, limit: 1, status: "pending" } }),
        ]);

        setLoadError(results.slice(0, 3).every((result) => result.status === "rejected"));
        setData((previous) => {
            const next = { ...previous };

            const portfolioResult = results[0];
            if (portfolioResult.status === "fulfilled") {
                const payload = portfolioResult.value.data as PortfolioListResponse;
                const portfolios = Array.isArray(payload?.portfolios) ? payload.portfolios : [];
                next.portfolios = portfolios;
                next.portfolioSummary = payload?.summary ?? deriveSummary(portfolios);
            }

            const walletResult = results[1];
            if (walletResult.status === "fulfilled") {
                const payload = walletResult.value.data as { wallets?: FundWallet[]; balances?: FundWallet[]; data?: FundWallet[] } | FundWallet[];
                const wallets = Array.isArray(payload)
                    ? payload
                    : payload.wallets ?? payload.balances ?? payload.data ?? [];
                next.wallets = wallets.filter((wallet) => Number.isFinite(wallet.balance));
            }

            const transactionResult = results[2];
            if (transactionResult.status === "fulfilled") {
                const payload = transactionResult.value.data as Record<string, unknown>;
                next.transactions = safeDocs(payload.transactions ?? payload.data ?? payload) as TransactionInterface[];
            }

            const depositResult = results[3];
            if (depositResult.status === "fulfilled") {
                const payload = depositResult.value.data as Record<string, unknown>;
                next.pendingDeposits = getTotalDocs(payload.deposits ?? payload.data ?? payload);
            }

            const withdrawalResult = results[4];
            if (withdrawalResult.status === "fulfilled") {
                const payload = withdrawalResult.value.data as Record<string, unknown>;
                next.pendingWithdrawals = getTotalDocs(payload.withdrawals ?? payload.data ?? payload);
            }

            return next;
        });

        setLoading(false);
        setRefreshing(false);
    }, [clientId]);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => { void loadDashboard(); });
        return () => window.cancelAnimationFrame(frame);
    }, [loadDashboard]);

    const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "Investor";
    const pendingRequests = data.pendingDeposits + data.pendingWithdrawals;
    const currentValue = data.portfolioSummary.totalCurrentValueUsd;
    const invested = data.portfolioSummary.totalInvestedUsd;
    const expectedProfit = data.portfolioSummary.totalExpectedProfitUsd;
    const expectedReturn = invested > 0 ? (expectedProfit / invested) * 100 : 0;

    const activePortfolios = useMemo(
        () => data.portfolios.filter((portfolio) => portfolio.status === "active"),
        [data.portfolios],
    );

    const nextSip = useMemo(() => activePortfolios
        .filter((portfolio) => portfolio.investmentMode === "sip" && portfolio.sip?.nextDueDate)
        .sort((a, b) => new Date(a.sip?.nextDueDate ?? 0).getTime() - new Date(b.sip?.nextDueDate ?? 0).getTime())[0],
    [activePortfolios]);

    const allocation = useMemo(() => {
        const totals = new Map<string, number>();
        activePortfolios.forEach((portfolio) => {
            const category = portfolio.planSnapshot?.category ?? "lumpsum";
            const amount = portfolio.summary?.currentValueUsd ?? portfolio.summary?.totalInvestedUsd ?? portfolio.amountUsd ?? 0;
            totals.set(category, (totals.get(category) ?? 0) + amount);
        });
        const max = Math.max(...totals.values(), 1);
        return [...totals.entries()]
            .map(([category, value]) => ({ category, value, width: (value / max) * 100 }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);
    }, [activePortfolios]);

    const trend = useMemo(() => buildCapitalTrend(data.portfolios, trendMonths), [data.portfolios, trendMonths]);
    const geometry = useMemo(() => chartGeometry(trend), [trend]);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="min-h-full bg-[#F4F7FC]">
            <div className="mx-auto max-w-[1560px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A78B8]">
                            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}</span>
                            <span className="h-1 w-1 rounded-full bg-[#5A78B8]/50" />
                            <span>Client overview</span>
                        </div>
                        <h1 className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.035em] text-[#071F55] sm:text-[30px]">
                            {greeting()}, {firstName}.
                        </h1>
                        <p className="mt-1 text-[13px] font-medium text-[#5A78B8]">Here is how your portfolio is progressing today.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => void loadDashboard(true)}
                            disabled={refreshing}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8E2F2] bg-white text-[#5A78B8] shadow-[0_8px_20px_rgba(7,31,85,0.04)] transition hover:border-[#1D4ED8]/30 hover:text-[#1D4ED8] disabled:opacity-50"
                            aria-label="Refresh dashboard"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        </button>
                        <Link href="/wallet" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E2F2] bg-white px-4 text-[12px] font-bold text-[#071F55] shadow-[0_8px_20px_rgba(7,31,85,0.04)] transition hover:border-[#1D4ED8]/30 hover:text-[#1D4ED8]">
                            <ArrowUpRight className="h-4 w-4" /> Withdraw
                        </Link>
                        <Link href="/wallet" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 text-[12px] font-bold text-white shadow-[0_10px_24px_rgba(29,78,216,0.24)] transition hover:bg-[#173FAE]">
                            <Plus className="h-4 w-4" /> Add funds
                        </Link>
                    </div>
                </motion.section>

                {loadError && (
                    <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                        <span>Some dashboard data could not be refreshed. Previously loaded values are still shown.</span>
                        <button onClick={() => void loadDashboard(true)} className="font-bold">Try again</button>
                    </div>
                )}

                <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,.8fr)]">
                    <motion.article
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="relative min-h-[258px] overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#0B1930_0%,#103875_52%,#1D5CC8_100%)] p-6 text-white shadow-[0_20px_50px_rgba(7,31,85,0.18)] sm:p-7"
                    >
                        <div className="pointer-events-none absolute -right-28 -top-40 h-80 w-80 rounded-full border border-white/10 shadow-[0_0_0_38px_rgba(255,255,255,0.025),0_0_0_76px_rgba(255,255,255,0.018)]" />
                        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-72 -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(96,165,250,0.22),transparent_68%)]" />
                        <div className="relative z-10 flex h-full flex-col">
                            <div className="flex items-start justify-between gap-5">
                                <div>
                                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
                                        <ShieldCheck className="h-3.5 w-3.5" /> Total portfolio value
                                    </div>
                                    <p className="mt-3 text-[34px] font-bold tracking-[-0.045em] sm:text-[40px]">
                                        {formatUsd(currentValue)} <span className="text-sm font-medium tracking-normal text-white/45">USD</span>
                                    </p>
                                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200">
                                        <TrendingUp className="h-3.5 w-3.5" /> {formatUsd(expectedProfit)} expected profit
                                    </div>
                                </div>
                                {pendingRequests > 0 && (
                                    <Link href="/wallet" className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-[11px] font-semibold text-white/75 backdrop-blur sm:flex">
                                        <Clock3 className="h-3.5 w-3.5" /> {pendingRequests} pending request{pendingRequests === 1 ? "" : "s"}
                                    </Link>
                                )}
                            </div>
                            <div className="mt-auto grid grid-cols-2 gap-5 pt-8 sm:grid-cols-4">
                                <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/38">Total invested</p><p className="mt-1.5 text-[15px] font-bold">{formatUsd(invested)}</p></div>
                                <div className="border-l border-white/10 pl-5"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/38">Expected return</p><p className="mt-1.5 text-[15px] font-bold">{expectedReturn.toFixed(1)}%</p></div>
                                <div className="sm:border-l sm:border-white/10 sm:pl-5"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/38">Active portfolios</p><p className="mt-1.5 text-[15px] font-bold">{data.portfolioSummary.activePortfolioCount}</p></div>
                                <div className="border-l border-white/10 pl-5"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/38">Monthly SIPs</p><p className="mt-1.5 text-[15px] font-bold">{data.portfolioSummary.monthlySipCount}</p></div>
                            </div>
                        </div>
                    </motion.article>

                    <motion.article
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-[24px] border border-[#DFE7F3] bg-white p-5 shadow-[0_14px_40px_rgba(7,31,85,0.06)]"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#1D4ED8]"><Wallet className="h-4 w-4" /></div><div><h2 className="text-[13px] font-bold text-[#071F55]">Wallet balances</h2><p className="text-[10px] text-slate-400">Available funds</p></div></div>
                            <button onClick={() => setBalanceHidden((hidden) => !hidden)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[#071F55]" aria-label={balanceHidden ? "Show balances" : "Hide balances"}>
                                {balanceHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                        </div>

                        {data.wallets.length === 0 ? (
                            <div className="flex min-h-[145px] flex-col items-center justify-center text-center">
                                <p className="text-xs font-semibold text-slate-500">No wallet balances yet</p>
                                <p className="mt-1 text-[10px] text-slate-400">Approved deposits will appear here.</p>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-2.5">
                                {data.wallets.slice(0, 3).map((wallet, index) => (
                                    <div key={wallet._id ?? `${wallet.currency}-${index}`} className="flex items-center gap-3 rounded-2xl bg-[#F6F8FC] px-3 py-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[13px] font-black text-[#1D4ED8] shadow-sm">{CURRENCY_SYMBOL[wallet.currency.toUpperCase()] ?? wallet.currency.slice(0, 1)}</div>
                                        <div className="min-w-0 flex-1"><p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">{wallet.currency} balance</p><p className="mt-0.5 truncate text-[13px] font-bold tabular-nums text-[#0F172A]">{formatWalletAmount(wallet, balanceHidden)}</p></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link href="/wallet" className="mt-4 flex items-center justify-center gap-1.5 border-t border-[#EEF2F7] pt-4 text-[11px] font-bold text-[#1D4ED8]">Manage wallet <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </motion.article>
                </section>

                <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,.7fr)]">
                    <article className="rounded-[24px] border border-[#DFE7F3] bg-white p-5 shadow-[0_14px_40px_rgba(7,31,85,0.05)] sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div><h2 className="text-[15px] font-bold text-[#071F55]">Capital deployed</h2><p className="mt-1 text-[11px] text-slate-400">Cumulative invested capital across your portfolios</p></div>
                            <div className="flex rounded-xl bg-[#F1F4F9] p-1">
                                {([6, 12] as const).map((months) => (
                                    <button key={months} onClick={() => setTrendMonths(months)} className={`h-7 rounded-lg px-3 text-[10px] font-bold transition ${trendMonths === months ? "bg-[#071F55] text-white shadow-sm" : "text-slate-400 hover:text-[#071F55]"}`}>{months}M</button>
                                ))}
                            </div>
                        </div>

                        {invested === 0 ? (
                            <div className="flex h-[220px] flex-col items-center justify-center text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3FF] text-[#1D4ED8]"><TrendingUp className="h-5 w-5" /></div>
                                <p className="mt-4 text-sm font-bold text-[#071F55]">Your investment journey starts here</p>
                                <Link href="/investments" className="mt-2 text-xs font-bold text-[#1D4ED8]">Browse investment plans</Link>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Current deployed capital</p><p className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-[#071F55]">{formatUsd(invested)}</p></div><p className="text-[10px] text-slate-400">Peak {formatUsd(geometry.max, true)}</p></div>
                                <div className="h-[165px] w-full">
                                    <svg viewBox="0 0 680 164" preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label="Cumulative capital deployed over time">
                                        <defs><linearGradient id="dashboard-capital-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" /><stop offset="100%" stopColor="#2563EB" stopOpacity="0" /></linearGradient></defs>
                                        {[32, 76, 120].map((y) => <line key={y} x1="0" y1={y} x2="680" y2={y} stroke="#E8EDF5" strokeWidth="1" />)}
                                        <path d={geometry.area} fill="url(#dashboard-capital-fill)" />
                                        <polyline points={geometry.line} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                                        {geometry.coordinates.map((point, index) => index === geometry.coordinates.length - 1 ? <circle key={index} cx={point.x} cy={point.y} r="5" fill="white" stroke="#2563EB" strokeWidth="3" vectorEffect="non-scaling-stroke" /> : null)}
                                    </svg>
                                </div>
                                <div className="mt-1 flex justify-between text-[9px] font-semibold text-slate-400">{trend.map((point, index) => <span key={`${point.label}-${index}`}>{point.label}</span>)}</div>
                            </div>
                        )}
                    </article>

                    <article className="overflow-hidden rounded-[24px] border border-[#DFE7F3] bg-white shadow-[0_14px_40px_rgba(7,31,85,0.05)]">
                        <div className="flex items-center justify-between border-b border-[#EEF2F7] px-5 py-4 sm:px-6"><div><h2 className="text-[15px] font-bold text-[#071F55]">Recent activity</h2><p className="mt-0.5 text-[10px] text-slate-400">Latest account movements</p></div><Link href="/transactions" className="text-[10px] font-bold text-[#1D4ED8]">View all</Link></div>
                        {data.transactions.length === 0 ? <EmptyActivity /> : (
                            <div className="divide-y divide-[#EEF2F7] px-5 sm:px-6">
                                {data.transactions.slice(0, 5).map((transaction) => {
                                    const meta = TRANSACTION_META[transaction.type] ?? TRANSACTION_META.charge;
                                    const Icon = meta.icon;
                                    return (
                                        <Link href="/transactions" key={transaction._id} className="group grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 py-3.5">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${meta.iconClass}`}><Icon className="h-4 w-4" /></div>
                                            <div className="min-w-0"><p className="truncate text-[11.5px] font-bold text-[#0F172A]">{transaction.description || meta.label}</p><p className="mt-0.5 text-[9.5px] text-slate-400">{formatDate(transaction.createdAt, true)} · {transaction.currency}</p></div>
                                            <div className="text-right"><p className={`text-[11.5px] font-bold tabular-nums ${meta.positive ? "text-emerald-600" : "text-[#0F172A]"}`}>{meta.positive ? "+" : "−"}{transaction.amount.toLocaleString("en-US", { maximumFractionDigits: 6 })}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[8px] font-bold capitalize ring-1 ring-inset ${statusClass(transaction.status)}`}>{transaction.status}</span></div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </article>
                </section>

                <section className="mt-4 grid gap-4 lg:grid-cols-2">
                    <article className="rounded-[24px] border border-[#DFE7F3] bg-white p-5 shadow-[0_14px_40px_rgba(7,31,85,0.05)] sm:p-6">
                        <div className="flex items-center justify-between"><div><h2 className="text-[15px] font-bold text-[#071F55]">Portfolio allocation</h2><p className="mt-0.5 text-[10px] text-slate-400">Active holdings by strategy</p></div><Link href="/portfolio" className="flex items-center gap-1 text-[10px] font-bold text-[#1D4ED8]">Portfolio <ChevronRight className="h-3.5 w-3.5" /></Link></div>
                        {allocation.length === 0 ? (
                            <div className="mt-5 flex min-h-24 items-center justify-between rounded-2xl bg-[#F6F8FC] px-4"><div><p className="text-xs font-bold text-[#071F55]">No active holdings</p><p className="mt-1 text-[10px] text-slate-400">Choose a plan to start building your portfolio.</p></div><Link href="/investments" className="rounded-xl bg-[#071F55] px-3 py-2 text-[10px] font-bold text-white">Browse plans</Link></div>
                        ) : (
                            <div className="mt-5 space-y-4">
                                {allocation.map((item) => {
                                    const meta = CATEGORY_META[item.category as keyof typeof CATEGORY_META] ?? CATEGORY_META.lumpsum;
                                    const Icon = meta.icon;
                                    return (
                                        <div key={item.category} className="grid grid-cols-[minmax(120px,1fr)_minmax(90px,1.2fr)_auto] items-center gap-4">
                                            <div className="flex min-w-0 items-center gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#1D4ED8]"><Icon className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-[11px] font-bold text-[#0F172A]">{meta.label}</p><p className="mt-0.5 text-[9px] text-slate-400">Active strategy</p></div></div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-[#EDF1F7]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#1D4ED8,#60A5FA)]" style={{ width: `${item.width}%` }} /></div>
                                            <p className="text-right text-[11px] font-bold tabular-nums text-[#071F55]">{formatUsd(item.value)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </article>

                    <article className="rounded-[24px] border border-[#DFE7F3] bg-white p-5 shadow-[0_14px_40px_rgba(7,31,85,0.05)] sm:p-6">
                        <div className="flex items-center justify-between"><div><h2 className="text-[15px] font-bold text-[#071F55]">Next SIP payment</h2><p className="mt-0.5 text-[10px] text-slate-400">Upcoming scheduled installment</p></div><CalendarDays className="h-4 w-4 text-[#5A78B8]" /></div>
                        {nextSip ? (
                            <Link href={`/portfolio/${nextSip._id}`} className="group mt-5 flex items-center gap-4 rounded-2xl bg-[#F5F7FC] p-3.5 transition hover:bg-[#EEF3FF]">
                                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#1D4ED8] text-white shadow-[0_8px_20px_rgba(29,78,216,0.2)]"><span className="text-lg font-bold leading-none">{new Date(nextSip.sip?.nextDueDate ?? "").getDate()}</span><span className="mt-1 text-[8px] font-bold uppercase tracking-wide text-white/65">{new Date(nextSip.sip?.nextDueDate ?? "").toLocaleDateString("en-US", { month: "short" })}</span></div>
                                <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-[#071F55]">{nextSip.planSnapshot?.name ?? "Monthly SIP"}</p><p className="mt-1 text-[10px] text-slate-400">Installment {(nextSip.sip?.paidInstallments ?? 0) + 1}{nextSip.sip?.totalInstallments ? ` of ${nextSip.sip.totalInstallments}` : ""} · Due {formatDate(nextSip.sip?.nextDueDate)}</p></div>
                                <div className="text-right"><p className="text-[13px] font-bold text-[#071F55]">{formatUsd(nextSip.sip?.monthlyAmountUsd ?? 0)}</p><span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-[#1D4ED8]">View <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></span></div>
                            </Link>
                        ) : (
                            <div className="mt-5 flex min-h-24 items-center gap-4 rounded-2xl bg-[#F6F8FC] px-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1D4ED8] shadow-sm"><CalendarDays className="h-4 w-4" /></div><div><p className="text-xs font-bold text-[#071F55]">No SIP payment due</p><p className="mt-1 text-[10px] text-slate-400">You are all caught up with scheduled installments.</p></div></div>
                        )}
                    </article>
                </section>
            </div>

            {refreshing && <div className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-xl bg-[#071F55] px-4 py-2.5 text-[11px] font-bold text-white shadow-2xl"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Refreshing dashboard</div>}
        </div>
    );
}
