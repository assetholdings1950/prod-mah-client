"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AlertCircle, ArrowLeft, Check, CheckCircle2,
    Headphones, Info, Loader2, Mail, Phone, RefreshCw, ShieldCheck, Timer, X,
} from "lucide-react";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";
import type { InvestmentPlanInterface } from "@/interface/investmentPlan";
import {
    LOCK_SECONDS, type ConversionResult,
    fmt, fmtCountdown, fmtCrypto, fmtROI, toNum,
} from "./planDetailConfig";

export default function InvestmentPanel({ plan }: { plan: InvestmentPlanInterface }) {
    const user = useAuthStore((state) => state.user);
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id") ?? undefined;

    const urlStep = (searchParams.get("step") ?? "form") as "form" | "currency" | "success";
    const urlCurrency = searchParams.get("currency") ?? "";
    const urlAmount = searchParams.get("amount") ?? "";

    const [amountStr, setAmountStr] = useState(urlAmount || String(toNum(plan.minAmount, 10000)));
    const amount = Number(amountStr) || 0;
    const [step, setStep] = useState<"form" | "currency" | "success">(urlStep);
    const [currency, setCurrency] = useState(urlCurrency);
    const [showBackWarning, setShowBackWarning] = useState(false);
    const [selectedLockIn, setSelectedLockIn] = useState<number | null>(toNum(plan.durationMinMonths, 12));

    const [pmCurrencies, setPmCurrencies] = useState<string[]>([]);
    const [pmCurrenciesLoading, setPmCurrenciesLoading] = useState(false);

    const [converting, setConverting] = useState(false);
    const [conversionData, setConversionData] = useState<ConversionResult | null>(null);
    const [conversionError, setConversionError] = useState("");
    const [lockSecondsLeft, setLockSecondsLeft] = useState(0);
    const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lockFetchedAtRef = useRef<number>(0);

    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [createdPortfolioId, setCreatedPortfolioId] = useState<string | null>(null);
    const [sipConsent, setSipConsent] = useState(false);
    const [eligibilityLoading, setEligibilityLoading] = useState(true);
    const [kycStatus, setKycStatus] = useState<string | null>(null);
    const [accountManager, setAccountManager] = useState<{
        _id: string; agentId: string; fullName?: string | null; firstName?: string; lastName?: string;
        email?: string; phoneNumber?: string | null; profileImage?: string | null; status?: string; kycStatus?: string;
    } | null>(null);

    // ── Derived ───────────────────────────────────────────────────────────────
    const isMonthly = plan.category === "monthly";
    const isCrypto = plan.category === "crypto";
    const minAmt = toNum(plan.minAmount);
    const maxAmt = toNum(plan.maxAmount);
    const hasMin = !isCrypto && Number.isFinite(minAmt);
    const hasMax = !isCrypto && Number.isFinite(maxAmt);
    const amountTooLow = hasMin && amount < minAmt;
    const amountTooHigh = hasMax && amount > maxAmt;
    const lockMin = toNum(plan.durationMinMonths, 12);
    const lockMax = toNum(plan.durationMaxMonths, lockMin);
    const effectiveLockIn = selectedLockIn ?? lockMin;
    const lockTooLow = plan.category === "lumpsum" && effectiveLockIn < lockMin;
    const managerAvailable = !!accountManager && accountManager.status === "active" && accountManager.kycStatus === "approved";
    const investmentEligible = kycStatus === "approved" && managerAvailable;
    const canProceed = investmentEligible && !eligibilityLoading && !amountTooLow && !amountTooHigh && amount > 0 && !lockTooLow && (!isMonthly || sipConsent);
    const roiMin = toNum(plan.roiMin, 0);
    const projectedReturn = (amount * roiMin / 100) * (effectiveLockIn / 12);
    const rateExpired = !converting && !conversionData && conversionError.includes("expired");
    const canConfirm = investmentEligible && !eligibilityLoading && !converting && !creating && !rateExpired && !!conversionData && lockSecondsLeft > 0;

    useEffect(() => {
        if (!user?._id) {
            setEligibilityLoading(false);
            return;
        }
        let cancelled = false;
        const loadEligibility = async () => {
            try {
                const response = await appClient.get(`/api/clients/${user._id}`);
                const client = response.data?.data ?? response.data?.client ?? response.data;
                if (!cancelled) {
                    setKycStatus(client?.kycStatus ?? null);
                    setAccountManager(client?.accountManager ?? null);
                }
            } catch {
                if (!cancelled) {
                    setKycStatus(null);
                    setAccountManager(null);
                }
            } finally {
                if (!cancelled) setEligibilityLoading(false);
            }
        };
        void loadEligibility();
        return () => { cancelled = true; };
    }, [user?._id]);

    // ── URL sync ──────────────────────────────────────────────────────────────
    const syncUrl = useCallback((
        nextStep: "form" | "currency" | "success",
        nextCurrency: string,
        nextAmount: string,
    ) => {
        const params = new URLSearchParams();
        if (id) params.set("id", id);
        if (nextStep !== "form") params.set("step", nextStep);
        if (nextCurrency) params.set("currency", nextCurrency);
        params.set("amount", nextAmount);
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [id, router]);

    // ── Fetchers ──────────────────────────────────────────────────────────────
    const fetchPmCurrencies = useCallback(async () => {
        setPmCurrenciesLoading(true);
        try {
            const res = await appClient.get("/api/payment-methods");
            const raw = res.data as Record<string, unknown> | unknown[];
            const arr = Array.isArray(raw) ? raw
                : Array.isArray((raw as Record<string, unknown>).data) ? (raw as Record<string, unknown>).data
                    : Array.isArray((raw as Record<string, unknown>).paymentMethods) ? (raw as Record<string, unknown>).paymentMethods
                        : [];
            const seen = new Set<string>();
            const unique: string[] = [];
            for (const m of arr as Array<Record<string, unknown>>) {
                const c = typeof m.currency === "string" ? m.currency.toUpperCase() : undefined;
                if (c && c !== "USD" && !seen.has(c)) { seen.add(c); unique.push(c); }
            }
            setPmCurrencies(unique);
        } catch { /* silent */ } finally {
            setPmCurrenciesLoading(false);
        }
    }, []);

    // ── Timer helpers ─────────────────────────────────────────────────────────
    function stopTimer() {
        if (lockTimerRef.current) { clearInterval(lockTimerRef.current); lockTimerRef.current = null; }
        setLockSecondsLeft(0);
    }

    function startLockTimer(onExpire: () => void) {
        stopTimer();
        lockFetchedAtRef.current = Date.now();
        setLockSecondsLeft(LOCK_SECONDS);
        lockTimerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - lockFetchedAtRef.current) / 1000);
            const remaining = LOCK_SECONDS - elapsed;
            if (remaining <= 0) { stopTimer(); onExpire(); }
            else { setLockSecondsLeft(remaining); }
        }, 1000);
    }

    async function fetchConversion(to: string) {
        setConverting(true);
        setConversionError("");
        setConversionData(null);
        stopTimer();
        try {
            const res = await appClient.get(`/api/currency/convert?from=USD&to=${to}&amount=${amount}`);
            const data = res.data as ConversionResult;
            setConversionData(data);
            startLockTimer(() => {
                setConversionData(null);
                setConversionError("Rate expired. Please refresh to get the latest rate.");
            });
        } catch {
            setConversionError("Failed to fetch conversion rate. Please try again.");
        } finally {
            setConverting(false);
        }
    }

    useEffect(() => {
        if (urlStep === "currency" && urlCurrency) {
            void fetchPmCurrencies();
            void fetchConversion(urlCurrency);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => { if (lockTimerRef.current) clearInterval(lockTimerRef.current); };
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    async function handleCurrencySelect(c: string) {
        if (!investmentEligible) return;
        setCurrency(c);
        syncUrl("currency", c, amountStr);
        await fetchConversion(c);
    }

    function handleProceed() {
        if (!investmentEligible) return;
        void fetchPmCurrencies();
        setCurrency("");
        setConversionData(null);
        setConversionError("");
        stopTimer();
        setStep("currency");
        syncUrl("currency", "", amountStr);
    }

    function handleBackToForm() {
        stopTimer();
        setConversionData(null);
        setConversionError("");
        setCurrency("");
        setStep("form");
        syncUrl("form", "", amountStr);
    }

    async function handleConfirmInvestment() {
        if (!investmentEligible || !conversionData || creating) return;
        setCreating(true);
        setCreateError("");
        const durationMonths = plan.category === "lumpsum"
            ? (selectedLockIn ?? toNum(plan.durationMinMonths, 12))
            : toNum(plan.durationMinMonths, 12);
        try {
            const res = await appClient.post("/api/portfolio/create", {
                planId: plan._id,
                amountUsd: amount,
                paymentCurrency: currency,
                durationMonths,
                cryptoAmount: conversionData.convertedAmount,
                rate: conversionData.rate,
                source: conversionData.source,
                lockedAt: new Date(lockFetchedAtRef.current).toISOString(),
                lockedUntil: new Date(lockFetchedAtRef.current + LOCK_SECONDS * 1000).toISOString(),
                convertedAt: conversionData.lastUpdated,
            });
            const data = res.data as { data?: { portfolioId?: string }; portfolio?: { portfolioId?: string }; portfolioId?: string };
            const pid = data?.data?.portfolioId ?? data?.portfolio?.portfolioId ?? data?.portfolioId ?? null;
            setCreatedPortfolioId(pid);
            stopTimer();
            setStep("success");
            syncUrl("success", currency, amountStr);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string; error?: string } } };
            const msg = e.response?.data?.message ?? e.response?.data?.error ?? "Failed to create investment. Please try again.";
            setCreateError(msg);
        } finally {
            setCreating(false);
        }
    }

    return (
        <>
            <aside className="lg:sticky lg:top-6 lg:self-start">
                <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_8px_40px_rgba(15,23,42,0.08)] overflow-hidden">

                    {/* Panel header */}
                    <div className="border-b border-[#F1F5F9] bg-[#0B2E84] px-6 py-5">
                        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/50">
                            {step === "form" ? "Start Your Investment" : step === "currency" ? "Choose Payment Currency" : "Investment Confirmed"}
                        </p>
                        <h2 className="mt-1 text-[19px] font-bold text-white">{plan.name}</h2>
                        <p className="mt-1 text-[12px] text-white/60">{fmtROI(plan)} expected return p.a.</p>
                    </div>

                    <div className="p-6">

                        {eligibilityLoading ? (
                            <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <Loader2 className="h-5 w-5 animate-spin text-[#0B2E84]" />
                                <p className="text-[12px] font-semibold text-slate-500">Checking investment eligibility…</p>
                            </div>
                        ) : managerAvailable && accountManager ? (
                            <div className="mb-5 rounded-xl border border-[#C7D7FF] bg-[#F5F8FF] p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B2E84] text-white">
                                        {accountManager.profileImage ? <img src={accountManager.profileImage} alt="" className="h-full w-full object-cover" /> : <Headphones className="h-5 w-5" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0B2E84]/60">Your Account Manager</p>
                                        <p className="mt-0.5 truncate text-[13px] font-bold text-[#0B2E84]">{accountManager.fullName || `${accountManager.firstName || ""} ${accountManager.lastName || ""}`.trim()}</p>
                                        <p className="mt-1 text-[11px] leading-4 text-[#0B2E84]/65">Contact your manager for plan guidance or help with your investment.</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {accountManager.email && <a href={`mailto:${accountManager.email}`} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-[#0B2E84] shadow-sm"><Mail className="h-3 w-3" /> Email</a>}
                                            {accountManager.phoneNumber && <a href={`tel:${accountManager.phoneNumber}`} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-[#0B2E84] shadow-sm"><Phone className="h-3 w-3" /> Call</a>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="text-[12px] font-bold text-amber-900">{kycStatus !== "approved" ? "KYC approval required" : accountManager ? "Account Manager unavailable" : "Account Manager assignment pending"}</p><p className="mt-1 text-[11.5px] leading-5 text-amber-800">{kycStatus !== "approved" ? "Your KYC must be approved before an Account Manager can be assigned and investing is enabled." : accountManager ? "Your assigned manager is currently unavailable. Please contact support so an eligible manager can be assigned." : "An administrator must assign your Account Manager before you can invest. Please contact support if you need assistance."}</p></div></div>
                            </div>
                        )}

                        {/* ═══ Step: form ═══ */}
                        {step === "form" && (
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                                        {isMonthly ? "Monthly Contribution (USD)" : "Investment Amount (USD)"}
                                    </label>
                                    <div className="flex h-12 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 focus-within:border-[#0B2E84] focus-within:ring-2 focus-within:ring-[#0B2E84]/10">
                                        <span className="text-[13px] font-bold text-slate-400">$</span>
                                        <input
                                            type="number"
                                            value={amountStr}
                                            {...(hasMin ? { min: minAmt } : {})}
                                            {...(hasMax ? { max: maxAmt } : {})}
                                            onChange={e => setAmountStr(e.target.value)}
                                            className="w-full bg-transparent text-[15px] font-bold text-[#0F172A] outline-none"
                                        />
                                        <span className="text-[12px] font-semibold text-slate-300">USD</span>
                                    </div>
                                    <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
                                        {(amountTooLow || amountTooHigh) ? (
                                            <p className="flex items-center gap-1 text-rose-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {amountTooLow ? `Minimum is ${fmt(plan.minAmount)}` : `Maximum is ${fmt(plan.maxAmount)}`}
                                            </p>
                                        ) : <span />}
                                        <span className="text-slate-400">
                                            {hasMin && hasMax ? `${fmt(plan.minAmount)} – ${fmt(plan.maxAmount)}`
                                                : hasMin ? `Min ${fmt(plan.minAmount)}`
                                                    : hasMax ? `Max ${fmt(plan.maxAmount)}`
                                                        : null}
                                        </span>
                                    </div>
                                </div>

                                {plan.category === "lumpsum" && (
                                    <div>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Lock-in Period</label>
                                            <span className="text-[13px] font-bold text-[#0B2E84]">
                                                {effectiveLockIn} <span className="font-semibold text-slate-400">months</span>
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min={lockMin}
                                            max={lockMax}
                                            step={12}
                                            value={effectiveLockIn}
                                            onChange={e => setSelectedLockIn(Number(e.target.value))}
                                            className="w-full accent-[#0B2E84]"
                                        />
                                        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                                            <span>{lockMin} mo</span>
                                            <span>{lockMax} mo</span>
                                        </div>
                                        {lockTooLow && (
                                            <p className="mt-1 flex items-center gap-1 text-[11.5px] text-rose-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                Minimum lock-in is {lockMin} months
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="rounded-xl bg-[#EFF4FF] px-4 py-3.5">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0B2E84]/70">Projected Return</p>
                                    <p className="mt-1.5 text-[20px] font-bold text-[#0B2E84]">
                                        +{Number.isFinite(projectedReturn) ? projectedReturn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : "N/A"}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-[#0B2E84]/55">
                                        Based on {fmtROI(plan)} p.a. over {effectiveLockIn} months
                                    </p>
                                </div>

                                {/* SIP auto-debit consent — only for monthly/SIP plans */}
                                {isMonthly && (
                                    <div className="rounded-xl border border-[#C7D7FF] bg-[#EEF2FF] p-4">
                                        <div className="flex items-start gap-2.5">
                                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0B2E84]" />
                                            <div className="flex-1">
                                                <p className="text-[12px] font-bold text-[#0B2E84]">SIP Auto-Debit</p>
                                                <p className="mt-1.5 text-[11.5px] leading-5 text-[#0B2E84]/70">
                                                    On the same date every month,{" "}
                                                    <strong className="text-[#0B2E84]">
                                                        ${amount > 0 ? amount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "—"} USD
                                                    </strong>{" "}
                                                    equivalent in crypto will be automatically debited from your payment wallet for{" "}
                                                    <strong className="text-[#0B2E84]">{effectiveLockIn} installments</strong>.
                                                    If your primary wallet has insufficient funds, we'll check your other crypto wallets.
                                                </p>
                                                <label className="mt-3 flex cursor-pointer items-start gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={sipConsent}
                                                        onChange={e => setSipConsent(e.target.checked)}
                                                        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#0B2E84]"
                                                    />
                                                    <span className="text-[11.5px] font-semibold leading-5 text-[#0B2E84]">
                                                        I understand and consent to automatic monthly deductions from my wallet
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button onClick={handleProceed} disabled={!canProceed}
                                    className="w-full h-12 rounded-xl bg-[#0B2E84] text-[14px] font-bold text-white transition hover:bg-[#082461] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    Proceed to Invest
                                </button>

                                <div className="flex gap-3 border-t border-[#F1F5F9] pt-5">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0B2E84]" />
                                    <p className="text-[11.5px] leading-5 text-slate-500">
                                        <span className="block font-bold text-[#0F172A]">Secure & Reviewed</span>
                                        Every investment request is reviewed by our advisory team before processing.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ═══ Step: currency ═══ */}
                        {step === "currency" && (
                            <div className="space-y-5">
                                <div className="rounded-xl bg-[#F8FAFC] px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">Investing</p>
                                        <p className="mt-0.5 text-[22px] font-bold text-[#0F172A]">
                                            {amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            <span className="ml-1.5 text-[13px] font-semibold text-slate-400">USD</span>
                                        </p>
                                    </div>
                                    <button onClick={handleBackToForm}
                                        className="text-[12px] font-semibold text-[#0B2E84] hover:underline flex items-center gap-1">
                                        <X className="h-3 w-3" />Edit
                                    </button>
                                </div>

                                <div>
                                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Pay with</p>
                                    {pmCurrenciesLoading ? (
                                        <div className="flex items-center gap-2 text-[12px] text-slate-400">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />Loading currencies…
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {pmCurrencies.map(c => (
                                                <button key={c}
                                                    onClick={() => void handleCurrencySelect(c)}
                                                    className={`rounded-lg border px-3.5 py-1.5 text-[12px] font-bold transition ${currency === c
                                                        ? "border-[#0B2E84] bg-[#0B2E84] text-white"
                                                        : "border-[#E2E8F0] text-[#0F172A]/60 hover:border-[#0B2E84]/40 hover:text-[#0B2E84]"
                                                        }`}>
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {currency && (
                                    <div>
                                        {converting && (
                                            <div className="flex items-center justify-center gap-2.5 rounded-xl border border-[#E2E8F0] py-6 text-[13px] text-slate-400">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Fetching live rate…
                                            </div>
                                        )}

                                        {!converting && conversionData && lockSecondsLeft > 0 && (
                                            <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
                                                <div className={`flex items-center justify-between px-4 py-2 ${lockSecondsLeft <= 60 ? "bg-amber-50" : "bg-[#F8FAFC]"}`}>
                                                    <div className="flex items-center gap-1.5">
                                                        <Timer className={`h-3.5 w-3.5 ${lockSecondsLeft <= 60 ? "text-amber-500" : "text-[#0B2E84]"}`} />
                                                        <span className={`text-[11px] font-bold uppercase tracking-[0.08em] ${lockSecondsLeft <= 60 ? "text-amber-600" : "text-[#0B2E84]"}`}>
                                                            Rate locked
                                                        </span>
                                                    </div>
                                                    <span className={`font-mono text-[13px] font-bold ${lockSecondsLeft <= 60 ? "text-amber-600" : "text-[#0B2E84]"}`}>
                                                        {fmtCountdown(lockSecondsLeft)}
                                                    </span>
                                                </div>
                                                <div className="divide-y divide-[#F1F5F9] px-4">
                                                    <div className="flex items-center justify-between py-3 text-[13px]">
                                                        <span className="text-slate-500">Exchange rate</span>
                                                        <span className="font-mono font-semibold text-[#0F172A]">
                                                            1 USD = {fmtCrypto(conversionData.rate, 8)} {currency}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-4">
                                                        <span className="text-[13px] text-slate-500">You will pay</span>
                                                        <div className="text-right">
                                                            <p className="text-[20px] font-bold text-[#0B2E84]">
                                                                {fmtCrypto(conversionData.convertedAmount, 8)}
                                                            </p>
                                                            <p className="text-[11px] font-semibold text-slate-400">{currency}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!converting && lockSecondsLeft === 0 && (
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                                                    <p className="text-[13px] font-semibold text-amber-700">Rate expired</p>
                                                </div>
                                                <p className="mt-1 pl-6 text-[12px] text-amber-600">
                                                    The locked rate has expired. Refresh to get the latest rate.
                                                </p>
                                                <button onClick={() => void fetchConversion(currency)}
                                                    className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-amber-600">
                                                    <RefreshCw className="h-3 w-3" />Refresh Rate
                                                </button>
                                            </div>
                                        )}

                                        {!converting && conversionError && !conversionError.includes("expired") && (
                                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                                                <p className="text-[12.5px] text-rose-700 font-medium">{conversionError}</p>
                                                <button onClick={() => void fetchConversion(currency)}
                                                    className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-rose-600 hover:underline">
                                                    <RefreshCw className="h-3 w-3" />Try again
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {[
                                        "I have read and agree to the terms & conditions.",
                                        "I understand this investment carries risk.",
                                        "I confirm the details above are correct.",
                                    ].map(item => (
                                        <div key={item} className="flex gap-2.5">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                            <p className="text-[12px] leading-5 text-slate-500">{item}</p>
                                        </div>
                                    ))}
                                </div>

                                {createError && (
                                    <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-[12.5px] text-rose-700">
                                        {createError}
                                    </div>
                                )}

                                <button onClick={() => void handleConfirmInvestment()} disabled={!canConfirm}
                                    className="w-full h-12 rounded-xl bg-[#0B2E84] text-[14px] font-bold text-white transition hover:bg-[#082461] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {converting
                                        ? <><Loader2 className="h-4 w-4 animate-spin" />Getting Rate…</>
                                        : creating
                                            ? <><Loader2 className="h-4 w-4 animate-spin" />Creating…</>
                                            : "Confirm Investment"
                                    }
                                </button>

                                <button onClick={() => setShowBackWarning(true)}
                                    className="w-full h-10 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-[#0F172A]/60 hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5">
                                    <ArrowLeft className="h-3.5 w-3.5" />Back
                                </button>
                            </div>
                        )}

                        {/* ═══ Step: success ═══ */}
                        {step === "success" && (
                            <div className="flex flex-col items-center py-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
                                    <Check className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h3 className="mt-5 text-[18px] font-bold text-[#0F172A]">Investment Created!</h3>
                                <p className="mt-2 text-[13px] leading-6 text-slate-500">
                                    Your portfolio has been created. Our team will review and activate it within 1–2 business days.
                                </p>

                                <div className="mt-5 w-full rounded-xl bg-[#F8FAFC] p-4 text-left space-y-2.5">
                                    {createdPortfolioId && (
                                        <div className="flex justify-between text-[12.5px]">
                                            <span className="text-slate-500">Portfolio ID</span>
                                            <span className="font-mono font-semibold text-[#0B2E84]">{createdPortfolioId}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[12.5px]">
                                        <span className="text-slate-500">Plan</span>
                                        <span className="font-semibold text-[#0F172A] text-right max-w-[55%]">{plan.name}</span>
                                    </div>
                                    <div className="flex justify-between text-[12.5px]">
                                        <span className="text-slate-500">Amount (USD)</span>
                                        <span className="font-bold text-[#0B2E84]">${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    {conversionData && (
                                        <>
                                            <div className="flex justify-between text-[12.5px]">
                                                <span className="text-slate-500">Currency</span>
                                                <span className="font-bold text-[#0F172A]">{currency}</span>
                                            </div>
                                            <div className="flex justify-between text-[12.5px]">
                                                <span className="text-slate-500">You paid</span>
                                                <span className="font-bold text-[#0B2E84]">
                                                    {fmtCrypto(conversionData.convertedAmount, 8)} {currency}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-[12.5px]">
                                                <span className="text-slate-500">Rate used</span>
                                                <span className="font-mono text-[11.5px] text-slate-600">
                                                    1 USD = {fmtCrypto(conversionData.rate, 8)} {currency}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="mt-6 flex w-full gap-3">
                                    <Link href="/portfolio"
                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2E84] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#082461]">
                                        View My Portfolio
                                    </Link>
                                    <Link href="/investments"
                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] px-5 py-2.5 text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC]">
                                        Browse Plans
                                    </Link>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </aside>

            {/* Back-warning modal */}
            {showBackWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl">
                        <div className="bg-[#0B1628] px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15">
                                <AlertCircle className="h-5 w-5 text-amber-400" />
                            </div>
                            <h3 className="mt-3 text-[17px] font-bold text-white">Discard this selection?</h3>
                            <p className="mt-1 text-[12.5px] leading-5 text-white/70">
                                Going back will clear your selected currency and the locked conversion rate.
                            </p>
                        </div>
                        <div className="flex gap-3 px-6 py-5">
                            <button
                                onClick={() => setShowBackWarning(false)}
                                className="flex-1 h-10 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-[#0F172A]/70 transition-colors hover:bg-[#F8FAFC]">
                                Stay
                            </button>
                            <button
                                onClick={() => { setShowBackWarning(false); handleBackToForm(); }}
                                className="flex-1 h-10 rounded-xl bg-rose-600 text-[13px] font-bold text-white transition-colors hover:bg-rose-700">
                                Yes, go back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
