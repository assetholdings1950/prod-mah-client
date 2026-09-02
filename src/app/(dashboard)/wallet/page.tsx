"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Loader2, Plus, RefreshCw, Wallet } from "lucide-react";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";
import type { IBankDetail, IWalletDetail } from "@/interface/payment";
import type { DepositRequest, HistoryFilter, WithdrawalRequest, WalletBalance, PaymentMethod } from "@/interface/wallet";
import { cur, CoinToken } from "@/components/wallet/currency";
import { fmtAmt } from "@/utils/walletHelpers";
import { DepositRow } from "@/components/wallet/DepositRow";
import { WithdrawalRow } from "@/components/wallet/WithdrawalRow";
import { PaginationBar } from "@/components/wallet/PaginationBar";
import { DepositModal } from "@/components/wallet/DepositModal";
import { WithdrawalModal } from "@/components/wallet/WithdrawalModal";
import { isAccountOpeningApproved } from "@/lib/accountOpening";

const FILTER_OPTIONS: { key: HistoryFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
];

function WalletPageContent() {
    const { user } = useAuthStore();
    const router = useRouter();

    // ── Remote data ──────────────────────────────────────────────────────────
    const [balances, setBalances] = useState<WalletBalance[]>([]);
    const [balancesLoading, setBalancesLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [pmLoading, setPmLoading] = useState(true);
    const [deposits, setDeposits] = useState<DepositRequest[]>([]);
    const [depositsLoading, setDepositsLoading] = useState(true);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
    const [bankDetails, setBankDetails] = useState<IBankDetail[]>([]);
    const [clientWallets, setClientWallets] = useState<IWalletDetail[]>([]);
    const [destinationsLoading, setDestinationsLoading] = useState(true);

    // ── Pagination ────────────────────────────────────────────────────────────
    const [depositPage, setDepositPage] = useState(1);
    const [depositLimit, setDepositLimit] = useState(10);
    const [depositMeta, setDepositMeta] = useState<{ total: number; totalPages: number } | null>(null);
    const [withdrawalPage, setWithdrawalPage] = useState(1);
    const [withdrawalLimit, setWithdrawalLimit] = useState(10);
    const [withdrawalMeta, setWithdrawalMeta] = useState<{ total: number; totalPages: number } | null>(null);

    // ── Per-panel filters ─────────────────────────────────────────────────────
    const [depositFilter, setDepositFilter] = useState<HistoryFilter>("all");
    const [withdrawalFilter, setWithdrawalFilter] = useState<HistoryFilter>("all");

    // ── Modal open state ──────────────────────────────────────────────────────
    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

    // ── Fetchers ──────────────────────────────────────────────────────────────

    const fetchBalances = useCallback(async () => {
        if (!user?._id) return;
        setBalancesLoading(true);
        try {
            const res = await appClient.get("/api/transactions/fund-balances", {
                params: { userId: user._id, userModel: "Client" },
            });
            const raw = res.data as Record<string, unknown>;
            const arr: WalletBalance[] = Array.isArray(raw)
                ? (raw as unknown as WalletBalance[])
                : Array.isArray(raw.wallets) ? (raw.wallets as WalletBalance[])
                    : Array.isArray(raw.data) ? (raw.data as WalletBalance[])
                        : [];
            setBalances(arr.filter(b => typeof b.balance === "number" && Number.isFinite(b.balance)));
        } catch { /* silent */ } finally { setBalancesLoading(false); }
    }, [user?._id]);

    const fetchPaymentMethods = useCallback(async () => {
        setPmLoading(true);
        try {
            const res = await appClient.get("/api/payment-methods");
            if (res.data.status) {
                setPaymentMethods(res.data.paymentMethods as PaymentMethod[]);
            }
        } catch { /* silent */ } finally { setPmLoading(false); }
    }, []);

    const fetchDeposits = useCallback(async (status: HistoryFilter = "all", page = 1, limit = 10) => {
        setDepositsLoading(true);
        try {
            const params: Record<string, string> = { page: String(page), limit: String(limit) };
            if (status !== "all") params.status = status;
            const res = await appClient.get("/api/deposits/my", { params });
            const raw = res.data as Record<string, unknown>;
            const nested = (raw.deposits ?? raw.data ?? raw) as Record<string, unknown> | unknown[];
            const docs: unknown[] = Array.isArray(nested)
                ? nested
                : Array.isArray((nested as Record<string, unknown>).docs)
                    ? (nested as Record<string, unknown>).docs as unknown[]
                    : [];
            setDeposits(docs as DepositRequest[]);
            const meta = !Array.isArray(nested) ? nested as Record<string, unknown> : null;
            setDepositMeta({
                total: typeof meta?.totalDocs === "number" ? meta.totalDocs as number : docs.length,
                totalPages: typeof meta?.totalPages === "number" ? meta.totalPages as number : 1,
            });
        } catch { /* silent */ } finally { setDepositsLoading(false); }
    }, []);

    const fetchWithdrawals = useCallback(async (status: HistoryFilter = "all", page = 1, limit = 10) => {
        setWithdrawalsLoading(true);
        try {
            const params: Record<string, string> = { page: String(page), limit: String(limit) };
            if (status !== "all") params.status = status;
            const res = await appClient.get("/api/withdrawals/my", { params });
            const raw = res.data as Record<string, unknown>;
            const nested = (raw.data ?? raw.withdrawals ?? raw) as Record<string, unknown> | unknown[];
            const docs: unknown[] = Array.isArray(nested)
                ? nested
                : Array.isArray((nested as Record<string, unknown>).docs)
                    ? (nested as Record<string, unknown>).docs as unknown[]
                    : [];
            setWithdrawals(docs as WithdrawalRequest[]);
            const meta = !Array.isArray(nested) ? nested as Record<string, unknown> : null;
            setWithdrawalMeta({
                total: typeof meta?.totalDocs === "number" ? meta.totalDocs as number : docs.length,
                totalPages: typeof meta?.totalPages === "number" ? meta.totalPages as number : 1,
            });
        } catch { /* silent */ } finally { setWithdrawalsLoading(false); }
    }, []);

    const fetchWithdrawalDestinations = useCallback(async () => {
        if (!user?._id) return;
        setDestinationsLoading(true);
        try {
            const [banksRes, walletsRes] = await Promise.all([
                appClient.get("/api/clients/bank-details", { params: { clientId: user._id } }),
                appClient.get("/api/clients/wallets", { params: { clientId: user._id } }),
            ]);
            setBankDetails(banksRes.data?.data ?? banksRes.data?.bankDetails ?? []);
            setClientWallets(walletsRes.data?.data ?? walletsRes.data?.wallets ?? []);
        } catch { /* silent */ } finally { setDestinationsLoading(false); }
    }, [user?._id]);

    // Initial load
    useEffect(() => {
        void fetchBalances();
        void fetchPaymentMethods();
        void fetchDeposits("all", 1, 10);
        void fetchWithdrawals("all", 1, 10);
        void fetchWithdrawalDestinations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchBalances, fetchPaymentMethods, fetchDeposits, fetchWithdrawals, fetchWithdrawalDestinations]);

    // ── Filter handlers ───────────────────────────────────────────────────────

    const handleDepositFilterChange = useCallback((filter: HistoryFilter) => {
        setDepositFilter(filter);
        setDepositPage(1);
        void fetchDeposits(filter, 1, depositLimit);
    }, [fetchDeposits, depositLimit]);

    const handleWithdrawalFilterChange = useCallback((filter: HistoryFilter) => {
        setWithdrawalFilter(filter);
        setWithdrawalPage(1);
        void fetchWithdrawals(filter, 1, withdrawalLimit);
    }, [fetchWithdrawals, withdrawalLimit]);

    // ── Pagination callbacks ──────────────────────────────────────────────────

    const goToDepositPage = useCallback((p: number) => {
        setDepositPage(p);
        void fetchDeposits(depositFilter, p, depositLimit);
    }, [fetchDeposits, depositFilter, depositLimit]);

    const changeDepositLimit = useCallback((l: number) => {
        setDepositLimit(l); setDepositPage(1);
        void fetchDeposits(depositFilter, 1, l);
    }, [fetchDeposits, depositFilter]);

    const goToWithdrawalPage = useCallback((p: number) => {
        setWithdrawalPage(p);
        void fetchWithdrawals(withdrawalFilter, p, withdrawalLimit);
    }, [fetchWithdrawals, withdrawalFilter, withdrawalLimit]);

    const changeWithdrawalLimit = useCallback((l: number) => {
        setWithdrawalLimit(l); setWithdrawalPage(1);
        void fetchWithdrawals(withdrawalFilter, 1, l);
    }, [fetchWithdrawals, withdrawalFilter]);

    // ── Convenience ───────────────────────────────────────────────────────────

    const refreshAll = () => {
        void fetchBalances();
        void fetchDeposits(depositFilter, depositPage, depositLimit);
        void fetchWithdrawals(withdrawalFilter, withdrawalPage, withdrawalLimit);
    };

    const openDepositModal = () => setDepositModalOpen(true);
    const openWithdrawModal = async () => {
        try {
            if (await isAccountOpeningApproved()) {
                void fetchWithdrawalDestinations();
                setWithdrawModalOpen(true);
                return;
            }
        } catch { /* status page will show the actionable error */ }
        if (user?._id) {
            router.push("/account-opening?required=withdrawal");
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-full bg-[#F8FAFC]">
            <div className="mx-auto max-w-[1560px] space-y-6 px-4 py-5 sm:px-6 lg:px-8">

                {/* ── Page heading ── */}
                <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-[#071F55] sm:text-[26px]">Wallet</h1>
                        <p className="mt-1 text-[13px] font-medium text-[#5A78B8]">
                            Manage your digital assets and track your deposit and withdrawal requests.
                        </p>
                    </div>
                    <button onClick={refreshAll}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D9E3F2] bg-white px-4 text-[12px] font-bold text-[#071F55] shadow-[0_8px_24px_rgba(7,31,85,0.05)] transition hover:border-[#0B5ED7]/35 hover:text-[#0B5ED7]">
                        <RefreshCw className={`h-4 w-4 ${balancesLoading || depositsLoading || withdrawalsLoading ? "animate-spin" : ""}`} />
                        Refresh data
                    </button>
                </section>

                {/* ── Balances + actions ── */}
                <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Balance cards */}
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-[14px] font-bold text-[#071F55]">Wallet Balances</h2>
                            <button onClick={() => void fetchBalances()}
                                className="flex items-center gap-1.5 text-[12px] font-bold text-[#0B5ED7] transition hover:text-[#071F55]">
                                <RefreshCw className={`h-3.5 w-3.5 ${balancesLoading ? "animate-spin" : ""}`} />Refresh
                            </button>
                        </div>
                        {balancesLoading ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-[118px] animate-pulse rounded-2xl bg-[#EEF3FB]" />)}
                            </div>
                        ) : balances.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#D9E3F2] bg-[#F8FAFC] px-6 py-10 text-center">
                                <Wallet className="mx-auto h-9 w-9 text-[#8DA3C4]" />
                                <p className="mt-3 text-[13px] font-medium text-[#5A78B8]">No balances yet. Make your first deposit to get started.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                                {balances.map((b, index) => (
                                    <div key={b.currency} className="group rounded-2xl border border-[#D9E3F2] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#0B5ED7]/25 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <CoinToken currency={b.currency} size={32} />
                                                <div>
                                                    <p className="text-[13px] font-bold text-[#071F55]">{b.currency}</p>
                                                    <p className="text-[11px] text-[#5A78B8]">Available</p>
                                                </div>
                                            </div>
                                            <span className={`mt-1 h-2 w-2 rounded-full ${cur(b.currency).dot}`} />
                                        </div>
                                        <p className="mt-3 text-[21px] font-semibold tracking-[-0.03em] text-[#071F55]">{fmtAmt(b.balance)}</p>
                                        <p className="mt-1 text-[11px] font-medium text-[#5A78B8]">Live wallet balance</p>
                                        <svg viewBox="0 0 160 36" className="mt-2 h-7 w-full overflow-visible" aria-hidden>
                                            <path d={`M0 ${28 - index % 4} C 18 18, 26 32, 42 22 S 70 12, 84 21 S 110 31, 122 16 S 145 7, 160 ${14 + index % 6}`}
                                                fill="none" stroke={index % 2 ? "#7C3AED" : "#14B8A6"} strokeWidth="2.5" strokeLinecap="round" />
                                            <path d={`M0 ${28 - index % 4} C 18 18, 26 32, 42 22 S 70 12, 84 21 S 110 31, 122 16 S 145 7, 160 ${14 + index % 6} V36 H0 Z`}
                                                fill={index % 2 ? "rgba(124,58,237,0.09)" : "rgba(20,184,166,0.09)"} />
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                        <h2 className="text-[14px] font-bold text-[#071F55]">Quick Actions</h2>
                        <div className="mt-3 grid grid-cols-2 gap-2.5">
                            <button onClick={openDepositModal}
                                className="group flex h-[74px] items-center gap-3 rounded-2xl border border-[#D9E3F2] bg-white px-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                                    <Plus className="h-3.5 w-3.5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[12px] font-bold text-[#071F55]">Deposit</span>
                                    <span className="mt-0.5 block text-[10.5px] font-medium text-[#5A78B8]">Add funds</span>
                                </span>
                            </button>
                            <button onClick={openWithdrawModal}
                                className="group flex h-[74px] items-center gap-3 rounded-2xl border border-[#D9E3F2] bg-white px-3 text-left transition hover:border-orange-300 hover:bg-orange-50/50">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition group-hover:bg-orange-100">
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[12px] font-bold text-[#071F55]">Withdraw</span>
                                    <span className="mt-0.5 block text-[10.5px] font-medium text-[#5A78B8]">Request payout</span>
                                </span>
                            </button>
                            <button onClick={() => router.push("/payment-methods")}
                                className="group flex h-[74px] items-center gap-3 rounded-2xl border border-[#D9E3F2] bg-white px-3 text-left transition hover:border-violet-300 hover:bg-violet-50/50">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 transition group-hover:bg-violet-100">
                                    <Wallet className="h-3.5 w-3.5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[12px] font-bold text-[#071F55]">Methods</span>
                                    <span className="mt-0.5 block text-[10.5px] font-medium text-[#5A78B8]">Wallet details</span>
                                </span>
                            </button>
                            <button onClick={refreshAll}
                                className="group flex h-[74px] items-center gap-3 rounded-2xl border border-[#D9E3F2] bg-white px-3 text-left transition hover:border-amber-300 hover:bg-amber-50/50">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
                                    <RefreshCw className={`h-3.5 w-3.5 ${balancesLoading || depositsLoading || withdrawalsLoading ? "animate-spin" : ""}`} />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[12px] font-bold text-[#071F55]">Refresh</span>
                                    <span className="mt-0.5 block text-[10.5px] font-medium text-[#5A78B8]">Sync wallet</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Deposit | Withdrawal side-by-side ── */}
                <section className="grid gap-4 xl:grid-cols-2">

                    {/* ═══ LEFT — Deposit Requests ═══ */}
                    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                        {/* panel header */}
                        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                                    <Plus className="h-3.5 w-3.5 text-emerald-600" />
                                </span>
                                <h2 className="text-[14px] font-bold text-[#071F55]">Deposit Requests</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={openDepositModal}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700">
                                    <Plus className="h-3 w-3" />New
                                </button>
                                <button onClick={() => void fetchDeposits(depositFilter, depositPage, depositLimit)}
                                    className="flex items-center gap-1.5 rounded-xl border border-[#D9E3F2] px-3 py-1.5 text-[11px] font-bold text-[#071F55] transition hover:border-[#0B5ED7]/35 hover:text-[#0B5ED7]">
                                    <RefreshCw className={`h-3 w-3 ${depositsLoading ? "animate-spin" : ""}`} />Refresh
                                </button>
                            </div>
                        </div>

                        {/* filter pills */}
                        <div className="border-b border-[#E2E8F0] px-5 py-3">
                            <div className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-[18px] bg-[#F1F5F9] p-1">
                                {FILTER_OPTIONS.map(({ key, label }) => (
                                    <button key={key} onClick={() => handleDepositFilterChange(key)}
                                        className={`min-w-[72px] rounded-[14px] px-3.5 py-1.5 text-center text-[12px] font-extrabold tracking-[-0.01em] transition ${depositFilter === key
                                            ? "bg-white text-[#0F172A] shadow-[0_5px_12px_rgba(11,94,215,0.12)]"
                                            : "text-[#64748B] hover:bg-white/60 hover:text-[#0F172A]"}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* rows */}
                        {depositsLoading ? (
                            <div className="flex items-center justify-center gap-2 py-14 text-[13px] text-slate-400">
                                <Loader2 className="h-5 w-5 animate-spin" />Loading deposits…
                            </div>
                        ) : deposits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Clock className="h-10 w-10 text-slate-300" />
                                <p className="mt-3 text-[14px] font-semibold text-slate-400">No deposit requests yet.</p>
                                <button onClick={openDepositModal}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#16304f]">
                                    <Plus className="h-4 w-4" />Make your first deposit
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-[#EEF2F7]">
                                    {deposits.map(d => <DepositRow key={d._id} d={d} />)}
                                </div>
                                {depositMeta && (
                                    <PaginationBar
                                        page={depositPage} totalPages={depositMeta.totalPages}
                                        total={depositMeta.total} limit={depositLimit}
                                        loading={depositsLoading}
                                        onPageChange={goToDepositPage} onLimitChange={changeDepositLimit}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* ═══ RIGHT — Withdrawal Requests ═══ */}
                    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                        {/* panel header */}
                        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
                                    <ArrowLeft className="h-3.5 w-3.5 text-orange-600" />
                                </span>
                                <h2 className="text-[14px] font-bold text-[#071F55]">Withdrawal Requests</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={openWithdrawModal}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-orange-600">
                                    <Plus className="h-3 w-3" />New
                                </button>
                                <button onClick={() => void fetchWithdrawals(withdrawalFilter, withdrawalPage, withdrawalLimit)}
                                    className="flex items-center gap-1.5 rounded-xl border border-[#D9E3F2] px-3 py-1.5 text-[11px] font-bold text-[#071F55] transition hover:border-[#0B5ED7]/35 hover:text-[#0B5ED7]">
                                    <RefreshCw className={`h-3 w-3 ${withdrawalsLoading ? "animate-spin" : ""}`} />Refresh
                                </button>
                            </div>
                        </div>

                        {/* filter pills */}
                        <div className="border-b border-[#E2E8F0] px-5 py-3">
                            <div className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-[18px] bg-[#F1F5F9] p-1">
                                {FILTER_OPTIONS.map(({ key, label }) => (
                                    <button key={key} onClick={() => handleWithdrawalFilterChange(key)}
                                        className={`min-w-[72px] rounded-[14px] px-3.5 py-1.5 text-center text-[12px] font-extrabold tracking-[-0.01em] transition ${withdrawalFilter === key
                                            ? "bg-white text-[#0F172A] shadow-[0_5px_12px_rgba(11,94,215,0.12)]"
                                            : "text-[#64748B] hover:bg-white/60 hover:text-[#0F172A]"}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* rows */}
                        {withdrawalsLoading ? (
                            <div className="flex items-center justify-center gap-2 py-14 text-[13px] text-slate-400">
                                <Loader2 className="h-5 w-5 animate-spin" />Loading withdrawals…
                            </div>
                        ) : withdrawals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Clock className="h-10 w-10 text-slate-300" />
                                <p className="mt-3 text-[14px] font-semibold text-slate-400">No withdrawal requests yet.</p>
                                <button onClick={openWithdrawModal}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#16304f]">
                                    <ArrowLeft className="h-4 w-4" />Request withdrawal
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-[#EEF2F7]">
                                    {withdrawals.map(w => <WithdrawalRow key={w._id} w={w} />)}
                                </div>
                                {withdrawalMeta && (
                                    <PaginationBar
                                        page={withdrawalPage} totalPages={withdrawalMeta.totalPages}
                                        total={withdrawalMeta.total} limit={withdrawalLimit}
                                        loading={withdrawalsLoading}
                                        onPageChange={goToWithdrawalPage} onLimitChange={changeWithdrawalLimit}
                                    />
                                )}
                            </>
                        )}
                    </div>

                </section>

            </div>

            {/* ── Modals ── */}
            {depositModalOpen && (
                <DepositModal
                    user={user}
                    paymentMethods={paymentMethods}
                    pmLoading={pmLoading}
                    onClose={() => setDepositModalOpen(false)}
                    onSubmitSuccess={() => {
                        void fetchDeposits(depositFilter, depositPage, depositLimit);
                        void fetchBalances();
                    }}
                    onViewRequests={() => setDepositModalOpen(false)}
                />
            )}
            {withdrawModalOpen && (
                <WithdrawalModal
                    user={user}
                    balances={balances}
                    balancesLoading={balancesLoading}
                    bankDetails={bankDetails}
                    clientWallets={clientWallets}
                    destinationsLoading={destinationsLoading}
                    onClose={() => setWithdrawModalOpen(false)}
                    onSubmitSuccess={() => {
                        void fetchWithdrawals(withdrawalFilter, withdrawalPage, withdrawalLimit);
                        void fetchBalances();
                    }}
                    onOpenDepositModal={() => { setWithdrawModalOpen(false); setDepositModalOpen(true); }}
                />
            )}
        </div>
    );
}

export default function WalletPage() {
    return (
        <Suspense fallback={null}>
            <WalletPageContent />
        </Suspense>
    );
}
