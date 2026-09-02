"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    AlertCircle, ArrowLeft, BarChart3, Banknote, Bitcoin,
    CalendarDays, CheckCircle2, Clock, Gift, LockKeyhole,
    TrendingUp, Wallet, X,
} from "lucide-react";
import appClient from "@/lib/appClient";
import type { ClientPortfolioInterface } from "@/interface/portfolio";
import { CATEGORY_ICON, STATUS_STYLES, STATUS_LABEL } from "./config";
import { fmt, fmtFull, fmtDate, fmtCrypto, daysBetween } from "@/utils/portfolioHelpers";
import { StatCard, InfoRow } from "./StatCard";
import Skeleton from "./Skeleton";
import SipProgress from "./SipProgress";
import DailyEarnings from "./DailyEarnings";
import ProfitSchedule from "./ProfitSchedule";
import LotsTable from "./LotsTable";
import PaySipModal from "./PaySipModal";
import ClaimModal from "./ClaimModal";
import EarlyExitModal from "./EarlyExitModal";
import ClaimMonthlyModal from "./ClaimMonthlyModal";
import { isAccountOpeningApproved } from "@/lib/accountOpening";

// suppress unused-import lint hints from lucide tree-shaking
void BarChart3; void Banknote; void Bitcoin;

export default function PortfolioDetailContent() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [portfolio, setPortfolio] = useState<ClientPortfolioInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPayModal, setShowPayModal]         = useState(false);
    const [showClaimModal, setShowClaimModal]     = useState(false);
    const [showExitModal, setShowExitModal]       = useState(false);
    const [showMonthlyModal, setShowMonthlyModal] = useState(false);

    const openWithdrawalAction = async (open: () => void) => {
        try {
            if (await isAccountOpeningApproved()) { open(); return; }
        } catch { /* account form page handles status errors */ }
        router.push("/account-opening?required=withdrawal");
    };

    const fetchPortfolio = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await appClient.get(`/api/portfolio/${id}`);
            const raw = res.data as { data?: ClientPortfolioInterface; portfolio?: ClientPortfolioInterface };
            const p = raw.data ?? raw.portfolio ?? null;
            if (!p) throw new Error("No portfolio in response.");
            setPortfolio(p);
        } catch {
            setError("Could not load this portfolio. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { void fetchPortfolio(); }, [fetchPortfolio]);

    if (loading) return <Skeleton />;

    if (!portfolio) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#EEF3FB] px-4">
                <div className="max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
                    <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />
                    <h1 className="mt-5 text-xl font-bold text-[#0F172A]">Portfolio not found</h1>
                    <p className="mt-2 text-sm text-slate-500">{error ?? "This portfolio could not be found."}</p>
                    <Link href="/portfolio"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B2E84] px-5 py-2.5 text-sm font-bold text-[#ffffff] hover:bg-[#082461]">
                        <ArrowLeft className="h-4 w-4" /> My Portfolio
                    </Link>
                </div>
            </div>
        );
    }

    const { planSnapshot: snap, summary, sip, lots = [], paidFromWallet: paid } = portfolio;
    const CategoryIcon  = CATEGORY_ICON[snap.category] ?? BarChart3;
    const statusStyle   = STATUS_STYLES[portfolio.status] ?? STATUS_STYLES.active;
    const isSip         = portfolio.investmentMode === "sip";
    let isDueSoon = false;
    if (sip?.nextDueDate) {
        const nextDueDate = new Date(sip.nextDueDate);
        const today = new Date();
        const oneWeekBefore = new Date(nextDueDate);
        oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
        isDueSoon = today >= oneWeekBefore;
    }
    const canPaySip     = isSip && portfolio.status === "active" && !!sip?.nextDueDate && isDueSoon;
    const isLocked      = !!portfolio.lockInEndDate && new Date() < new Date(portfolio.lockInEndDate);
    const canEarlyExit  = portfolio.status === "active" && snap.category !== "crypto";

    // Monthly interest claim: any active portfolio with monthly payout and ≥$50 accrued
    const canClaimMonthly = snap.payoutType === "monthly" && portfolio.status === "active";
    const cs = portfolio.closedSummary ?? null;
    const totalDays     = daysBetween(portfolio.startedAt, portfolio.maturityDate);
    const elapsedDays   = daysBetween(portfolio.startedAt, new Date().toISOString());
    const progressPct   = totalDays > 0 ? Math.min(100, Math.round((elapsedDays / totalDays) * 100)) : 0;

    return (
        <div className="min-h-screen bg-[#EEF3FB]">

            {/* Hero */}
            <div className="bg-[#0B1628]">
                <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">

                    <Link href="/portfolio"
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#ffffff]/50 hover:text-[#ffffff] transition">
                        <ArrowLeft className="h-3.5 w-3.5" /> My Portfolio
                    </Link>

                    <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                                <CategoryIcon className="h-6 w-6 text-[#ffffff]" />
                            </div>
                            <div>
                                <p className="font-mono text-[11.5px] text-[#ffffff]/40">{portfolio.portfolioId}</p>
                                <h1 className="text-[18px] font-bold text-[#ffffff] leading-tight">{snap.name}</h1>
                            </div>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyle}`}>
                            {STATUS_LABEL[portfolio.status] ?? portfolio.status}
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard label="Total Invested" value={fmt(summary.totalInvestedUsd)} accent />
                        <StatCard label="Expected Profit" value={fmt(summary.totalExpectedProfitUsd)}
                            sub={`ROI ${snap.roiMin}%${snap.roiMax && snap.roiMax !== snap.roiMin ? ` – ${snap.roiMax}%` : ""}`} />
                        <StatCard label="Maturity Value" value={fmt(summary.expectedMaturityValueUsd)} />
                        <StatCard label="Duration" value={`${portfolio.durationMonths} mo`}
                            sub={`Matures ${fmtDate(portfolio.maturityDate)}`} />
                    </div>

                    <div className="mt-6 space-y-1.5">
                        <div className="flex justify-between text-[11.5px] text-[#ffffff]/50">
                            <span>{fmtDate(portfolio.startedAt)}</span>
                            <span className="font-semibold text-[#ffffff]/70">{progressPct}% elapsed</span>
                            <span>{fmtDate(portfolio.maturityDate)}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-[#ffffff]/60 transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 space-y-5">

                {/* Claim maturity banner */}
                {portfolio.status === "matured" && !portfolio.closedAt && (
                    <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                <Gift className="h-5 w-5 text-[#ffffff]" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-[#ffffff]">Your portfolio has matured!</p>
                                <p className="text-[12px] text-[#ffffff]/70">
                                    {fmtFull(portfolio.summary.currentValueUsd)} USD is ready to transfer to your wallet.
                                </p>
                            </div>
                        </div>
                        <button onClick={() => openWithdrawalAction(() => setShowClaimModal(true))}
                            className="ml-4 h-10 shrink-0 rounded-xl bg-[#ffffff] px-5 text-[13px] font-bold text-emerald-700 hover:bg-emerald-50 transition">
                            Claim Now
                        </button>
                    </div>
                )}

                {/* SIP pay button */}
                {canPaySip && (
                    <div className="flex items-center justify-between rounded-2xl bg-[#0B2E84] px-6 py-4">
                        <div>
                            <p className="text-[13px] font-bold text-[#ffffff]">Next SIP installment due</p>
                            <p className="text-[12px] text-[#ffffff]/60">{fmtDate(sip!.nextDueDate!)}</p>
                        </div>
                        <button onClick={() => setShowPayModal(true)}
                            className="h-10 rounded-xl bg-[#ffffff] px-5 text-[13px] font-bold text-[#0B2E84] hover:bg-[#EFF4FF] transition">
                            Pay Now
                        </button>
                    </div>
                )}

                {/* Early exit banner */}
                {canEarlyExit && (
                    <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4">
                        <div>
                            <p className="text-[13px] font-bold text-rose-800">Early Exit Available</p>
                            <p className="text-[12px] text-rose-600/80">
                                {snap.exitPenaltyPercent
                                    ? `A ${snap.exitPenaltyPercent}% penalty applies on total value${isLocked ? ` · locked until ${new Date(portfolio.lockInEndDate!).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}` : ""}`
                                    : "Exit your investment before maturity"
                                }
                            </p>
                        </div>
                        <button
                            onClick={() => openWithdrawalAction(() => setShowExitModal(true))}
                            className="ml-4 h-10 shrink-0 rounded-xl border border-rose-300 bg-white px-5 text-[13px] font-bold text-rose-700 hover:bg-rose-100 transition">
                            Exit Early
                        </button>
                    </div>
                )}

                {/* Closed summary */}
                {portfolio.status === "closed" && cs && (
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${cs.reason === "early_exit" ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"}`}>
                            <div className="flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cs.reason === "early_exit" ? "bg-rose-100" : "bg-emerald-100"}`}>
                                    {cs.reason === "early_exit"
                                        ? <X className="h-5 w-5 text-rose-600" />
                                        : <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    }
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-[#0F172A]">Plan Closed</p>
                                    {cs.note && <p className="text-[12px] text-slate-500">{cs.note}</p>}
                                </div>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${cs.reason === "early_exit" ? "border-rose-200 bg-rose-100 text-rose-700" : "border-emerald-200 bg-emerald-100 text-emerald-700"}`}>
                                {cs.reason === "early_exit" ? "Early Exit" : cs.reason === "maturity" ? "Maturity" : "Admin Closed"}
                            </span>
                        </div>

                        <div className="px-6 py-5">
                            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wide text-slate-400">Amount Breakdown</p>
                            <table className="w-full text-[13px]">
                                <tbody>
                                    <tr className="border-b border-[#F1F5F9]">
                                        <td className="py-2.5 text-slate-500">Principal</td>
                                        <td className="py-2.5 text-right font-semibold text-[#0F172A]">{fmtFull(cs.principal ?? 0)}</td>
                                    </tr>
                                    <tr className="border-b border-[#F1F5F9]">
                                        <td className="py-2.5 text-slate-500">Earnings Accrued</td>
                                        <td className="py-2.5 text-right font-semibold text-emerald-600">+{fmtFull(cs.earnedUsd ?? 0)}</td>
                                    </tr>
                                    {(cs.penaltyPct ?? 0) > 0 && (
                                        <tr className="border-b border-[#F1F5F9]">
                                            <td className="py-2.5 text-slate-500">
                                                Early Exit Penalty <span className="text-rose-500">({cs.penaltyPct}%)</span>
                                            </td>
                                            <td className="py-2.5 text-right font-semibold text-rose-500">−{fmtFull(cs.penaltyUsd ?? 0)}</td>
                                        </tr>
                                    )}
                                    {(cs.chargesBreakdown ?? []).map((ch, i) => (
                                        <tr key={i} className="border-b border-[#F1F5F9]">
                                            <td className="py-2.5 text-slate-500">
                                                {ch.particular} <span className="text-rose-400">({ch.chargePercent}%)</span>
                                            </td>
                                            <td className="py-2.5 text-right font-semibold text-rose-400">−{fmtFull(ch.chargeUsd)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className="pt-3 pb-1 font-bold text-[#0F172A]">Net Received</td>
                                        <td className="pt-3 pb-1 text-right text-[15px] font-bold text-[#0B2E84]">{fmtFull(cs.netRefundUsd ?? 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {cs.payoutCurrency && (
                            <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] px-6 py-4">
                                <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-slate-400">Fund Transfer</p>
                                <div className="flex flex-wrap gap-x-8 gap-y-3">
                                    <div>
                                        <p className="text-[11px] text-slate-400">Currency</p>
                                        <p className="text-[13px] font-bold text-[#0F172A]">{cs.payoutCurrency}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-400">Amount Transferred</p>
                                        <p className="text-[13px] font-bold text-[#0F172A]">{fmtCrypto(cs.convertedAmount ?? 0)} {cs.payoutCurrency}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-400">Rate Used</p>
                                        <p className="text-[13px] font-bold text-[#0F172A]">1 USD = {fmtCrypto(cs.rate ?? 0)} {cs.payoutCurrency}</p>
                                    </div>
                                    {portfolio.closedAt && (
                                        <div>
                                            <p className="text-[11px] text-slate-400">Closed On</p>
                                            <p className="text-[13px] font-bold text-[#0F172A]">{fmtDate(portfolio.closedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Plan details */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                    <h3 className="text-[14px] font-bold text-[#0F172A]">Plan Details</h3>
                    <div className="mt-4 divide-y divide-transparent">
                        <InfoRow icon={<TrendingUp className="h-4 w-4" />} label="Plan Type"
                            value={snap.category === "monthly" ? "Monthly SIP" : snap.category === "lumpsum" ? "Lump Sum" : "Digital Assets"} />
                        <InfoRow icon={<BarChart3 className="h-4 w-4" />} label="Expected ROI"
                            value={`${snap.roiMin}%${snap.roiMax && snap.roiMax !== snap.roiMin ? ` – ${snap.roiMax}%` : ""} p.a.`} />
                        <InfoRow icon={<Clock className="h-4 w-4" />} label="Payout Type"
                            value={{ monthly: "Monthly", quarterly: "Quarterly", maturity: "At Maturity" }[snap.payoutType] ?? snap.payoutType} />
                        <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Start Date"
                            value={fmtDate(portfolio.startedAt)} />
                        <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Maturity Date"
                            value={fmtDate(portfolio.maturityDate)} />
                        {portfolio.lockInEndDate && (
                            <InfoRow icon={<LockKeyhole className="h-4 w-4" />} label="Lock-in Ends"
                                value={fmtDate(portfolio.lockInEndDate)} />
                        )}
                    </div>
                </div>

                {/* Payment details */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                    <h3 className="text-[14px] font-bold text-[#0F172A]">Payment Details</h3>
                    <div className="mt-4 divide-y divide-transparent">
                        <InfoRow icon={<Wallet className="h-4 w-4" />} label="Paid Currency" value={paid.currency} />
                        <InfoRow icon={<Banknote className="h-4 w-4" />} label="Amount Paid"
                            value={`${fmtCrypto(paid.amount)} ${paid.currency}`} />
                        <InfoRow icon={<TrendingUp className="h-4 w-4" />} label="Rate Used"
                            value={`1 USD = ${fmtCrypto(paid.rate)} ${paid.currency}`} />
                        {paid.lockedAt && (
                            <InfoRow icon={<LockKeyhole className="h-4 w-4" />} label="Rate Locked At"
                                value={fmtDate(paid.lockedAt)} />
                        )}
                    </div>
                </div>

                {/* SIP progress */}
                {isSip && sip && <SipProgress p={portfolio} />}

                {/* Summary */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                    <h3 className="text-[14px] font-bold text-[#0F172A]">Portfolio Summary</h3>
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {[
                            { label: "Total Invested",  value: fmtFull(summary.totalInvestedUsd) },
                            { label: "Expected Profit", value: fmtFull(summary.totalExpectedProfitUsd), green: true },
                            { label: "Maturity Value",  value: fmtFull(summary.expectedMaturityValueUsd) },
                            { label: "Profit Paid",     value: fmtFull(summary.totalPaidProfitUsd) },
                            { label: "Active Lots",     value: String(summary.activeLots) },
                            { label: "Total Lots",      value: String(summary.totalLots) },
                        ].map(s => (
                            <div key={s.label} className="rounded-xl bg-[#F8FAFC] p-4">
                                <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">{s.label}</p>
                                <p className={`mt-1.5 text-[14px] font-bold ${s.green ? "text-emerald-600" : "text-[#0F172A]"}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Daily earnings + monthly claim */}
                <DailyEarnings
                    portfolio={portfolio}
                    onClaimMonthly={canClaimMonthly ? () => openWithdrawalAction(() => setShowMonthlyModal(true)) : undefined}
                />

                {/* Profit schedule */}
                <ProfitSchedule portfolio={portfolio} />

                {/* Lots table */}
                {lots.length > 0 && <LotsTable lots={lots} />}

                {/* Status checks */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                    <h3 className="text-[14px] font-bold text-[#0F172A]">Portfolio Status</h3>
                    <div className="mt-4 space-y-2.5">
                        {[
                            { ok: portfolio.status === "active", label: "Portfolio is active" },
                            { ok: summary.activeLots > 0 || summary.maturedLots > 0, label: `${summary.totalLots} lot${summary.totalLots !== 1 ? "s" : ""} recorded` },
                            { ok: !isSip || (sip?.missedInstallments ?? 0) === 0, label: "No missed installments" },
                            snap.payoutType === "maturity"
                                ? { ok: portfolio.status === "matured" || portfolio.status === "closed", label: portfolio.status === "matured" || portfolio.status === "closed" ? `${fmtFull(summary.totalExpectedProfitUsd)} profit at maturity — ready to claim` : `${fmtFull(summary.totalExpectedProfitUsd)} profit earns at maturity` }
                                : { ok: summary.totalPaidProfitUsd > 0, label: `${fmtFull(summary.totalPaidProfitUsd)} profit paid out` },
                        ].map(({ ok, label }) => (
                            <div key={label} className="flex items-center gap-2.5">
                                {ok
                                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                    : <X className="h-4 w-4 shrink-0 text-slate-300" />
                                }
                                <p className={`text-[13px] ${ok ? "text-[#0F172A]" : "text-slate-400"}`}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {showPayModal && (
                <PaySipModal
                    portfolio={portfolio}
                    onClose={() => setShowPayModal(false)}
                    onSuccess={() => { setShowPayModal(false); void fetchPortfolio(); }}
                />
            )}

            {showClaimModal && (
                <ClaimModal
                    portfolio={portfolio}
                    onClose={() => setShowClaimModal(false)}
                    onSuccess={() => { setShowClaimModal(false); void fetchPortfolio(); }}
                />
            )}

            {showExitModal && (
                <EarlyExitModal
                    portfolio={portfolio}
                    onClose={() => setShowExitModal(false)}
                    onSuccess={() => { setShowExitModal(false); void fetchPortfolio(); }}
                />
            )}

            {showMonthlyModal && (
                <ClaimMonthlyModal
                    portfolio={portfolio}
                    onClose={() => setShowMonthlyModal(false)}
                    onSuccess={() => { setShowMonthlyModal(false); void fetchPortfolio(); }}
                />
            )}
        </div>
    );
}
