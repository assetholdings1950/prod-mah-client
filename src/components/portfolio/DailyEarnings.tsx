"use client";

import { useState } from "react";
import { Info, TrendingUp } from "lucide-react";
import type { ClientPortfolioInterface } from "@/interface/portfolio";
import { fmtFull, fmtDate, addMonths } from "@/utils/portfolioHelpers";

const DAILY_PAGE = 30;

function monthlyClaimState(portfolio: ClientPortfolioInterface) {
    const snap  = portfolio.planSnapshot;
    const start = new Date(portfolio.startedAt);
    const now   = new Date();
    const firstClaimDate = addMonths(start, 1);
    const unlocked   = now >= firstClaimDate;
    const rawM       = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const elapsed    = now.getDate() >= start.getDate() ? rawM : rawM - 1;
    const capped     = Math.min(Math.max(0, elapsed), portfolio.durationMonths);
    const base       = portfolio.investmentMode === "sip"
        ? (portfolio.summary.totalInvestedUsd ?? portfolio.amountUsd)
        : portfolio.amountUsd;
    const monthly    = (base * (snap.roiMin ?? 0)) / 100 / 12;
    const claimable  = Math.max(0, Math.min(monthly * capped, portfolio.summary.totalExpectedProfitUsd) - (portfolio.summary.totalPaidProfitUsd ?? 0));
    return { unlocked, claimable, firstClaimDate };
}

export default function DailyEarnings({
    portfolio,
    onClaimMonthly,
}: {
    portfolio: ClientPortfolioInterface;
    onClaimMonthly?: () => void;
}) {
    const [showAll, setShowAll] = useState(false);

    const snap      = portfolio.planSnapshot;
    const dailyRate = (portfolio.amountUsd * (snap.roiMin ?? 0)) / 100 / 365;
    const maxProfit = portfolio.summary.totalExpectedProfitUsd;

    const start         = new Date(portfolio.startedAt);
    const maturity      = new Date(portfolio.maturityDate);
    const today         = new Date();
    const isActiveToday = today < maturity;
    const effectiveEnd  = isActiveToday ? today : maturity;

    const elapsedDays = Math.max(
        0,
        Math.floor((effectiveEnd.getTime() - start.getTime()) / 86400000)
    );

    const totalEarned  = Math.min(dailyRate * elapsedDays, maxProfit);
    const totalClaimed = portfolio.summary.totalPaidProfitUsd ?? 0;
    const available    = Math.max(0, totalEarned - totalClaimed);
    const hasClaimed   = totalClaimed > 0;
    const displayCount = showAll ? elapsedDays : Math.min(DAILY_PAGE, elapsedDays);

    const rows = Array.from({ length: displayCount }, (_, i) => {
        const day  = elapsedDays - i;
        const date = new Date(start.getTime() + day * 86400000);
        return { date, day, cumulative: Math.min(dailyRate * day, maxProfit) };
    });

    // Monthly claim button (only for monthly-payout active portfolios when callback provided)
    const showClaimArea = !!onClaimMonthly && snap.payoutType === "monthly" && portfolio.status === "active";
    const { unlocked, claimable, firstClaimDate } = showClaimArea
        ? monthlyClaimState(portfolio)
        : { unlocked: false, claimable: 0, firstClaimDate: new Date() };
    const claimEnabled = showClaimArea && unlocked && claimable >= 50;

    return (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#F1F5F9]">
                <div>
                    <h3 className="text-[14px] font-bold text-[#0F172A]">Daily Earnings</h3>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                        {elapsedDays === 0
                            ? `Started today — first earning accrues at ${new Date(start.getTime() + 86400000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })} tomorrow`
                            : <>Accruing since {start.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}{" "}
                                at {start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })} · {elapsedDays} day{elapsedDays !== 1 ? "s" : ""} elapsed</>
                        }
                    </p>
                    {isActiveToday && elapsedDays > 0 && (
                        <div className="mt-2 flex items-start gap-1.5">
                            <Info className="h-3.5 w-3.5 shrink-0 text-[#0B2E84] mt-0.5" />
                            <p className="text-[11.5px] text-slate-400">
                                Interest is earned every 24 hours from{" "}
                                <span className="font-semibold text-[#0F172A]">
                                    {start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                </span>{" "}
                                each day. Next earning at{" "}
                                <span className="font-semibold text-[#0F172A]">
                                    {new Date(start.getTime() + (elapsedDays + 1) * 86400000)
                                        .toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                                </span>.
                            </p>
                        </div>
                    )}
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                            {hasClaimed ? "Available" : "Earned So Far"}
                        </p>
                        <p className="text-[17px] font-bold text-emerald-600">
                            {hasClaimed ? fmtFull(available) : fmtFull(totalEarned)}
                        </p>
                        {hasClaimed && (
                            <p className="text-[10.5px] text-slate-400 mt-0.5">
                                of {fmtFull(totalEarned)} earned · {fmtFull(totalClaimed)} claimed
                            </p>
                        )}
                    </div>
                    {showClaimArea && (
                        <button
                            onClick={onClaimMonthly}
                            disabled={!claimEnabled}
                            title={
                                !unlocked
                                    ? `Available from ${fmtDate(firstClaimDate.toISOString())}`
                                    : claimable < 50
                                        ? `Min $50 required — ${fmtFull(claimable)} available`
                                        : undefined
                            }
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-[12px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <TrendingUp className="h-3.5 w-3.5" />
                            {claimEnabled ? `Claim ${fmtFull(claimable)}` : !unlocked ? `Unlocks ${fmtDate(firstClaimDate.toISOString())}` : "Min $50 needed"}
                        </button>
                    )}
                </div>
            </div>

            {/* Summary chips */}
            <div className="grid grid-cols-3 divide-x divide-[#F1F5F9] border-b border-[#F1F5F9]">
                <div className="px-5 py-4 text-center">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Daily Rate</p>
                    <p className="mt-1 text-[13px] font-bold text-[#0F172A]">{fmtFull(dailyRate)}</p>
                </div>
                <div className="px-5 py-4 text-center">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Days Active</p>
                    <p className="mt-1 text-[13px] font-bold text-[#0F172A]">{elapsedDays}</p>
                </div>
                <div className="px-5 py-4 text-center">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                        {hasClaimed ? "Claimed" : "Remaining"}
                    </p>
                    <p className={`mt-1 text-[13px] font-bold ${hasClaimed ? "text-emerald-600" : "text-[#0F172A]"}`}>
                        {hasClaimed ? fmtFull(totalClaimed) : fmtFull(Math.max(0, maxProfit - totalEarned))}
                    </p>
                </div>
            </div>

            {/* Day table */}
            <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                    <thead>
                        <tr className="bg-[#F8FAFC] text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                            <th className="px-5 py-3 text-left">Date</th>
                            <th className="px-5 py-3 text-center">Day</th>
                            <th className="px-5 py-3 text-right">Daily Earning</th>
                            <th className="px-5 py-3 text-right">Total Earned</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-8 text-center text-[12px] text-slate-400">
                                    First earning of <span className="font-semibold text-[#0F172A]">{fmtFull(dailyRate)}</span> accrues after 24 hours.
                                </td>
                            </tr>
                        ) : rows.map(row => {
                            const isLatest = row.day === elapsedDays && isActiveToday;
                            return (
                                <tr key={row.day} className={isLatest ? "bg-emerald-50/70" : "hover:bg-[#F8FAFC]"}>
                                    <td className="px-5 py-3">
                                        <span className={`text-[12.5px] font-medium ${isLatest ? "text-emerald-700" : "text-[#0F172A]"}`}>
                                            {row.date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                        {isLatest && (
                                            <span className="ml-2 rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                                                Today
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-center font-mono text-[11.5px] text-slate-400">
                                        #{row.day}
                                    </td>
                                    <td className="px-5 py-3 text-right font-semibold text-[#0B2E84]">
                                        {fmtFull(dailyRate)}
                                    </td>
                                    <td className={`px-5 py-3 text-right font-bold ${isLatest ? "text-emerald-600" : "text-[#0F172A]"}`}>
                                        {fmtFull(row.cumulative)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Show all / collapse */}
            {elapsedDays > DAILY_PAGE && (
                <div className="border-t border-[#F1F5F9] px-6 py-4 text-center">
                    <button
                        onClick={() => setShowAll(v => !v)}
                        className="text-[12.5px] font-semibold text-[#0B2E84] hover:underline">
                        {showAll
                            ? "Show recent days only"
                            : `Show all ${elapsedDays.toLocaleString()} days`}
                    </button>
                </div>
            )}
        </div>
    );
}
