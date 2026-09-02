"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
    AlertCircle, Check, ChevronDown, CheckCircle2, XCircle,
    Clock, Copy, ImageIcon, Loader2, Plus, RefreshCw,
    Timer, Wallet, X, ArrowRight, ArrowLeft, ShieldCheck,
    Lock, Zap, Headphones, Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";
import { uploadToCloudinary } from "@/components/profile/upload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentMethod {
    _id: string;
    name: string;
    slug: string;
    type: "fiat" | "crypto";
    currency: string;
    network: string;
    walletAddress: string;
    accountDetails: string;
    qrCodeUrl: string;
    instructions: string;
    minDeposit: number;
    maxDeposit: number | null;
    processingTime: string;
}

interface WalletBalance {
    currency: string;
    balance: number;
}

interface DepositRequest {
    _id: string;
    amount: number;
    currency: string;
    network?: string;
    transactionHash?: string;
    senderWalletAddress?: string;
    paymentProofUrl?: string;
    note?: string;
    status: "pending" | "approved" | "rejected";
    adminNote?: string;
    createdAt: string;
    paymentMethodId?: { name: string; currency: string; network: string } | string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIMER_TOTAL = 12 * 60; // 720 seconds

// Brand accents per currency. brand = hex used for SVG discs & glow.
const CURRENCY: Record<string, { brand: string; chip: string; dot: string }> = {
    BTC: { brand: "#F7931A", chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    ETH: { brand: "#627EEA", chip: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
    USDT: { brand: "#26A17B", chip: "bg-teal-50 text-teal-700", dot: "bg-teal-500" },
    SOL: { brand: "#9945FF", chip: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
    TRX: { brand: "#EF0027", chip: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
    USD: { brand: "#2E8B57", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};
const cur = (c: string) =>
    CURRENCY[c?.toUpperCase()] ?? { brand: "#64748B", chip: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtAmt(v: unknown) {
    const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function padTime(n: number) { return n.toString().padStart(2, "0"); }

// ─── Brand coin icons (inline SVG) ──────────────────────────────────────────────

function CoinGlyph({ currency }: { currency: string }) {
    const code = currency?.toUpperCase();
    switch (code) {
        case "BTC":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[58%] w-[58%]">
                    <path fill="currentColor" d="M16.3 10.6c.2-1.5-.9-2.3-2.5-2.8l.5-2.1-1.3-.3-.5 2c-.3-.1-.7-.2-1-.2l.5-2-1.3-.4-.5 2.1-2.4-.6-.3 1.4s.9.2.9.2c.5.1.6.5.6.7l-.6 2.4c0 .1 0 .1 0 .1l-.8 3.3c-.1.2-.2.4-.5.3l-.9-.2-.6 1.5 2.3.6-.5 2.1 1.3.3.5-2.1c.4.1.7.2 1 .3l-.5 2.1 1.3.3.5-2.1c2.2.4 3.9.3 4.6-1.7.6-1.6 0-2.6-1.2-3.2.9-.2 1.5-.8 1.7-2zm-3 4.2c-.4 1.6-3 .7-3.9.5l.7-2.8c.9.2 3.6.7 3.2 2.3zm.4-4.3c-.4 1.5-2.6.7-3.3.6l.6-2.5c.7.2 3 .5 2.7 1.9z" />
                </svg>
            );
        case "ETH":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[58%] w-[58%]">
                    <path fill="currentColor" d="M12 3 6.5 12.2 12 15.5l5.5-3.3z" opacity=".75" />
                    <path fill="currentColor" d="M12 3 6.5 12.2 12 9.6z" />
                    <path fill="currentColor" d="m12 16.6-5.5-3.3L12 21l5.5-7.7z" opacity=".75" />
                    <path fill="currentColor" d="M12 16.6V21l5.5-7.7z" />
                </svg>
            );
        case "USDT":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[58%] w-[58%]">
                    <path fill="currentColor" d="M13.3 10.7v-1.4h3.2V7.2H7.5v2.1h3.2v1.4c-2.6.1-4.6.6-4.6 1.2s2 1.1 4.6 1.2v4.4h2.6v-4.4c2.6-.1 4.6-.6 4.6-1.2s-2-1.1-4.6-1.2zm0 2c-.1 0-.7.1-2 .1-1 0-1.8 0-2-.1-2.3-.1-4-.5-4-1s1.7-.9 4-1v1.7c.2 0 1 .1 2 .1 1.2 0 1.9-.1 2-.1V10.7c2.3.1 4 .5 4 1s-1.7.9-4 1z" />
                </svg>
            );
        case "SOL":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[58%] w-[58%]">
                    <path fill="currentColor" d="M7 8.4c.1-.1.3-.2.5-.2h10.1c.3 0 .4.3.2.5l-2 2c-.1.1-.3.2-.5.2H5.2c-.3 0-.4-.3-.2-.5l2-2z" />
                    <path fill="currentColor" d="M7 13.1c.1-.1.3-.2.5-.2h10.1c.3 0 .4.3.2.5l-2 2c-.1.1-.3.2-.5.2H5.2c-.3 0-.4-.3-.2-.5l2-2z" opacity=".8" />
                    <path fill="currentColor" d="M16.8 10.6c-.1-.1-.3-.2-.5-.2H6.2c-.3 0-.4.3-.2.5l2 2c.1.1.3.2.5.2h10.1c.3 0 .4-.3.2-.5l-2-2z" opacity=".55" />
                </svg>
            );
        case "TRX":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[58%] w-[58%]">
                    <path fill="currentColor" d="M5 6.2 17 8.6c.4.1.6.3.9.6l1.6 2c.2.3.1.4-.2.5L10 19c-.3.1-.5 0-.6-.3L4.6 6.7c-.1-.4.1-.6.4-.5zm1.9 1.9 2 5.1 4.8-4.2-6.8-.9zm2.9 6.2 5.7-4.9-1-1.3-9 1.6 4.3 4.6z" />
                </svg>
            );
        default:
            return <span className="text-[0.62em] font-bold leading-none">{code?.slice(0, 3)}</span>;
    }
}

// ─── Coin token (brand disc with subtle glow) ───────────────────────────────────

function CoinToken({ currency, size = 40 }: { currency: string; size?: number }) {
    const c = cur(currency);
    return (
        <span
            className="relative flex shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-105"
            style={{
                height: size,
                width: size,
                background: `linear-gradient(140deg, ${c.brand}, ${c.brand}cc)`,
                boxShadow: `0 6px 18px -6px ${c.brand}66, inset 0 1px 0 rgba(255,255,255,0.35)`,
            }}
        >
            <CoinGlyph currency={currency} />
        </span>
    );
}

// ─── Count-up number (subtle balance animation) ─────────────────────────────────

function useCountUp(target: number, duration = 900) {
    const [val, setVal] = useState(0);
    const rafRef = useRef<number | null>(null);
    useEffect(() => {
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setVal(target * eased);
            if (t < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target, duration]);
    return val;
}

function AnimatedAmount({ value }: { value: number }) {
    const v = useCountUp(value);
    return <>{fmtAmt(v)}</>;
}

// ─── Image lightbox ─────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e1f3d]/70 p-4 backdrop-blur-md animate-[wpFade_.2s_ease]"
        >
            <button onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white">
                <X className="h-5 w-5" />
            </button>
            <div onClick={e => e.stopPropagation()}
                className="relative max-h-[88vh] overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl animate-[wpZoom_.22s_cubic-bezier(0.16,1,0.3,1)]">
                <Image src={src} alt="Payment proof" width={420} height={900}
                    className="max-h-[88vh] w-auto object-contain" />
            </div>
        </div>
    );
}

// ─── Proof thumbnail (mobile-screenshot sized) ──────────────────────────────────

function ProofThumb({ src, onOpen, width = 150 }: { src: string; onOpen: () => void; width?: number }) {
    return (
        <button onClick={onOpen}
            style={{ width }}
            className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/40">
            <div className="relative aspect-[9/16] w-full">
                <Image src={src} alt="Payment proof" fill sizes={`${width}px`} className="object-cover" />
            </div>
            <span className="absolute inset-0 flex items-center justify-center bg-[#0e1f3d]/0 transition group-hover:bg-[#0e1f3d]/35">
                <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#0e1f3d] opacity-0 shadow transition group-hover:opacity-100">
                    <Maximize2 className="h-3 w-3" /> View
                </span>
            </span>
        </button>
    );
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function DepositTimer({ seconds }: { seconds: number }) {
    const pct = (seconds / TIMER_TOTAL) * 100;
    const urgent = seconds < 120;
    const critical = seconds < 60;
    const color = critical ? "text-rose-600" : urgent ? "text-amber-600" : "text-slate-500";
    const bar = critical ? "bg-rose-500" : urgent ? "bg-amber-500" : "bg-[#1e3a5f]";

    return (
        <div className="flex items-center gap-2.5 rounded-full border border-white/60 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
            <Timer className={`h-3.5 w-3.5 ${color} ${critical ? "animate-pulse" : ""}`} />
            <span className={`text-[13px] font-semibold tabular-nums ${color}`}>
                {padTime(Math.floor(seconds / 60))}:{padTime(seconds % 60)}
            </span>
            <span className="h-1 w-14 overflow-hidden rounded-full bg-slate-200/70">
                <span className={`block h-full rounded-full transition-all duration-1000 ${bar}`} style={{ width: `${pct}%` }} />
            </span>
        </div>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
    const map = {
        pending: "bg-amber-50 text-amber-700 ring-amber-200/70",
        approved: "bg-teal-50 text-teal-700 ring-teal-200/70",
        rejected: "bg-rose-50 text-rose-700 ring-rose-200/70",
    };
    const icons = {
        pending: <Clock className="h-3 w-3" />,
        approved: <CheckCircle2 className="h-3 w-3" />,
        rejected: <XCircle className="h-3 w-3" />,
    };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${map[status]}`}>
            {icons[status]}{status}
        </span>
    );
}

// ─── Deposit history row ──────────────────────────────────────────────────────

function DepositRow({ d, onPreview }: { d: DepositRequest; onPreview: (src: string) => void }) {
    const [expanded, setExpanded] = useState(false);
    const pmName = typeof d.paymentMethodId === "object" && d.paymentMethodId
        ? `${d.paymentMethodId.name} (${d.paymentMethodId.network})`
        : null;

    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setExpanded(o => !o)}
                className="group flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-slate-50/70"
            >
                <CoinToken currency={d.currency} size={38} />
                <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#0e1f3d]">{d.currency} {fmtAmt(d.amount)}</p>
                    <p className="text-[12px] text-slate-400">{fmtDate(d.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <StatusBadge status={d.status} />
                    <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>

            <div className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="space-y-2.5 border-t border-slate-100 bg-slate-50/60 px-5 pb-4 pt-3">
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
                        {d.paymentProofUrl && (
                            <div className="pt-1">
                                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Payment proof</p>
                                <ProofThumb src={d.paymentProofUrl} onOpen={() => onPreview(d.paymentProofUrl!)} />
                            </div>
                        )}
                        {d.status === "rejected" && d.adminNote && (
                            <div className="mt-1 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700 ring-1 ring-inset ring-rose-200/70">
                                <span className="font-semibold">Reason: </span>{d.adminNote}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Trust feature strip (static content) ───────────────────────────────────────

const TRUST = [
    { icon: ShieldCheck, title: "Bank-grade security", desc: "Every deposit is reviewed by our compliance team." },
    { icon: Lock, title: "Encrypted end-to-end", desc: "Your transaction data is protected at every step." },
    { icon: Zap, title: "Fast confirmations", desc: "Most deposits are credited within 1 business day." },
    { icon: Headphones, title: "24/7 support", desc: "Our team is here whenever you need a hand." },
];

// ─── Main page ────────────────────────────────────────────────────────────────

type HistoryFilter = "all" | "pending" | "approved" | "rejected";
type MainTab = "deposit" | "history";

function WalletPageContent() {
    const { user } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Remote data
    const [balances, setBalances] = useState<WalletBalance[]>([]);
    const [balancesLoading, setBalancesLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [pmLoading, setPmLoading] = useState(true);
    const [deposits, setDeposits] = useState<DepositRequest[]>([]);
    const [depositsLoading, setDepositsLoading] = useState(true);

    // Lightbox
    const [preview, setPreview] = useState<string | null>(null);

    // Tab — initialised from URL
    const [tab, setTabState] = useState<MainTab>(
        (searchParams.get("tab") as MainTab) ?? "deposit"
    );
    const [historyFilter, setHistoryFilterState] = useState<HistoryFilter>(
        (searchParams.get("status") as HistoryFilter) ?? "all"
    );

    // URL sync helpers
    const syncUrl = useCallback((nextTab: MainTab, nextFilter: HistoryFilter) => {
        const params = new URLSearchParams();
        params.set("tab", nextTab);
        if (nextTab === "history" && nextFilter !== "all") params.set("status", nextFilter);
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router]);

    const setTab = useCallback((t: MainTab) => {
        setTabState(t);
        syncUrl(t, t === "history" ? historyFilter : "all");
    }, [syncUrl, historyFilter]);

    // Deposit flow
    const [depositStep, setDepositStep] = useState<"select" | "proof" | "done">("select");
    const [selectedPmId, setSelectedPmId] = useState("");
    const [depositAmount, setDepositAmount] = useState("");

    // Proof fields
    const [txHash, setTxHash] = useState("");
    const [senderWallet, setSenderWallet] = useState("");
    const [note, setNote] = useState("");
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [createdDeposit, setCreatedDeposit] = useState<DepositRequest | null>(null);

    // Timer
    const [timeLeft, setTimeLeft] = useState(TIMER_TOTAL);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Field refs for focus-on-error
    const fileInputRef = useRef<HTMLInputElement>(null);
    const txHashRef = useRef<HTMLInputElement>(null);
    const senderWalletRef = useRef<HTMLInputElement>(null);

    // ── Timer management ──────────────────────────────────────────────────────

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(TIMER_TOTAL);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    toast.error("Session expired. Please start a new deposit.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        if (tab === "deposit") {
            startTimer();
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [tab, startTimer]);

    // When timer hits 0, reset form
    useEffect(() => {
        if (timeLeft === 0 && tab === "deposit") {
            resetDepositForm(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, tab]);

    // ── Fetchers ──────────────────────────────────────────────────────────────

    const fetchBalances = useCallback(async () => {
        if (!user?._id) return;
        setBalancesLoading(true);
        try {
            const res = await appClient.get("/api/transactions/fund-balances", {
                params: { userId: user._id, userModel: "Client" },
            });
            const raw = res.data as Record<string, unknown>;
            const arr: WalletBalance[] = Array.isArray(raw)
                ? (raw as unknown as WalletBalance[])
                : Array.isArray(raw.wallets)
                    ? (raw.wallets as WalletBalance[])
                    : Array.isArray(raw.data)
                        ? (raw.data as WalletBalance[])
                        : [];
            setBalances(arr.filter(b => typeof b.balance === "number" && Number.isFinite(b.balance)));
        } catch { /* silent */ } finally {
            setBalancesLoading(false);
        }
    }, [user?._id]);

    const fetchPaymentMethods = useCallback(async () => {
        setPmLoading(true);
        try {
            const res = await appClient.get("/api/payment-methods");
            const raw = res.data as Record<string, unknown> | unknown[];
            const arr = Array.isArray(raw) ? raw
                : Array.isArray((raw as Record<string, unknown>).data) ? (raw as Record<string, unknown>).data
                    : Array.isArray((raw as Record<string, unknown>).paymentMethods) ? (raw as Record<string, unknown>).paymentMethods
                        : [];
            setPaymentMethods(arr as PaymentMethod[]);
        } catch { /* silent */ } finally {
            setPmLoading(false);
        }
    }, []);

    const fetchDeposits = useCallback(async (status: HistoryFilter = "all") => {
        setDepositsLoading(true);
        try {
            const params: Record<string, string> = { page: "1", limit: "20" };
            if (status !== "all") params.status = status;
            const res = await appClient.get("/api/deposits/my", { params });
            const raw = res.data as Record<string, unknown>;
            const nested = (raw.deposits ?? raw.data ?? raw) as Record<string, unknown> | unknown[];
            const arr = Array.isArray(nested)
                ? nested
                : Array.isArray((nested as Record<string, unknown>).docs)
                    ? (nested as Record<string, unknown>).docs
                    : [];
            setDeposits(arr as DepositRequest[]);
        } catch { /* silent */ } finally {
            setDepositsLoading(false);
        }
    }, []);

    const setHistoryFilter = useCallback((filter: HistoryFilter) => {
        setHistoryFilterState(filter);
        syncUrl("history", filter);
        void fetchDeposits(filter);
    }, [syncUrl, fetchDeposits]);

    useEffect(() => {
        void fetchBalances();
        void fetchPaymentMethods();
        void fetchDeposits(historyFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchBalances, fetchPaymentMethods, fetchDeposits]);

    // ── Derived ───────────────────────────────────────────────────────────────

    const selectedPm = paymentMethods.find(m => m._id === selectedPmId);

    // ── Handlers ──────────────────────────────────────────────────────────────

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setProofFile(file);
        setProofPreview(URL.createObjectURL(file));
        setFieldErrors(prev => ({ ...prev, proof: "" }));
    }

    function resetDepositForm(restartTimer = true) {
        setDepositStep("select");
        setSelectedPmId("");
        setDepositAmount("");
        setTxHash("");
        setSenderWallet("");
        setNote("");
        setProofFile(null);
        setProofPreview(null);
        setFieldErrors({});
        setCreatedDeposit(null);
        if (restartTimer) startTimer();
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text)
            .then(() => toast.success("Copied!"))
            .catch(() => toast.error("Copy failed"));
    }

    function validateAndProceed() {
        const errors: Record<string, string> = {};
        if (!selectedPmId) errors.method = "Please select a payment method.";
        if (!depositAmount || Number(depositAmount) <= 0) errors.amount = "Please enter a valid amount.";
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;
        setDepositStep("proof");
    }

    async function handleSubmitDeposit() {
        if (!user?._id || !selectedPm) return;

        const errors: Record<string, string> = {};
        if (!txHash.trim()) errors.txHash = "Transaction hash is required.";
        if (!senderWallet.trim()) errors.senderWallet = "Sender wallet address is required.";
        setFieldErrors(errors);

        if (errors.txHash) {
            txHashRef.current?.focus();
            txHashRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        if (errors.senderWallet) {
            senderWalletRef.current?.focus();
            senderWalletRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setSubmitting(true);
        try {
            let proofUrl = "";
            if (proofFile) {
                setUploading(true);
                try {
                    proofUrl = await uploadToCloudinary(
                        proofFile,
                        user._id,
                        user.fullName ?? user.firstName ?? user._id
                    );
                } finally {
                    setUploading(false);
                }
            }
            const res = await appClient.post("/api/deposits/create", {
                userId: user._id,
                userModel: "Client",
                paymentMethodId: selectedPm._id,
                amount: Number(depositAmount) || 0,
                currency: selectedPm.currency,
                network: selectedPm.network,
                transactionHash: txHash.trim(),
                senderWalletAddress: senderWallet.trim(),
                ...(proofUrl ? { paymentProofUrl: proofUrl } : {}),
                ...(note.trim() ? { note: note.trim() } : {}),
            });
            const d = res.data as Record<string, unknown>;
            setCreatedDeposit((d.data ?? d) as DepositRequest);
            setDepositStep("done");
            if (timerRef.current) clearInterval(timerRef.current);
            void fetchDeposits();
            void fetchBalances();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            const msg = e?.response?.data?.message ?? "Failed to submit deposit.";
            setFieldErrors(prev => ({ ...prev, submit: msg }));
        } finally {
            setSubmitting(false);
        }
    }

    // ── Field styles ──────────────────────────────────────────────────────────

    const inputBase =
        "w-full rounded-xl border bg-white/80 px-4 py-3 text-[13.5px] text-[#0e1f3d] outline-none transition placeholder:text-slate-300 focus:ring-2 backdrop-blur";
    const inputOk = "border-slate-200 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/10";
    const inputErr = "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10";
    const primaryBtn =
        "group flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-[14px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(30,58,95,0.6)] transition hover:shadow-[0_16px_40px_-14px_rgba(30,58,95,0.7)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";
    const primaryStyle = { backgroundImage: "linear-gradient(to right, #1e3a5f, #2f5d92)" };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#eef2f9]">
            {/* Ambient gradient orbs (glassmorphism backdrop) */}
            <div className="pointer-events-none fixed -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#1e3a5f]/25 to-transparent blur-3xl" />
            <div className="pointer-events-none fixed right-[-10%] top-[20%] h-[380px] w-[380px] rounded-full bg-gradient-to-br from-teal-300/25 to-transparent blur-3xl" />
            <div className="pointer-events-none fixed bottom-[-10%] left-[30%] h-[360px] w-[360px] rounded-full bg-gradient-to-br from-indigo-300/20 to-transparent blur-3xl" />

            {/* keyframes */}
            <style jsx global>{`
                @keyframes wpFade { from { opacity: 0 } to { opacity: 1 } }
                @keyframes wpZoom { from { opacity: 0; transform: scale(.95) } to { opacity: 1; transform: scale(1) } }
                @keyframes wpRise { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
                .wp-rise { animation: wpRise .5s cubic-bezier(0.16,1,0.3,1) both; }
            `}</style>

            {/* ── Header ── */}
            <header className="relative border-b border-white/40 bg-white/60 px-5 py-7 backdrop-blur-xl sm:px-8">
                <div className="mx-auto max-w-5xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1e3a5f]/55">Treasury</p>
                    <h1 className="mt-1 font-serif text-[28px] leading-none text-[#0e1f3d] sm:text-[32px]">Wallet</h1>
                    <p className="mt-1.5 text-[13px] text-slate-500">Fund your account securely and track every deposit.</p>
                </div>
            </header>

            <div className="relative mx-auto max-w-5xl space-y-7 px-5 py-8 sm:px-8">

                {/* ── Balances ── */}
                <section className="wp-rise">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500">Balances</h2>
                        <button onClick={() => void fetchBalances()}
                            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1e3a5f] transition hover:text-[#16304f]">
                            <RefreshCw className={`h-3.5 w-3.5 ${balancesLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>

                    {balancesLoading ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-[116px] animate-pulse rounded-2xl bg-white/50" />)}
                        </div>
                    ) : balances.length === 0 ? (
                        <div className="rounded-3xl border border-white/60 bg-white/70 px-6 py-10 text-center shadow-[0_8px_40px_-20px_rgba(14,31,61,0.3)] backdrop-blur-xl">
                            <Wallet className="mx-auto h-9 w-9 text-slate-300" />
                            <p className="mt-3 text-[13px] text-slate-500">No balances yet. Make your first deposit to get started.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {balances.map((b, i) => {
                                const c = cur(b.currency);
                                return (
                                    <div key={b.currency}
                                        className="wp-rise group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_40px_-24px_rgba(14,31,61,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-24px_rgba(14,31,61,0.45)]"
                                        style={{ animationDelay: `${i * 70}ms` }}>
                                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-60 blur-2xl" style={{ background: c.brand + "33" }} />
                                        <div className="relative flex items-center justify-between">
                                            <CoinToken currency={b.currency} size={40} />
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${c.chip}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />{b.currency}
                                            </span>
                                        </div>
                                        <p className="relative mt-4 font-serif text-[27px] leading-none tracking-tight text-[#0e1f3d]">
                                            <AnimatedAmount value={b.balance} />
                                        </p>
                                        <p className="relative mt-1.5 text-[11.5px] text-slate-400">Available balance</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ── Tab card ── */}
                <div className="wp-rise overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_12px_50px_-28px_rgba(14,31,61,0.4)] backdrop-blur-xl" style={{ animationDelay: "120ms" }}>

                    {/* Tab bar */}
                    <div className="flex items-center gap-1 border-b border-white/50 px-3 pt-2">
                        {([
                            { key: "deposit", label: "New Deposit" },
                            { key: "history", label: "History" },
                        ] as const).map(({ key, label }) => (
                            <button key={key} onClick={() => setTab(key)}
                                className={`relative px-4 py-3 text-[13px] font-semibold transition focus:outline-none ${tab === key ? "text-[#1e3a5f]" : "text-slate-400 hover:text-slate-600"}`}>
                                {label}
                                {tab === key && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#3b6aa0]" />}
                            </button>
                        ))}

                        {tab === "history" && (
                            <button onClick={() => void fetchDeposits(historyFilter)}
                                className="ml-auto mr-2 flex items-center gap-1.5 self-center text-[12px] font-semibold text-[#1e3a5f] transition hover:text-[#16304f]">
                                <RefreshCw className={`h-3.5 w-3.5 ${depositsLoading ? "animate-spin" : ""}`} />Refresh
                            </button>
                        )}
                    </div>

                    {/* ═══════════════ DEPOSIT TAB ═══════════════ */}
                    {tab === "deposit" && (
                        <>
                            {/* ── Step header ── */}
                            <div className="flex items-start justify-between gap-4 border-b border-white/50 bg-gradient-to-r from-white/40 to-transparent px-6 py-5 sm:px-8">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        {depositStep === "select" ? "Step 1 of 2" : depositStep === "proof" ? "Step 2 of 2" : "Complete"}
                                    </p>
                                    <h2 className="mt-1 font-serif text-[21px] leading-tight text-[#0e1f3d] sm:text-[23px]">
                                        {depositStep === "select" && "Choose payment method"}
                                        {depositStep === "proof" && "Confirm your payment"}
                                        {depositStep === "done" && "Deposit submitted"}
                                    </h2>
                                    {selectedPm && depositStep !== "done" && (
                                        <p className="mt-1 text-[12.5px] text-slate-500">
                                            {selectedPm.name} · {selectedPm.currency} · {selectedPm.network}
                                        </p>
                                    )}
                                    {depositStep !== "done" && (
                                        <div className="mt-3.5 flex items-center gap-1.5">
                                            {["select", "proof"].map((s, i) => {
                                                const active = depositStep === s;
                                                const done = depositStep === "proof" && i === 0;
                                                return (
                                                    <span key={s}
                                                        className={`h-1.5 rounded-full transition-all duration-500 ${active ? "w-6 bg-[#1e3a5f]" : done ? "w-1.5 bg-[#1e3a5f]/40" : "w-1.5 bg-slate-200"}`} />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {depositStep !== "done" && (
                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <DepositTimer seconds={timeLeft} />
                                        {depositStep !== "select" && (
                                            <button onClick={() => resetDepositForm()}
                                                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition hover:text-rose-500">
                                                <X className="h-3 w-3" />restart
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Step 1: Method selection ── */}
                            {depositStep === "select" && (
                                <div className="space-y-6 p-6 sm:p-8">
                                    {pmLoading ? (
                                        <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-slate-400">
                                            <Loader2 className="h-5 w-5 animate-spin" />Loading payment methods…
                                        </div>
                                    ) : paymentMethods.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                                            <p className="text-[13px] text-slate-400">No payment methods available right now.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                                    Payment method {fieldErrors.method && <span className="ml-1 normal-case text-rose-500">— {fieldErrors.method}</span>}
                                                </p>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {paymentMethods.map((pm, i) => {
                                                        const active = selectedPmId === pm._id;
                                                        const c = cur(pm.currency);
                                                        return (
                                                            <button
                                                                key={pm._id}
                                                                onClick={() => { setSelectedPmId(pm._id); setFieldErrors(p => ({ ...p, method: "" })); }}
                                                                className={`wp-rise group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${active
                                                                    ? "border-[#1e3a5f] bg-white shadow-[0_10px_30px_-16px_rgba(14,31,61,0.5)] ring-2 ring-[#1e3a5f]/15"
                                                                    : "border-white/70 bg-white/60 hover:-translate-y-0.5 hover:border-[#1e3a5f]/30 hover:shadow-md"}`}
                                                                style={{ animationDelay: `${i * 50}ms` }}
                                                            >
                                                                {active && <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl" style={{ background: c.brand + "33" }} />}
                                                                <CoinToken currency={pm.currency} size={44} />
                                                                <div className="relative min-w-0 flex-1">
                                                                    <p className="text-[14px] font-semibold text-[#0e1f3d]">{pm.name}</p>
                                                                    <p className="text-[12px] text-slate-400">
                                                                        {pm.network}
                                                                        {pm.minDeposit > 0 && <span className="ml-2">· Min {pm.minDeposit} {pm.currency}</span>}
                                                                    </p>
                                                                </div>
                                                                {active && (
                                                                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-[#1e3a5f]">
                                                                        <Check className="h-3 w-3 text-white" />
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Payment details panel */}
                                            {selectedPm && (
                                                <div className="wp-rise overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur">
                                                    <div className="grid gap-0 sm:grid-cols-[auto_1fr]">
                                                        <div className="flex items-center justify-center border-b border-slate-200/70 p-7 sm:border-b-0 sm:border-r">
                                                            {selectedPm.qrCodeUrl ? (
                                                                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                                                    <Image src={selectedPm.qrCodeUrl} alt={`${selectedPm.name} QR code`}
                                                                        width={156} height={156} className="h-[156px] w-[156px] object-contain" />
                                                                </div>
                                                            ) : (
                                                                <div className="flex h-[156px] w-[156px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-300">
                                                                    <ImageIcon className="h-9 w-9" />
                                                                    <p className="mt-2 text-[11px]">No QR code</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-4 p-6">
                                                            {selectedPm.walletAddress && (
                                                                <div>
                                                                    <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                                        {selectedPm.type === "fiat" ? "Account / bank details" : "Wallet address"}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
                                                                        <span className="flex-1 break-all font-mono text-[12px] text-[#0e1f3d]">{selectedPm.walletAddress}</span>
                                                                        <button onClick={() => copyToClipboard(selectedPm.walletAddress)} title="Copy"
                                                                            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#1e3a5f] active:scale-90">
                                                                            <Copy className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {selectedPm.accountDetails && selectedPm.accountDetails !== selectedPm.walletAddress && (
                                                                <div>
                                                                    <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Bank details</p>
                                                                    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
                                                                        <p className="whitespace-pre-wrap text-[12px] text-[#0e1f3d]/80">{selectedPm.accountDetails}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-[12px]">
                                                                <div>
                                                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Network</p>
                                                                    <p className="mt-0.5 font-semibold text-[#0e1f3d]">{selectedPm.network}</p>
                                                                </div>
                                                                {selectedPm.processingTime && (
                                                                    <div>
                                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Processing</p>
                                                                        <p className="mt-0.5 font-semibold text-[#0e1f3d]">{selectedPm.processingTime}</p>
                                                                    </div>
                                                                )}
                                                                {selectedPm.minDeposit > 0 && (
                                                                    <div>
                                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Min</p>
                                                                        <p className="mt-0.5 font-semibold text-[#0e1f3d]">{selectedPm.minDeposit} {selectedPm.currency}</p>
                                                                    </div>
                                                                )}
                                                                {selectedPm.maxDeposit && (
                                                                    <div>
                                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Max</p>
                                                                        <p className="mt-0.5 font-semibold text-[#0e1f3d]">{selectedPm.maxDeposit} {selectedPm.currency}</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {selectedPm.instructions && (
                                                                <div>
                                                                    <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Instructions</p>
                                                                    <div
                                                                        className="text-[12.5px] leading-6 text-slate-500 [&_a]:text-[#1e3a5f] [&_a]:underline [&_b]:text-[#0e1f3d] [&_li]:mt-1 [&_ol]:ml-4 [&_ol]:list-decimal [&_strong]:text-[#0e1f3d] [&_ul]:ml-4 [&_ul]:list-disc"
                                                                        dangerouslySetInnerHTML={{ __html: selectedPm.instructions }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Amount */}
                                            {selectedPm && (
                                                <div>
                                                    <label className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] ${fieldErrors.amount ? "text-rose-500" : "text-slate-400"}`}>
                                                        Amount ({selectedPm.currency}) {fieldErrors.amount && `— ${fieldErrors.amount}`}
                                                    </label>
                                                    <div className={`flex h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 ${fieldErrors.amount ? "border-rose-300 focus-within:ring-rose-500/10" : "border-slate-200 focus-within:border-[#1e3a5f] focus-within:ring-[#1e3a5f]/10"}`}>
                                                        <CoinToken currency={selectedPm.currency} size={30} />
                                                        <input type="number" placeholder="0.00" value={depositAmount}
                                                            onChange={e => { setDepositAmount(e.target.value); setFieldErrors(p => ({ ...p, amount: "" })); }}
                                                            className="w-full bg-transparent text-[17px] font-semibold text-[#0e1f3d] outline-none" />
                                                        <span className="text-[13px] font-semibold text-slate-400">{selectedPm.currency}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <button onClick={validateAndProceed} disabled={pmLoading} className={primaryBtn} style={primaryStyle}>
                                                I&apos;ve completed the payment
                                                <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ── Step 2: Proof ── */}
                            {depositStep === "proof" && selectedPm && (
                                <div className="space-y-5 p-6 sm:p-8">
                                    <div className="flex items-center gap-3.5 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur">
                                        <CoinToken currency={selectedPm.currency} size={42} />
                                        <div className="flex-1">
                                            <p className="text-[14.5px] font-semibold text-[#0e1f3d]">{selectedPm.name}</p>
                                            <p className="text-[12px] text-slate-400">{selectedPm.network} · {depositAmount} {selectedPm.currency}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cur(selectedPm.currency).chip}`}>
                                            {selectedPm.currency}
                                        </span>
                                    </div>

                                    {/* Screenshot */}
                                    <div>
                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                            Payment screenshot <span className="normal-case text-slate-300">(optional)</span>
                                        </p>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        {proofPreview ? (
                                            <div className="relative w-[160px]">
                                                <ProofThumb src={proofPreview} onOpen={() => setPreview(proofPreview)} width={160} />
                                                <button onClick={() => { setProofFile(null); setProofPreview(null); }}
                                                    className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-md ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-90">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => fileInputRef.current?.click()}
                                                className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 py-10 text-slate-400 transition hover:border-[#1e3a5f]/40 hover:bg-[#1e3a5f]/[0.03] hover:text-[#1e3a5f]">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 p-3">
                                                    <ImageIcon className="h-7 w-7" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[13.5px] font-semibold">Upload payment screenshot</p>
                                                    <p className="mt-0.5 text-[12px]">PNG, JPG, WEBP supported</p>
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    {/* Tx hash */}
                                    <div>
                                        <label className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] ${fieldErrors.txHash ? "text-rose-500" : "text-slate-400"}`}>
                                            Transaction hash <span className="text-rose-400">*</span>
                                            {fieldErrors.txHash && <span className="ml-2 normal-case">— {fieldErrors.txHash}</span>}
                                        </label>
                                        <input ref={txHashRef} type="text" placeholder="0x… or txid" value={txHash}
                                            onChange={e => { setTxHash(e.target.value); setFieldErrors(p => ({ ...p, txHash: "" })); }}
                                            className={`${inputBase} font-mono ${fieldErrors.txHash ? inputErr : inputOk}`} />
                                    </div>

                                    {/* Sender wallet */}
                                    <div>
                                        <label className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] ${fieldErrors.senderWallet ? "text-rose-500" : "text-slate-400"}`}>
                                            Your wallet address <span className="text-rose-400">*</span>
                                            {fieldErrors.senderWallet && <span className="ml-2 normal-case">— {fieldErrors.senderWallet}</span>}
                                        </label>
                                        <input ref={senderWalletRef} type="text" placeholder="The address you sent from" value={senderWallet}
                                            onChange={e => { setSenderWallet(e.target.value); setFieldErrors(p => ({ ...p, senderWallet: "" })); }}
                                            className={`${inputBase} font-mono ${fieldErrors.senderWallet ? inputErr : inputOk}`} />
                                    </div>

                                    {/* Note */}
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                            Note <span className="normal-case text-slate-300">(optional)</span>
                                        </label>
                                        <textarea rows={2} placeholder="Any additional information…" value={note}
                                            onChange={e => setNote(e.target.value)}
                                            className={`${inputBase} resize-none ${inputOk}`} />
                                    </div>

                                    {fieldErrors.submit && (
                                        <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700 ring-1 ring-inset ring-rose-200/70">
                                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                            {fieldErrors.submit}
                                        </div>
                                    )}

                                    <button onClick={handleSubmitDeposit} disabled={submitting || uploading} className={primaryBtn} style={primaryStyle}>
                                        {uploading ? (<><Loader2 className="h-[18px] w-[18px] animate-spin" />Uploading proof…</>)
                                            : submitting ? (<><Loader2 className="h-[18px] w-[18px] animate-spin" />Submitting…</>)
                                                : (<>Submit deposit request <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" /></>)}
                                    </button>

                                    <button onClick={() => setDepositStep("select")} disabled={submitting}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/60 py-3 text-[13px] font-semibold text-slate-500 transition hover:bg-white disabled:opacity-40">
                                        <ArrowLeft className="h-4 w-4" />Back to method
                                    </button>
                                </div>
                            )}

                            {/* ── Step 3: Done ── */}
                            {depositStep === "done" && (
                                <div className="p-8 sm:p-12">
                                    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                        <div className="relative flex h-20 w-20 items-center justify-center">
                                            <div className="absolute inset-0 animate-ping rounded-full bg-teal-100 opacity-40" />
                                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-200/70 animate-[wpZoom_.35s_cubic-bezier(0.16,1,0.3,1)]">
                                                <Check className="h-10 w-10 text-white" strokeWidth={3} />
                                            </div>
                                        </div>

                                        <h3 className="mt-6 font-serif text-[24px] leading-tight text-[#0e1f3d]">Deposit submitted</h3>
                                        <p className="mt-2.5 text-[13.5px] leading-6 text-slate-500">
                                            We&apos;ve received your request. Your wallet will be credited once our team approves it — usually within 1 business day.
                                        </p>

                                        {createdDeposit && (
                                            <div className="mt-6 w-full space-y-3 rounded-2xl border border-white/60 bg-white/70 p-5 text-left backdrop-blur">
                                                {[["Currency", createdDeposit.currency], ["Amount", fmtAmt(createdDeposit.amount)], ["Status", null]].map(([label, value]) => (
                                                    <div key={label as string} className="flex items-center justify-between text-[13px]">
                                                        <span className="text-slate-400">{label}</span>
                                                        {value ? <span className="font-semibold text-[#0e1f3d]">{value}</span> : <StatusBadge status="pending" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-6 flex w-full gap-3">
                                            <button onClick={() => resetDepositForm()}
                                                className="h-11 flex-1 rounded-xl border border-[#1e3a5f] text-[13px] font-semibold text-[#1e3a5f] transition hover:bg-[#1e3a5f]/[0.04]">
                                                New deposit
                                            </button>
                                            <button onClick={() => { setTab("history"); setHistoryFilter("all"); }}
                                                className="h-11 flex-1 rounded-xl text-[13px] font-semibold text-white transition hover:brightness-110"
                                                style={primaryStyle}>
                                                View history
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ═══════════════ HISTORY TAB ═══════════════ */}
                    {tab === "history" && (
                        <div>
                            {/* Filter pills */}
                            <div className="flex flex-wrap gap-2 border-b border-white/50 px-5 py-4">
                                {([
                                    { key: "all", label: "All" },
                                    { key: "pending", label: "Pending" },
                                    { key: "approved", label: "Approved" },
                                    { key: "rejected", label: "Rejected" },
                                ] as const).map(({ key, label }) => {
                                    const active = historyFilter === key;
                                    return (
                                        <button key={key} onClick={() => setHistoryFilter(key)}
                                            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${active
                                                ? "bg-[#1e3a5f] text-white shadow-sm"
                                                : "bg-white/70 text-slate-500 ring-1 ring-slate-200 hover:bg-white hover:text-slate-700"}`}>
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            {depositsLoading ? (
                                <div className="flex items-center justify-center gap-2 py-14 text-[13px] text-slate-400">
                                    <Loader2 className="h-5 w-5 animate-spin" />Loading deposits…
                                </div>
                            ) : deposits.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Clock className="h-10 w-10 text-slate-300" />
                                    <p className="mt-3 text-[14px] font-semibold text-slate-400">No deposit requests yet.</p>
                                    <button onClick={() => setTab("deposit")}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#16304f]">
                                        <Plus className="h-4 w-4" />Make your first deposit
                                    </button>
                                </div>
                            ) : (
                                deposits.map(d => <DepositRow key={d._id} d={d} onPreview={setPreview} />)
                            )}
                        </div>
                    )}

                </div>

                {/* New deposit shortcut (history tab) */}
                {tab === "history" && (
                    <div className="flex justify-end">
                        <button onClick={() => { setTab("deposit"); resetDepositForm(); }}
                            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[13px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(30,58,95,0.6)] transition hover:brightness-110"
                            style={primaryStyle}>
                            <Plus className="h-4 w-4" />New deposit
                        </button>
                    </div>
                )}

                {/* ── Trust strip (static content) ── */}
                <section className="wp-rise" style={{ animationDelay: "180ms" }}>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {TRUST.map(({ icon: Icon, title, desc }) => (
                            <div key={title}
                                className="group rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-md">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e3a5f]/10 text-[#1e3a5f] transition-colors group-hover:bg-[#1e3a5f] group-hover:text-white">
                                    <Icon className="h-[18px] w-[18px]" />
                                </div>
                                <p className="mt-3 text-[13px] font-semibold text-[#0e1f3d]">{title}</p>
                                <p className="mt-1 text-[12px] leading-5 text-slate-500">{desc}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400">
                        <Lock className="h-3 w-3" /> Secured &amp; encrypted · Your funds and data are protected
                    </p>
                </section>

            </div>

            {/* Lightbox */}
            {preview && <Lightbox src={preview} onClose={() => setPreview(null)} />}
        </div>
    );
}

export default function WalletPage() {
    return (
        <Suspense fallback={null}>
            <WalletPageContent />
        </Suspense>
    );
}