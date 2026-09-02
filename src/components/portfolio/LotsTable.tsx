"use client";

import type { PortfolioLot } from "@/interface/portfolio";
import { LOT_STATUS_STYLES } from "./config";
import { fmt, fmtFull, fmtDate, fmtCrypto } from "@/utils/portfolioHelpers";

export default function LotsTable({ lots }: { lots: PortfolioLot[] }) {
    if (!lots.length) return null;
    return (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
            <div className="px-6 py-5 border-b border-[#F1F5F9]">
                <h3 className="text-[14px] font-bold text-[#0F172A]">Investment Lots</h3>
                <p className="mt-0.5 text-[12px] text-slate-500">{lots.length} lot{lots.length !== 1 ? "s" : ""} total</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                    <thead>
                        <tr className="bg-[#F8FAFC] text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                            <th className="px-5 py-3 text-left">Lot #</th>
                            <th className="px-5 py-3 text-right">Invested</th>
                            <th className="px-5 py-3 text-right">Paid (Crypto)</th>
                            <th className="px-5 py-3 text-right">Est. Profit</th>
                            <th className="px-5 py-3 text-right">Maturity</th>
                            <th className="px-5 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                        {lots.map(lot => (
                            <tr key={lot._id} className="hover:bg-[#F8FAFC]">
                                <td className="px-5 py-3.5 font-mono text-slate-500">#{lot.lotNo}</td>
                                <td className="px-5 py-3.5 text-right font-semibold text-[#0F172A]">
                                    {fmtFull(lot.amountUsd)}
                                </td>
                                <td className="px-5 py-3.5 text-right text-slate-600">
                                    {fmtCrypto(lot.paidAmount)} {lot.paidCurrency}
                                </td>
                                <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">
                                    {fmt(lot.expectedProfitUsd)}
                                </td>
                                <td className="px-5 py-3.5 text-right text-slate-500">
                                    {fmtDate(lot.maturityDate)}
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${LOT_STATUS_STYLES[lot.status] ?? "bg-slate-100 text-slate-500"}`}>
                                        {lot.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
