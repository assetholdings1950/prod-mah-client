import { BarChart3, Banknote, Bitcoin } from "lucide-react";

export const STATUS_STYLES: Record<string, string> = {
    active:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    paused:    "bg-amber-500/15 text-amber-400 border-amber-500/20",
    matured:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
    closed:    "bg-slate-500/15 text-slate-400 border-slate-500/20",
    cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

export const STATUS_LABEL: Record<string, string> = {
    active: "Active", paused: "Paused", matured: "Matured",
    closed: "Closed", cancelled: "Cancelled",
};

export const LOT_STATUS_STYLES: Record<string, string> = {
    active:  "bg-emerald-50 text-emerald-700",
    matured: "bg-blue-50 text-blue-700",
    closed:  "bg-slate-100 text-slate-500",
};

export const CATEGORY_ICON = {
    monthly: BarChart3, lumpsum: Banknote, crypto: Bitcoin,
} as const;
