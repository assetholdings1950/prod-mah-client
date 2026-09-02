"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { DepositRequest } from "@/interface/wallet";
import { CoinToken } from "./currency";
import { fmtAmt, fmtDate } from "@/utils/walletHelpers";
import { StatusBadge } from "./StatusBadge";

export function DepositRow({ d }: { d: DepositRequest }) {
    const [expanded, setExpanded] = useState(false);
    const pmName = typeof d.paymentMethodId === "object" && d.paymentMethodId
        ? `${d.paymentMethodId.name} (${d.paymentMethodId.network})`
        : null;

    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setExpanded(o => !o)}
                className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-slate-50/70"
            >
                <CoinToken currency={d.currency} size={38} />
                <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#0e1f3d]">{d.currency} {fmtAmt(d.amount)}</p>
                    <p className="text-[12px] text-slate-400">{fmtDate(d.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <StatusBadge status={d.status} />
                    <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>

            {expanded && (
                <div className={`border-t border-slate-100 bg-slate-50/60 px-5 pb-4 pt-3 ${d.paymentProofUrl ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]" : "space-y-2.5"}`}>
                    <div className="space-y-2.5">
                        {pmName && (
                            <div className="flex justify-between text-[12.5px]">
                                <span className="text-slate-400">Payment method</span>
                                <span className="font-medium text-[#0e1f3d]">{pmName}</span>
                            </div>
                        )}
                        {d.transactionHash && (
                            <div className="flex justify-between gap-4 text-[12.5px]">
                                <span className="shrink-0 text-slate-400">Tx hash</span>
                                <span className="truncate font-mono font-medium text-[#0e1f3d]">{d.transactionHash}</span>
                            </div>
                        )}
                        {d.senderWalletAddress && (
                            <div className="flex justify-between gap-4 text-[12.5px]">
                                <span className="shrink-0 text-slate-400">From</span>
                                <span className="truncate font-mono font-medium text-[#0e1f3d]">{d.senderWalletAddress}</span>
                            </div>
                        )}
                        {d.note && (
                            <div className="flex justify-between gap-4 text-[12.5px]">
                                <span className="shrink-0 text-slate-400">Note</span>
                                <span className="text-right text-[#0e1f3d]">{d.note}</span>
                            </div>
                        )}
                        {d.status === "rejected" && d.adminNote && (
                            <div className="mt-1 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700 ring-1 ring-inset ring-rose-200/70">
                                <span className="font-semibold">Reason: </span>{d.adminNote}
                            </div>
                        )}
                    </div>

                    {d.paymentProofUrl && (
                        <div>
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Payment proof</p>
                            <a href={d.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block">
                                <Image src={d.paymentProofUrl} alt="Payment proof" width={480} height={270}
                                    className="max-h-44 w-full rounded-xl border border-slate-200 bg-white object-cover shadow-sm" />
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
