"use client";

import { AlertCircle } from "lucide-react";
import type { ClientPortfolioInterface } from "@/interface/portfolio";
import { fmtDate } from "@/utils/portfolioHelpers";

export default function SipProgress({ p }: { p: ClientPortfolioInterface }) {
    const sip = p.sip;
    if (!sip) return null;
    const total = sip.totalInstallments ?? 0;
    const paid = sip.paidInstallments;
    const pct = total > 0 ? Math.round((paid / total) * 100) : 0;

    return (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <h3 className="text-[14px] font-bold text-[#0F172A]">SIP Progress</h3>
            <div className="mt-4 flex items-end justify-between text-[13px]">
                <span className="text-slate-500">{paid} of {total} installments paid</span>
                <span className="font-bold text-[#0B2E84]">{pct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EEF3FB]">
                <div className="h-full rounded-full bg-[#0B2E84] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                {sip.nextDueDate && (
                    <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                        <p className="text-[10.5px] font-bold uppercase tracking-wide text-amber-600">Next Due</p>
                        <p className="mt-1 text-[13px] font-bold text-[#0F172A]">{fmtDate(sip.nextDueDate)}</p>
                    </div>
                )}
                {sip.lastPaidDate && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                        <p className="text-[10.5px] font-bold uppercase tracking-wide text-emerald-600">Last Paid</p>
                        <p className="mt-1 text-[13px] font-bold text-[#0F172A]">{fmtDate(sip.lastPaidDate)}</p>
                    </div>
                )}
            </div>
            {sip.missedInstallments > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-[13px] text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {sip.missedInstallments} missed installment{sip.missedInstallments > 1 ? "s" : ""}
                </div>
            )}
        </div>
    );
}
