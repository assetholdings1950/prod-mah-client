"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { WithdrawalRequest } from "@/interface/wallet";
import type { IBankDetail, IWalletDetail } from "@/interface/payment";
import { CoinToken } from "./currency";
import { fmtAmt, fmtDate } from "@/utils/walletHelpers";
import { StatusBadge } from "./StatusBadge";

export function WithdrawalRow({ w }: { w: WithdrawalRequest }) {
    const [expanded, setExpanded] = useState(false);
    const bank   = typeof w.bankDetailId === "object" && w.bankDetailId ? w.bankDetailId as IBankDetail : null;
    const wallet = typeof w.walletId     === "object" && w.walletId     ? w.walletId     as IWalletDetail : null;
    const destination = w.withdrawalMethod === "bank"
        ? bank?.bankName   ?? "Bank account"
        : wallet?.label    ?? wallet?.network ?? "Crypto wallet";

    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setExpanded(o => !o)}
                className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-slate-50/70"
            >
                <CoinToken currency={w.currency} size={38} />
                <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#0e1f3d]">- {fmtAmt(w.amount)} {w.currency}</p>
                    <p className="text-[12px] text-slate-400">{destination} · {fmtDate(w.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <StatusBadge status={w.status} />
                    <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>

            {expanded && (
                <div className="space-y-2.5 border-t border-slate-100 bg-slate-50/60 px-5 pb-4 pt-3">
                    <div className="flex justify-between text-[12.5px]">
                        <span className="text-slate-400">Withdrawal method</span>
                        <span className="font-medium capitalize text-[#0e1f3d]">{w.withdrawalMethod}</span>
                    </div>
                    {bank && (
                        <>
                            <div className="flex justify-between gap-4 text-[12.5px]">
                                <span className="shrink-0 text-slate-400">Account</span>
                                <span className="truncate font-medium text-[#0e1f3d]">{bank.accountName ?? "—"} · {bank.accountNumber ?? "—"}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-[12.5px]">
                                <span className="shrink-0 text-slate-400">Bank</span>
                                <span className="truncate font-medium text-[#0e1f3d]">{bank.bankName ?? "—"}</span>
                            </div>
                        </>
                    )}
                    {wallet && (
                        <>
                            <div className="flex justify-between gap-4 text-[12.5px]">
                                <span className="shrink-0 text-slate-400">Network</span>
                                <span className="truncate font-medium text-[#0e1f3d]">{wallet.network ?? "—"}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-[12.5px]">
                                <span className="shrink-0 text-slate-400">Wallet</span>
                                <span className="truncate font-mono font-medium text-[#0e1f3d]">{wallet.walletAddress ?? "—"}</span>
                            </div>
                        </>
                    )}
                    {w.note && (
                        <div className="flex justify-between gap-4 text-[12.5px]">
                            <span className="shrink-0 text-slate-400">Note</span>
                            <span className="text-right text-[#0e1f3d]">{w.note}</span>
                        </div>
                    )}
                    {w.status === "rejected" && w.adminNote && (
                        <div className="mt-1 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700 ring-1 ring-inset ring-rose-200/70">
                            <span className="font-semibold">Reason: </span>{w.adminNote}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
