"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ExternalLink, Loader2, RefreshCw, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";

interface FundWallet {
    _id: string;
    currency: string;
    balance: number;
    totalDeposited: number;
    totalWithdrawn: number;
}

const CURRENCY_META: Record<string, { symbol: string; label: string; color: string; bg: string }> = {
    USD: { symbol: "$",   label: "US Dollar",          color: "text-emerald-700", bg: "bg-emerald-50" },
    EUR: { symbol: "€",   label: "Euro",               color: "text-blue-700",    bg: "bg-blue-50"    },
    GBP: { symbol: "£",   label: "British Pound",      color: "text-violet-700",  bg: "bg-violet-50"  },
    SGD: { symbol: "S$",  label: "Singapore Dollar",   color: "text-sky-700",     bg: "bg-sky-50"     },
    AED: { symbol: "د.إ", label: "UAE Dirham",         color: "text-amber-700",   bg: "bg-amber-50"   },
    AUD: { symbol: "A$",  label: "Australian Dollar",  color: "text-teal-700",    bg: "bg-teal-50"    },
    CAD: { symbol: "C$",  label: "Canadian Dollar",    color: "text-red-700",     bg: "bg-red-50"     },
    JPY: { symbol: "¥",   label: "Japanese Yen",       color: "text-pink-700",    bg: "bg-pink-50"    },
};

function getMeta(currency: string) {
    return CURRENCY_META[currency] ?? { symbol: currency, label: currency, color: "text-slate-700", bg: "bg-slate-50" };
}

function formatAmount(amount: number) {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function WalletMenu() {
    const { user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [wallets, setWallets] = useState<FundWallet[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchWallets = async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const res = await appClient.get(
                `/api/transactions/fund-balances?userId=${user._id}&userModel=Client`
            );
            setWallets(res.data?.wallets ?? []);
        } catch {
            // non-critical — silent fail
        } finally {
            setLoading(false);
            setFetched(true);
        }
    };

    // Fetch on first open
    useEffect(() => {
        if (open && !fetched) fetchWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Close on outside click
    useEffect(() => {
        function onPointerDown(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/30 ${
                    open
                        ? "border-[#1D4ED8]/30 bg-[#EEF3FF] text-[#1D4ED8]"
                        : "border-[#E2E8F0] bg-white text-[#0F172A]/65 hover:bg-[#F8FAFC]"
                }`}
            >
                <Wallet className={`h-3.5 w-3.5 shrink-0 ${open ? "text-[#1D4ED8]" : "text-[#1D4ED8]"}`} />
                <span className="hidden sm:inline">My Wallets</span>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-[calc(100%+8px)] z-40 w-[320px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_16px_48px_rgba(15,23,42,0.12)]"
                    >
                        {/* Dropdown header */}
                        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-3.5 w-3.5 text-[#1D4ED8]" />
                                <p className="text-[13px] font-bold text-[#0F172A]">Wallet Balances</p>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Show / Hide toggle */}
                                <button
                                    onClick={() => setRevealed((r) => !r)}
                                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#0F172A]/50 transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                                >
                                    {revealed
                                        ? <EyeOff className="h-3.5 w-3.5" />
                                        : <Eye className="h-3.5 w-3.5" />
                                    }
                                    {revealed ? "Hide" : "Show"}
                                </button>
                                {/* Refresh */}
                                <button
                                    onClick={fetchWallets}
                                    disabled={loading}
                                    title="Refresh"
                                    className="flex h-6 w-6 items-center justify-center rounded-lg text-[#0F172A]/35 transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A] disabled:opacity-30"
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                                </button>
                            </div>
                        </div>

                        {/* Wallet list */}
                        <div className="max-h-[280px] overflow-y-auto">
                            {loading && !fetched ? (
                                <div className="flex flex-col items-center gap-2.5 py-10">
                                    <Loader2 className="h-5 w-5 animate-spin text-[#1D4ED8]/50" />
                                    <p className="text-[12px] text-[#0F172A]/40">Loading balances…</p>
                                </div>
                            ) : wallets.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8FAFC]">
                                        <Wallet className="h-5 w-5 text-[#0F172A]/20" />
                                    </div>
                                    <p className="text-[12.5px] font-medium text-[#0F172A]/50">No fund balances yet</p>
                                    <p className="text-[11px] text-[#0F172A]/30">
                                        Balances appear after a deposit is approved.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-[#F8FAFC]">
                                    {wallets.map((w) => {
                                        const meta = getMeta(w.currency);
                                        return (
                                            <li key={w._id} className="flex items-center gap-3 px-4 py-3.5">
                                                {/* Currency badge */}
                                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[14px] font-black ${meta.bg} ${meta.color}`}>
                                                    {meta.symbol}
                                                </div>

                                                {/* Labels */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#0F172A]/35">
                                                        {w.currency} · {meta.label}
                                                    </p>
                                                    <p className="mt-0.5 text-[15px] font-bold tabular-nums text-[#0F172A] transition-all">
                                                        {revealed
                                                            ? `${meta.symbol}${formatAmount(w.balance)}`
                                                            : <span className="tracking-[0.15em] text-[#0F172A]/30">••••••</span>
                                                        }
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Footer — View Details */}
                        <div className="border-t border-[#F1F5F9] p-3">
                            <Link
                                href="/wallet"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#1e293b]"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View Details
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
