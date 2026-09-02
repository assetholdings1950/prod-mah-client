"use client";

import type { ClientPortfolioInterface } from "@/interface/portfolio";
import { buildPayoutSchedule } from "./buildPayoutSchedule";
import { fmtFull, fmtDate } from "@/utils/portfolioHelpers";

export default function ProfitSchedule({ portfolio }: { portfolio: ClientPortfolioInterface }) {
    const snap = portfolio.planSnapshot;
    const rows = buildPayoutSchedule(portfolio);
    const isSip = portfolio.investmentMode === "sip";
    const isMaturity = snap.payoutType === "maturity";
    const isYearly = portfolio.durationMonths > 24;

    const periodicHeader = isSip
        ? isMaturity ? "Lot Profit" : isYearly ? "Period Income" : "Monthly Income"
        : snap.payoutType === "quarterly" ? "Quarterly Income"
            : isMaturity ? "Accrued Profit"
                : isYearly ? "Annual Income" : "Monthly Income";

    const dateHeader = isSip && isMaturity ? "Matures On" : "Payout Date";
    const payoutLabel = { monthly: "Monthly Payouts", quarterly: "Quarterly Payouts", maturity: "Paid at Maturity" }[snap.payoutType] ?? "Payouts";
    const modeLabel = isSip ? "SIP" : "Lump Sum";
    const totalProfit = portfolio.summary.totalExpectedProfitUsd;

    return (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#F1F5F9]">
                <div>
                    <h3 className="text-[14px] font-bold text-[#0F172A]">Profit Schedule</h3>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                        {modeLabel} · {payoutLabel} · {snap.roiMin}% p.a.
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Total Profit</p>
                    <p className="text-[15px] font-bold text-emerald-600">{fmtFull(totalProfit)}</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                    <thead>
                        <tr className="bg-[#F8FAFC] text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                            <th className="px-5 py-3 text-left w-[35%]">Period</th>
                            <th className="px-5 py-3 text-right">{dateHeader}</th>
                            <th className="px-5 py-3 text-right">{periodicHeader}</th>
                            <th className="px-5 py-3 text-right">Cumulative</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                        {rows.map((row, i) => (
                            <tr key={i} className={row.isMaturity ? "bg-emerald-50/60" : "hover:bg-[#F8FAFC]"}>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[12.5px] font-medium ${row.isMaturity ? "text-emerald-700" : "text-[#0F172A]"}`}>
                                            {row.period}
                                        </span>
                                        {row.isMaturity && (
                                            <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                                                Maturity
                                            </span>
                                        )}
                                        {row.installmentStatus === "paid" && (
                                            <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                ✓ Paid
                                            </span>
                                        )}
                                        {row.installmentStatus === "missed" && (
                                            <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide bg-rose-50 text-rose-600 border border-rose-200">
                                                ✗ Missed
                                            </span>
                                        )}
                                        {row.installmentStatus === "upcoming" && (
                                            <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
                                                Upcoming
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-right text-slate-500">
                                    {fmtDate(row.date.toISOString())}
                                </td>
                                <td className={`px-5 py-3 text-right font-semibold ${row.isMaturity ? "text-emerald-600" : "text-[#0B2E84]"}`}>
                                    {fmtFull(row.periodicAmount)}
                                </td>
                                <td className="px-5 py-3 text-right font-bold text-[#0F172A]">
                                    {fmtFull(row.cumulative)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-[#E2E8F0] bg-[#F8FAFC]">
                            <td colSpan={2} className="px-5 py-4 text-[12.5px] font-bold text-[#0F172A]">
                                Total Expected Profit
                            </td>
                            <td colSpan={2} className="px-5 py-4 text-right text-[14px] font-bold text-emerald-600">
                                {fmtFull(totalProfit)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
