"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, Loader2, LogOut, RefreshCw, Timer, X } from "lucide-react";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";
import type { ClientPortfolioInterface } from "@/interface/portfolio";
import { type ConversionResult, type WalletBalance, LOCK_SECONDS } from "@/interface/portfolioDetail";
import { fmtFull, fmtCrypto, fmtCountdown } from "@/utils/portfolioHelpers";

type PlanCharge = { particular: string; chargePercent: number };

function getPlanId(portfolio: ClientPortfolioInterface): string {
    return typeof portfolio.planId === "string" ? portfolio.planId : portfolio.planId._id;
}

export default function EarlyExitModal({
    portfolio,
    onClose,
    onSuccess,
}: {
    portfolio: ClientPortfolioInterface;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { user } = useAuthStore();
    const snap      = portfolio.planSnapshot;
    const principal = portfolio.summary.totalInvestedUsd;
    const penaltyPct = snap.exitPenaltyPercent ?? 0;

    // For maturity plans, compute accrued profit client-side for the preview.
    // The server recomputes authoritatively at submission time.
    const earnedPreview = (() => {
        if (snap.payoutType !== "maturity") return 0;
        const dailyRate   = (portfolio.amountUsd * (snap.roiMin ?? 0)) / 100 / 365;
        const start       = new Date(portfolio.startedAt);
        const now         = new Date();
        const elapsedDays = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
        return Math.min(dailyRate * elapsedDays, portfolio.summary.totalExpectedProfitUsd);
    })();

    const totalValuePreview = principal + earnedPreview;
    const penaltyPreview    = (totalValuePreview * penaltyPct) / 100;
    const netRefundPreview  = Math.max(0, totalValuePreview - penaltyPreview);

    const [charges, setCharges]               = useState<PlanCharge[]>([]);
    const [currencies, setCurrencies]         = useState<string[]>([]);
    const [currenciesLoading, setCurrenciesLoading] = useState(true);
    const [currency, setCurrency]             = useState("");
    const [balances, setBalances]             = useState<WalletBalance[]>([]);
    const [converting, setConverting]         = useState(false);
    const [conversionData, setConversionData] = useState<ConversionResult | null>(null);
    const [conversionError, setConversionError] = useState("");
    const [lockSecondsLeft, setLockSecondsLeft] = useState(0);
    const lockTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
    const lockFetchedAtRef = useRef<number>(0);
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState("");

    // Charges applied on post-penalty net
    const chargesBreakdown = charges.map(c => ({
        particular:    c.particular,
        chargePercent: c.chargePercent,
        chargeUsd:     (netRefundPreview * c.chargePercent) / 100,
    }));
    const totalChargesPreview = chargesBreakdown.reduce((s, c) => s + c.chargeUsd, 0);
    const netAfterCharges     = Math.max(0, netRefundPreview - totalChargesPreview);

    useEffect(() => {
        void fetchCharges();
        void fetchCurrencies();
        void fetchBalances();
        return () => { if (lockTimerRef.current) clearInterval(lockTimerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchCharges() {
        try {
            const planId = getPlanId(portfolio);
            const res = await appClient.get(`/api/plan-charges/${planId}`);
            const raw = res.data as { charges?: PlanCharge[] };
            setCharges(raw.charges ?? []);
        } catch { /* silent */ }
    }

    async function fetchCurrencies() {
        setCurrenciesLoading(true);
        try {
            const res = await appClient.get("/api/payment-methods");
            const raw = res.data as Record<string, unknown> | unknown[];
            const arr = Array.isArray(raw) ? raw
                : Array.isArray((raw as Record<string, unknown>).data) ? (raw as Record<string, unknown>).data as unknown[]
                    : Array.isArray((raw as Record<string, unknown>).paymentMethods) ? (raw as Record<string, unknown>).paymentMethods as unknown[]
                        : [];
            const seen = new Set<string>();
            const result: string[] = [];
            for (const m of arr as Array<Record<string, unknown>>) {
                const c = typeof m.currency === "string" ? m.currency.toUpperCase() : undefined;
                if (c && c !== "USD" && !seen.has(c)) { seen.add(c); result.push(c); }
            }
            setCurrencies(result);
        } catch { /* silent */ } finally {
            setCurrenciesLoading(false);
        }
    }

    async function fetchBalances() {
        if (!user?._id) return;
        try {
            const res = await appClient.get("/api/transactions/fund-balances", {
                params: { userId: user._id, userModel: "Client" },
            });
            const raw = res.data as Record<string, unknown>;
            const arr: WalletBalance[] = Array.isArray(raw) ? raw as unknown as WalletBalance[]
                : Array.isArray(raw.wallets) ? raw.wallets as WalletBalance[]
                    : Array.isArray(raw.data) ? raw.data as WalletBalance[]
                        : [];
            setBalances(arr.filter(b => typeof b.balance === "number"));
        } catch { /* silent */ }
    }

    function stopTimer() {
        if (lockTimerRef.current) { clearInterval(lockTimerRef.current); lockTimerRef.current = null; }
        setLockSecondsLeft(0);
    }

    function startLockTimer(onExpire: () => void) {
        stopTimer();
        lockFetchedAtRef.current = Date.now();
        setLockSecondsLeft(LOCK_SECONDS);
        lockTimerRef.current = setInterval(() => {
            const remaining = LOCK_SECONDS - Math.floor((Date.now() - lockFetchedAtRef.current) / 1000);
            if (remaining <= 0) { stopTimer(); onExpire(); }
            else setLockSecondsLeft(remaining);
        }, 1000);
    }

    async function fetchConversion(to: string) {
        setConverting(true); setConversionError(""); setConversionData(null); stopTimer();
        try {
            const res = await appClient.get(`/api/currency/convert?from=USD&to=${to}&amount=${netAfterCharges}`);
            setConversionData(res.data as ConversionResult);
            startLockTimer(() => {
                setConversionData(null);
                setConversionError("Rate expired. Refresh to get the latest rate.");
            });
        } catch {
            setConversionError("Failed to fetch rate. Please try again.");
        } finally {
            setConverting(false);
        }
    }

    async function handleSelectCurrency(c: string) {
        setCurrency(c);
        await fetchConversion(c);
    }

    async function handleExit() {
        if (!currency || !conversionData || lockSecondsLeft <= 0 || !confirmed) return;
        setSubmitting(true); setError("");
        try {
            await appClient.post(`/api/portfolio/${portfolio._id}/early-exit`, { paymentCurrency: currency });
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message ?? "Early exit failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const selectedBalance    = balances.find(b => b.currency === currency)?.balance ?? null;
    const balanceAfterRefund = selectedBalance !== null && conversionData
        ? selectedBalance + conversionData.convertedAmount : null;
    const rateExpired = !converting && !conversionData && conversionError.includes("expired");
    const canSubmit   = !!currency && !!conversionData && lockSecondsLeft > 0 && !converting && !submitting && confirmed;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl">

                {/* Header */}
                <div className="bg-[#0B1628] px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20">
                            <LogOut className="h-5 w-5 text-rose-400" />
                        </div>
                        <button onClick={onClose} className="text-[#ffffff]/40 hover:text-[#ffffff] transition">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <h3 className="mt-3 text-[17px] font-bold text-[#ffffff]">Early Exit</h3>
                    <p className="mt-0.5 text-[12px] text-[#ffffff]/50">
                        Exit before maturity. A penalty of <span className="font-bold text-rose-400">{penaltyPct}%</span> applies on your principal.
                    </p>

                    {/* Payout breakdown */}
                    <div className="mt-3 rounded-xl bg-white/5 border border-white/10 divide-y divide-white/10">
                        <div className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-[11.5px] text-[#ffffff]/50">Principal</span>
                            <span className="text-[12.5px] font-semibold text-[#ffffff]/80">{fmtFull(principal)} USD</span>
                        </div>
                        {earnedPreview > 0 && (
                            <div className="flex items-center justify-between px-4 py-2.5">
                                <span className="text-[11.5px] text-[#ffffff]/50">Accrued Profit</span>
                                <span className="text-[12.5px] font-semibold text-emerald-400">+ {fmtFull(earnedPreview)} USD</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-[11.5px] text-[#ffffff]/50">Exit Penalty ({penaltyPct}%)</span>
                            <span className="text-[12.5px] font-semibold text-rose-400">− {fmtFull(penaltyPreview)} USD</span>
                        </div>
                        {chargesBreakdown.map((ch, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5">
                                <span className="text-[11.5px] text-rose-400/80">{ch.particular} ({ch.chargePercent}%)</span>
                                <span className="text-[12.5px] font-semibold text-rose-400">− {fmtFull(ch.chargeUsd)} USD</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-[12px] font-bold text-[#ffffff]">You Receive</span>
                            <span className="text-[15px] font-bold text-[#ffffff]">{fmtFull(netAfterCharges)} USD</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Currency selector */}
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-2.5">Transfer to wallet</p>
                        {currenciesLoading ? (
                            <div className="flex gap-2">
                                {[1, 2, 3].map(i => <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-slate-100" />)}
                            </div>
                        ) : currencies.length === 0 ? (
                            <p className="text-[12.5px] text-slate-400">No wallets available.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {currencies.map(c => (
                                    <button key={c} onClick={() => void handleSelectCurrency(c)}
                                        className={`h-8 rounded-full px-4 text-[12.5px] font-bold transition
                                            ${currency === c
                                                ? "bg-[#0B2E84] text-[#ffffff] shadow-sm"
                                                : "border border-[#E2E8F0] text-[#0F172A]/60 hover:border-[#0B2E84]/40 hover:text-[#0B2E84]"
                                            }`}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {currency && (
                        <>
                            {/* Conversion box */}
                            <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
                                {converting ? (
                                    <div className="flex items-center gap-2.5 px-4 py-4 text-[12.5px] text-slate-500">
                                        <Loader2 className="h-4 w-4 animate-spin text-[#0B2E84]" />
                                        Fetching live rate…
                                    </div>
                                ) : rateExpired ? (
                                    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                                        <p className="text-[12.5px] text-rose-600">Rate expired.</p>
                                        <button onClick={() => void fetchConversion(currency)}
                                            className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-100">
                                            <RefreshCw className="h-3.5 w-3.5" /> Refresh Rate
                                        </button>
                                    </div>
                                ) : conversionError && !rateExpired ? (
                                    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                                        <p className="text-[12.5px] text-rose-600">{conversionError}</p>
                                        <button onClick={() => void fetchConversion(currency)}
                                            className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-100">
                                            <RefreshCw className="h-3.5 w-3.5" /> Retry
                                        </button>
                                    </div>
                                ) : conversionData ? (
                                    <div>
                                        <div className="divide-y divide-[#F1F5F9]">
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <span className="text-[12px] text-slate-500">Rate</span>
                                                <span className="font-mono text-[12px] font-semibold text-[#0F172A]">
                                                    1 USD = {fmtCrypto(conversionData.rate)} {currency}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <span className="text-[12px] text-slate-500">You receive</span>
                                                <span className="text-[13px] font-bold text-emerald-600">
                                                    {fmtCrypto(conversionData.convertedAmount)} {currency}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-4 py-2.5 text-[11.5px] font-semibold
                                            ${lockSecondsLeft <= 60 ? "bg-rose-50 text-rose-600"
                                                : lockSecondsLeft <= 120 ? "bg-amber-50 text-amber-600"
                                                    : "bg-[#F8FAFC] text-slate-500"}`}>
                                            <Timer className="h-3.5 w-3.5 shrink-0" />
                                            Rate locked for {fmtCountdown(lockSecondsLeft)}
                                            {lockSecondsLeft <= 60 && " — refresh soon"}
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Balance */}
                            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] divide-y divide-[#F1F5F9] overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 text-[12.5px]">
                                    <span className="text-slate-500">Current {currency} balance</span>
                                    <span className="font-bold text-[#0F172A]">
                                        {selectedBalance !== null ? `${fmtCrypto(selectedBalance)} ${currency}` : "—"}
                                    </span>
                                </div>
                                {balanceAfterRefund !== null && conversionData && (
                                    <div className="flex items-center justify-between px-4 py-3 text-[12.5px] bg-emerald-50">
                                        <span className="text-emerald-700">After exit</span>
                                        <span className="font-bold text-emerald-700">
                                            {fmtCrypto(balanceAfterRefund)} {currency}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Confirmation checkbox */}
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={e => setConfirmed(e.target.checked)}
                            className="mt-0.5 h-4 w-4 accent-amber-500 shrink-0"
                        />
                        <span className="text-[12px] text-amber-800 leading-relaxed">
                            I understand this is an early exit. A penalty of <strong>{penaltyPct}%</strong> will be deducted from my principal and this action cannot be undone.
                        </span>
                    </label>

                    {error && (
                        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-[12.5px] text-rose-700">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 border-t border-[#F1F5F9] px-6 py-4">
                    <button onClick={onClose} disabled={submitting}
                        className="flex-1 h-10 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] disabled:opacity-40 transition">
                        Cancel
                    </button>
                    <button onClick={() => void handleExit()} disabled={!canSubmit}
                        className="flex-1 h-10 rounded-xl bg-rose-600 text-[13px] font-bold text-[#ffffff] hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition">
                        {submitting
                            ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</>
                            : <><AlertTriangle className="h-4 w-4" />Confirm Exit</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
