"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, Check, ChevronLeft, Download, FileText, Loader2, ShieldAlert, WalletCards } from "lucide-react";
import appClient from "@/lib/appClient";
import type { BondInterface } from "@/interface/bond";

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const titleCase = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const term = (months: number) => months % 12 === 0 ? `${months / 12} year${months === 12 ? "" : "s"}` : `${months} months`;

// Bond copy is authored by administrators. Remove executable markup before rendering
// the allowed formatting that is useful to investors (paragraphs, lists, links, etc.).
const safeRichText = (html?: string) => String(html || "")
    .replace(/<\/?(?:script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "");

export default function BondDetail({ identifier }: { identifier: string }) {
    const [bond, setBond] = useState<BondInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [amount, setAmount] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [notice, setNotice] = useState("");
    const [downloading, setDownloading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "benefits" | "documents">("overview");
    const [investmentStep, setInvestmentStep] = useState<"form" | "payment" | "success">("form");
    const [paymentCurrencies, setPaymentCurrencies] = useState<string[]>([]);
    const [paymentCurrency, setPaymentCurrency] = useState("");
    const [conversion, setConversion] = useState<{ convertedAmount: number; rate: number; source?: string; lastUpdated?: string } | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [investing, setInvesting] = useState(false);
    const [investmentError, setInvestmentError] = useState("");
    const [createdInvestmentId, setCreatedInvestmentId] = useState("");

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const response = await appClient.get(`/api/bonds/${encodeURIComponent(identifier)}`);
                if (cancelled) return;
                const data = response.data.bond as BondInterface;
                setBond(data); setAmount(String(data.minInvestment));
            } catch (err: unknown) {
                if (!cancelled) setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Bond not found or no longer available.");
            } finally { if (!cancelled) setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [identifier]);

    const parsedAmount = Number(amount);
    const amountValid = !!bond && Number.isFinite(parsedAmount) && parsedAmount >= bond.minInvestment && (!bond.maxInvestment || parsedAmount <= bond.maxInvestment);
    const estimatedCoupon = useMemo(() => amountValid && bond ? parsedAmount * bond.couponRateAnnual / 100 : 0, [amountValid, bond, parsedAmount]);

    const download = async (documentType: "offering-document" | "term-sheet") => {
        if (!bond) return;
        setDownloading(documentType); setNotice("");
        try {
            const response = await fetch(`/api/bonds/${bond._id}/documents/${documentType}`);
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message || "The document could not be downloaded.");
            }
            const disposition = response.headers.get("content-disposition") || "";
            const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || `${bond.code}-${documentType}.pdf`;
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
        } catch (err) { setNotice(err instanceof Error ? err.message : "The document could not be downloaded."); }
        finally { setDownloading(null); }
    };

    const beginPayment = async () => {
        if (!amountValid || !accepted) return;
        setInvestmentError(""); setPaymentLoading(true);
        try {
            const response = await appClient.get("/api/payment-methods");
            const raw = response.data as { data?: unknown[]; paymentMethods?: unknown[] } | unknown[];
            const items = Array.isArray(raw) ? raw : raw.data || raw.paymentMethods || [];
            const currencies = [...new Set(items.map((item) => String((item as { currency?: string }).currency || "").toUpperCase()).filter((currency) => ["BTC", "ETH", "USDT", "SOL", "TRX"].includes(currency)))];
            if (!currencies.length) throw new Error("Add a supported payment wallet before investing.");
            setPaymentCurrencies(currencies); setPaymentCurrency(""); setConversion(null); setInvestmentStep("payment");
        } catch (err) { setInvestmentError(err instanceof Error ? err.message : "Could not load payment options."); }
        finally { setPaymentLoading(false); }
    };

    const chooseCurrency = async (currency: string) => {
        setPaymentCurrency(currency); setConversion(null); setInvestmentError(""); setPaymentLoading(true);
        try {
            const response = await appClient.get(`/api/currency/convert?from=USD&to=${currency}&amount=${parsedAmount}`);
            setConversion(response.data);
        } catch { setInvestmentError("Could not get a current conversion rate. Please try again."); }
        finally { setPaymentLoading(false); }
    };

    const createInvestment = async () => {
        if (!bond || !conversion || investing) return;
        setInvesting(true); setInvestmentError("");
        const lockedAt = new Date(); const lockedUntil = new Date(lockedAt.getTime() + 10 * 60 * 1000);
        try {
            const response = await appClient.post(`/api/bonds/${bond._id}/invest`, { amountUsd: parsedAmount, paymentCurrency, cryptoAmount: conversion.convertedAmount, rate: conversion.rate, source: conversion.source || "coingecko", lockedAt: lockedAt.toISOString(), lockedUntil: lockedUntil.toISOString(), convertedAt: conversion.lastUpdated || lockedAt.toISOString() });
            setCreatedInvestmentId(response.data?.data?.investmentId || ""); setInvestmentStep("success");
        } catch (err: unknown) { setInvestmentError((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Could not complete this Bond investment."); }
        finally { setInvesting(false); }
    };

    if (loading) return <div className="mx-auto max-w-6xl space-y-5"><div className="h-6 w-32 animate-pulse rounded bg-slate-200" /><div className="h-20 animate-pulse rounded-2xl bg-slate-200" /><div className="h-96 animate-pulse rounded-2xl bg-slate-200" /></div>;
    if (!bond) return <div className="mx-auto max-w-3xl rounded-2xl border border-rose-100 bg-white p-10 text-center"><ShieldAlert className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-4 text-xl font-semibold text-[#08204a]">Bond unavailable</h1><p className="mt-2 text-slate-500">{error}</p><Link href="/bonds" className="mt-6 inline-flex font-semibold text-[#0b3d91]">Back to bonds</Link></div>;

    return <div className="mx-auto w-full max-w-6xl pb-12">
        <Link href="/bonds" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0b3d91] hover:underline"><ArrowLeft className="h-4 w-4" /> Explore Bonds</Link>
        <header className="border-b border-slate-200 pb-7"><div className="flex flex-wrap items-center gap-3"><h1 className="font-serif text-4xl font-semibold tracking-tight text-[#08204a] sm:text-5xl">{bond.name}</h1><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{titleCase(bond.riskLevel)} risk</span></div><p className="mt-3 max-w-3xl text-lg leading-7 text-slate-500">{bond.shortDescription || bond.description || "A fixed-income offering designed for disciplined long-term income planning."}</p></header>

        <dl className="grid divide-y divide-slate-200 border-b border-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4"><Stat label="Annual coupon rate" value={`${bond.couponRateAnnual.toFixed(2)}%`} /><Stat label="Term" value={term(bond.termMonths)} /><Stat label="Coupon frequency" value={titleCase(bond.couponFrequency)} /><Stat label="Minimum investment" value={money(bond.minInvestment)} /></dl>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <main className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-2 sm:px-4">{([ ["overview", "Overview"], ["benefits", "Benefits & Exit"], ["documents", "Documents & Disclosures"] ] as const).map(([id, label]) => <button key={id} onClick={() => setActiveTab(id)} className={`shrink-0 border-b-2 px-4 py-4 text-sm font-semibold transition ${activeTab === id ? "border-[#0b3d91] text-[#08204a]" : "border-transparent text-slate-400 hover:text-[#08204a]"}`}>{label}</button>)}</div>
                <div className="p-5 sm:p-7">
                    {activeTab === "overview" && <div className="space-y-8"><section><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0b3d91]">The offering</p><h2 className="mt-1 font-serif text-2xl font-semibold text-[#08204a]">About this bond</h2><RichText className="mt-3" html={bond.description || bond.shortDescription || "This offering provides a defined coupon rate over its stated term. Please review the offering documentation before making an investment decision."} /></section><section><h2 className="font-serif text-2xl font-semibold text-[#08204a]">Key terms</h2><div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 px-5">{[["Annual coupon rate", `${bond.couponRateAnnual.toFixed(2)}%`], ["Term", term(bond.termMonths)], ["Coupon frequency", titleCase(bond.couponFrequency)], ["Minimum investment", money(bond.minInvestment)], ["Maximum investment", bond.maxInvestment ? money(bond.maxInvestment) : "No stated maximum"], ["Early redemption", bond.earlyRedemptionAllowed ? "Available subject to terms" : "Not available"]].map(([key, value]) => <DetailRow key={key} label={key} value={value} />)}</div></section></div>}
                    {activeTab === "benefits" && <div className="space-y-8">{bond.usdtBenefitEnabled ? <section><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0b3d91]">Added benefit</p><h2 className="mt-1 font-serif text-2xl font-semibold text-[#08204a]">USDT benefit</h2><div className="mt-3 rounded-xl border border-sky-100 bg-sky-50/60 p-5"><div className="grid gap-4 sm:grid-cols-3"><Detail label="Benefit" value={`${bond.usdtBenefitPercent ?? 0}% of original principal`} /><Detail label="Lock period" value={bond.usdtLockType === "custom" && bond.usdtLockMonths ? term(bond.usdtLockMonths) : "Same as bond term"} /><Detail label="Unlock method" value={bond.usdtUnlockMethod === "admin_approval" ? "Admin approval" : "Automatic at maturity"} /></div>{bond.usdtDescription && <RichText className="mt-5 border-t border-sky-100 pt-4" html={bond.usdtDescription} />}</div></section> : <NoDetails title="No additional USDT benefit" body="This bond does not currently include a separate USDT benefit." />}{bond.earlyRedemptionAllowed ? <section><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0b3d91]">Exit conditions</p><h2 className="mt-1 font-serif text-2xl font-semibold text-[#08204a]">Early redemption</h2><div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 px-5"><DetailRow label="Minimum holding period" value={bond.minHoldingMonths ? term(bond.minHoldingMonths) : "Not specified"} /><DetailRow label="Notice period" value={bond.noticeDays ? `${bond.noticeDays} days` : "Not specified"} /><DetailRow label="Principal penalty" value={`${bond.principalPenaltyPercent ?? 0}%`} /><DetailRow label="Additional redemption fee" value={`${bond.redemptionFeePercent ?? 0}%`} /><DetailRow label="USDT treatment" value={earlyExitText(bond)} /><DetailRow label="Unpaid coupon" value={titleCase(bond.unpaidCouponTreatment || "forfeit")} /><DetailRow label="Previously paid coupon" value={paidCouponText(bond)} /></div>{bond.earlyRedemptionTerms && <RichText className="mt-4 rounded-xl bg-slate-50 p-5" html={bond.earlyRedemptionTerms} />}</section> : <NoDetails title="No early redemption" body="This bond is held until maturity under its published terms." />}</div>}
                    {activeTab === "documents" && <div className="space-y-8"><section><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0b3d91]">Investor resources</p><h2 className="mt-1 font-serif text-2xl font-semibold text-[#08204a]">Documents</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{([ ["offering-document", "Offering document", Boolean(bond.offeringDocumentUrl)], ["term-sheet", "Term sheet", Boolean(bond.termSheetUrl)] ] as const).map(([type, title, available]) => <button key={type} disabled={!available || downloading !== null} onClick={() => download(type)} className="flex min-h-28 items-center justify-between rounded-xl border border-slate-200 p-5 text-left transition enabled:hover:border-[#0b3d91]/40 disabled:cursor-not-allowed disabled:opacity-50"><span className="flex items-center gap-3"><FileText className="h-7 w-7 text-[#0b3d91]" /><span><span className="block font-semibold text-[#08204a]">{title}</span><span className="mt-1 block text-xs text-slate-500">{available ? "Secure download" : "Not available"}</span></span></span>{downloading === type ? <Loader2 className="h-5 w-5 animate-spin text-[#0b3d91]" /> : <Download className="h-5 w-5 text-[#0b3d91]" />}</button>)}</div>{notice && <p className="mt-3 text-sm text-rose-600">{notice}</p>}</section>{(bond.termsAndConditions || bond.riskDisclosure || bond.usdtDisclosure) && <section><h2 className="font-serif text-2xl font-semibold text-[#08204a]">Disclosures</h2><div className="mt-3 space-y-3">{bond.termsAndConditions && <Disclosure title="Terms & Conditions" html={bond.termsAndConditions} />}{bond.riskDisclosure && <Disclosure title="Risk Disclosure" html={bond.riskDisclosure} tone="amber" />}{bond.usdtDisclosure && <Disclosure title="USDT Disclosure" html={bond.usdtDisclosure} tone="sky" />}</div></section>}</div>}
                </div>
            </main>
            <aside className="h-fit overflow-hidden rounded-2xl border border-[#d9e6f8] bg-[#f2f7ff] shadow-sm lg:sticky lg:top-6">
                <div className="bg-[#082e6f] px-5 py-4 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">{investmentStep === "form" ? "Start your investment" : investmentStep === "payment" ? "Choose payment currency" : "Investment confirmed"}</p><h2 className="mt-1 text-lg font-bold">{bond.name}</h2><p className="mt-1 text-xs text-white/65">{bond.couponRateAnnual.toFixed(2)}% annual coupon · {term(bond.termMonths)}</p></div>
                <div className="p-5">
                    {investmentStep === "form" && <div><h3 className="font-serif text-2xl font-semibold text-[#08204a]">Investment preview</h3><label className="mt-5 block text-sm font-medium text-slate-600">Investment amount<input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))} className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[#08204a] outline-none focus:border-[#0b3d91]" /></label>{!amountValid && <p className="mt-2 text-xs text-rose-600">Enter at least {money(bond.minInvestment)}{bond.maxInvestment ? ` and no more than ${money(bond.maxInvestment)}` : ""}.</p>}<div className="mt-6 border-y border-[#d9e6f8] py-4"><p className="text-sm text-slate-500">Estimated annual coupon</p><p className="mt-1 font-serif text-3xl font-semibold text-[#08204a]">{money(estimatedCoupon)}</p><p className="mt-1 text-xs text-slate-500">Estimate based on the published annual coupon rate.</p></div><label className="mt-5 flex cursor-pointer gap-3 text-sm leading-5 text-slate-600"><input checked={accepted} onChange={(event) => setAccepted(event.target.checked)} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0b3d91]" />I have reviewed the terms and documents.</label>{investmentError && <p className="mt-3 text-sm text-rose-600">{investmentError}</p>}<button disabled={!amountValid || !accepted || paymentLoading} onClick={() => void beginPayment()} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#082e6f] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">{paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletCards className="h-4 w-4" />} Continue to payment</button><p className="mt-3 text-center text-xs leading-5 text-slate-500">You will choose a payment wallet before funds are deducted.</p></div>}
                    {investmentStep === "payment" && <div><button onClick={() => { setInvestmentStep("form"); setInvestmentError(""); }} className="inline-flex items-center gap-1 text-xs font-semibold text-[#0b3d91]"><ChevronLeft className="h-3.5 w-3.5" /> Edit investment</button><div className="mt-4 rounded-xl bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">You are investing</p><p className="mt-1 text-xl font-bold text-[#08204a]">{money(parsedAmount)}</p></div><p className="mt-5 text-sm font-semibold text-[#08204a]">Pay with</p><div className="mt-3 flex flex-wrap gap-2">{paymentCurrencies.map((currency) => <button key={currency} onClick={() => void chooseCurrency(currency)} disabled={paymentLoading} className={`rounded-lg border px-3 py-2 text-sm font-bold ${paymentCurrency === currency ? "border-[#082e6f] bg-[#082e6f] text-white" : "border-slate-200 bg-white text-slate-600"}`}>{currency}</button>)}</div>{paymentLoading && <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Getting current rate…</div>}{conversion && !paymentLoading && <div className="mt-5 rounded-xl border border-[#c7d7ff] bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Payment amount</p><p className="mt-1 text-lg font-bold text-[#08204a]">{Number(conversion.convertedAmount).toLocaleString(undefined, { maximumFractionDigits: 8 })} {paymentCurrency}</p><p className="mt-1 text-xs text-slate-500">Live rate: 1 USD = {Number(conversion.rate).toLocaleString(undefined, { maximumFractionDigits: 8 })} {paymentCurrency}</p><button onClick={() => void createInvestment()} disabled={investing} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#082e6f] text-sm font-semibold text-white disabled:opacity-50">{investing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm & invest</button></div>}{investmentError && <p className="mt-4 flex gap-2 text-sm text-rose-600"><AlertCircle className="h-4 w-4 shrink-0" />{investmentError}</p>}</div>}
                    {investmentStep === "success" && <div className="py-3 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-6 w-6" /></span><h3 className="mt-4 text-xl font-bold text-[#08204a]">Investment confirmed</h3><p className="mt-2 text-sm leading-6 text-slate-500">Your wallet has been debited and your Bond investment is active.</p>{createdInvestmentId && <p className="mt-4 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#08204a]">Reference: {createdInvestmentId}</p>}<Link href="/my-bonds" className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#082e6f] text-sm font-semibold text-white">View my bonds</Link></div>}
                </div>
            </aside>
        </div>
    </div>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="py-5 sm:px-6 sm:first:pl-0"><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-serif text-2xl font-semibold text-[#08204a]">{value}</dd></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-[#08204a]">{value}</p></div>; }
function DetailRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-5 py-3 text-sm"><span className="text-slate-500">{label}</span><span className="max-w-[58%] text-right font-semibold text-[#08204a]">{value}</span></div>; }
function NoDetails({ title, body }: { title: string; body: string }) { return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6"><p className="font-semibold text-[#08204a]">{title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{body}</p></div>; }
function RichText({ html, className = "" }: { html: string; className?: string }) { return <div className={`rich-text-preview leading-7 text-slate-600 [&_a]:text-[#0b3d91] [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_p+p]:mt-3 [&_ul]:list-disc ${className}`} dangerouslySetInnerHTML={{ __html: safeRichText(html) }} />; }
function Disclosure({ title, html, tone = "slate" }: { title: string; html: string; tone?: "slate" | "amber" | "sky" }) { const colors = { slate: "border-slate-200 bg-white", amber: "border-amber-100 bg-amber-50/40", sky: "border-sky-100 bg-sky-50/40" }; return <article className={`rounded-xl border p-5 ${colors[tone]}`}><h3 className="font-semibold text-[#08204a]">{title}</h3><RichText className="mt-2 text-sm" html={html} /></article>; }
function earlyExitText(bond: BondInterface) { if (bond.usdtEarlyExitTreatment === "partial_forfeit") return `Partial benefit forfeited (${bond.usdtPartialForfeitPercent ?? 0}%)`; if (bond.usdtEarlyExitTreatment === "full_forfeit") return "Full benefit forfeited"; return titleCase(bond.usdtEarlyExitTreatment || "admin_review"); }
function paidCouponText(bond: BondInterface) { if (bond.paidCouponTreatment === "partial_clawback") return `Partial clawback (${bond.paidCouponClawbackPercent ?? 0}%)`; return titleCase(bond.paidCouponTreatment || "no_clawback"); }
