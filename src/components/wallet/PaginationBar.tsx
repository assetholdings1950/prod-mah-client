"use client";

import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

export const LIMIT_OPTIONS = [10, 25, 50, 100];

interface PaginationBarProps {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    loading?: boolean;
    onPageChange: (p: number) => void;
    onLimitChange: (l: number) => void;
}

export function PaginationBar({ page, totalPages, total, limit, loading, onPageChange, onLimitChange }: PaginationBarProps) {
    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to   = Math.min(page * limit, total);

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce<(number | "…")[]>((acc, p, idx, arr) => {
            if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
        }, []);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF2F7] px-5 py-3">
            <p className="text-[12px] text-slate-400">
                {loading ? "Loading…" : total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
            </p>

            <div className="flex items-center gap-2.5">
                <div className="relative">
                    <select
                        value={limit}
                        onChange={e => onLimitChange(Number(e.target.value))}
                        className="appearance-none rounded-lg border border-[#D9E3F2] bg-white py-1.5 pl-3 pr-7 text-[12px] font-semibold text-[#071F55] shadow-sm transition hover:border-[#0B5ED7]/50 focus:outline-none focus:ring-2 focus:ring-[#0B5ED7]/30"
                    >
                        {LIMIT_OPTIONS.map(o => (
                            <option key={o} value={o}>{o} / page</option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                </div>

                <button
                    disabled={page <= 1 || loading}
                    onClick={() => onPageChange(page - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D9E3F2] bg-white text-[#071F55] shadow-sm transition hover:border-[#0B5ED7]/50 hover:text-[#0B5ED7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-1">
                    {pages.map((p, idx) =>
                        p === "…" ? (
                            <span key={`ellipsis-${idx}`} className="px-1 text-[12px] text-slate-400">…</span>
                        ) : (
                            <button key={p} onClick={() => onPageChange(p as number)}
                                className={`h-8 min-w-[32px] rounded-lg px-2 text-[12px] font-semibold transition ${page === p
                                    ? "bg-[#0B5ED7] text-white shadow-sm"
                                    : "border border-[#D9E3F2] bg-white text-[#071F55] hover:border-[#0B5ED7]/50 hover:text-[#0B5ED7]"}`}>
                                {p}
                            </button>
                        )
                    )}
                </div>

                <button
                    disabled={page >= totalPages || loading}
                    onClick={() => onPageChange(page + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D9E3F2] bg-white text-[#071F55] shadow-sm transition hover:border-[#0B5ED7]/50 hover:text-[#0B5ED7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
