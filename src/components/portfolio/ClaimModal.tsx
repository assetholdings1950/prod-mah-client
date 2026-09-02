"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Gift, Loader2, RefreshCw, Timer, X } from "lucide-react";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";
import type { ClientPortfolioInterface } from "@/interface/portfolio";
import { type ConversionResult, type WalletBalance, LOCK_SECONDS } from "@/interface/portfolioDetail";
import { fmtFull, fmtCrypto, fmtCountdown } from "@/utils/portfolioHelpers";

type PlanCharge = { particular: string; chargePercent: number };

function getPlanId(portfolio: ClientPortfolioInterface): string {
    return typeof portfolio.planId === "string" ? portfolio.planId : portfolio.planId._id;
}

export default function ClaimModal({
    portfolio,
    onClose,
    onSuccess,
}: {
    portfolio: ClientPortfolioInterface;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { user } = useAuthStore();
    const grossUsd  = portfolio.summary.currentValueUsd;
    const principal = portfolio.summary.totalInvestedUsd;
    const profit    = portfolio.summary.totalExpectedProfitUsd;

    const [charges, setCharges]       = useState<PlanCharge[]>([]);
    const [currencies, setCurrencies] = useState<string[]>([]);
    const [currenciesLoading, setCurrenciesLoading] = useState(true);
    const [currency, setCurrency] = useState("");
    const [balances, setBalances] = useState<WalletBalance[]>([]);
    const [converting, setConverting] = useState(false);
    const [conversionData, setConversionData] = useState<ConversionResult | null>(null);
    const [conversionError, setConversionError] = useState("");
    const [lockSecondsLeft, setLockSecondsLeft] = useState(0);
    const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lockFetchedAtRef = useRef<number>(0);
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState("");

    // Compute charges on gross payout
    const chargesBreakdown = charges.map(c => ({
        particular:    c.particular,
        chargePercent: c.chargePercent,
        chargeUsd:     (grossUsd * c.chargePercent) / 100,
    }));
    const totalChargesUsd = chargesBreakdown.reduce((s, c) => s + c.chargeUsd, 0);
    const netPayoutUsd    = Math.max(0, grossUsd - totalChargesUsd);

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
            const res = await appClient.get(`/api/currency/convert?from=USD&to=${to}&amount=${netPayoutUsd}`);
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

    async function handleClaim() {
        if (!currency || !conversionData || lockSecondsLeft <= 0) return;
        setClaiming(true); setError("");
        try {
            await appClient.post(`/api/portfolio/${portfolio._id}/claim`, { paymentCurrency: currency });
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string; error?: string } } };
            setError(e.response?.data?.message ?? e.response?.data?.error ?? "Claim failed. Please try again.");
        } finally {
            setClaiming(false);
        }
    }

    const selectedBalance   = balances.find(b => b.currency === currency)?.balance ?? null;
    const balanceAfterClaim = selectedBalance !== null && conversionData
        ? selectedBalance + conversionData.convertedAmount : null;
    const rateExpired = !converting && !conversionData && conversionError.includes("expired");
    const canClaim = !!currency && !!conversionData && lockSecondsLeft > 0 && !converting && !claiming;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl">

                <div className="bg-[#0B1628] px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2E84]/40">
                            <Gift className="h-5 w-5 text-[#ffffff]" />
                        </div>
                        <button onClick={onClose} className="text-[#ffffff]/40 hover:text-[#ffffff] transition">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <h3 className="mt-3 text-[17px] font-bold text-[#ffffff]">Claim Maturity Payout</h3>
                    <div className="mt-3 rounded-xl bg-white/5 border border-white/10 divide-y divide-white/10">
                        <div className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-[11.5px] text-[#ffffff]/50">Principal</span>
                            <span className="text-[12.5px] font-semibold text-[#ffffff]/80">{fmtFull(principal)} USD</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-[11.5px] text-[#ffffff]/50">Total Profit</span>
                            <span className="text-[12.5px] font-semibold text-emerald-400">+ {fmtFull(profit)} USD</span>
                        </div>
                        {chargesBreakdown.map((ch, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5">
                                <span className="text-[11.5px] text-rose-400/80">{ch.particular} ({ch.chargePercent}%)</span>
                                <span className="text-[12.5px] font-semibold text-rose-400">− {fmtFull(ch.chargeUsd)} USD</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-[12px] font-bold text-[#ffffff]">You Receive</span>
                            <span className="text-[15px] font-bold text-[#ffffff]">{fmtFull(netPayoutUsd)} USD</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-5">
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

                            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] divide-y divide-[#F1F5F9] overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 text-[12.5px]">
                                    <span className="text-slate-500">Current {currency} balance</span>
                                    <span className="font-bold text-[#0F172A]">
                                        {selectedBalance !== null ? `${fmtCrypto(selectedBalance)} ${currency}` : "—"}
                                    </span>
                                </div>
                                {balanceAfterClaim !== null && conversionData && (
                                    <div className="flex items-center justify-between px-4 py-3 text-[12.5px] bg-emerald-50">
                                        <span className="text-emerald-700">After claim</span>
                                        <span className="font-bold text-emerald-700">
                                            {fmtCrypto(balanceAfterClaim)} {currency}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-[12.5px] text-rose-700">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 border-t border-[#F1F5F9] px-6 py-4">
                    <button onClick={onClose} disabled={claiming}
                        className="flex-1 h-10 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] disabled:opacity-40 transition">
                        Cancel
                    </button>
                    <button onClick={() => void handleClaim()} disabled={!canClaim}
                        className="flex-1 h-10 rounded-xl bg-emerald-600 text-[13px] font-bold text-[#ffffff] hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition">
                        {claiming
                            ? <><Loader2 className="h-4 w-4 animate-spin" />Claiming…</>
                            : <><Gift className="h-4 w-4" />Claim Payout</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
