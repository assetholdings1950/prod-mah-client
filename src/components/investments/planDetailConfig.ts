import { Banknote, BarChart3, Bitcoin, CalendarDays, LockKeyhole, TrendingUp, Wallet } from "lucide-react";
import type { InvestmentPlanInterface } from "@/interface/investmentPlan";

export interface ConversionResult {
    status: boolean;
    source: string;
    amount: number;
    from: { code: string; name: string; unit: string; type: string };
    to: { code: string; name: string; unit: string; type: string };
    rate: number;
    convertedAmount: number;
    lastUpdated: string;
}

export const LOCK_SECONDS = 600;

export const RISK_CONFIG = {
    low: { label: "Low", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
    medium: { label: "Medium", className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
    high: { label: "High", className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" },
    very_high: { label: "Very High", className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" },
};

export const CATEGORY_CONFIG = {
    monthly: { label: "Monthly SIP", eyebrow: "Monthly SIP Fund", Icon: BarChart3 },
    lumpsum: { label: "Lump Sum", eyebrow: "Lump Sum Fund", Icon: Banknote },
    crypto: { label: "Digital Assets", eyebrow: "Digital Asset Fund", Icon: Bitcoin },
};

export const PAYOUT_LABEL: Record<InvestmentPlanInterface["payoutType"], string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    maturity: "At Maturity",
};

export const HOW_IT_WORKS: Record<
    InvestmentPlanInterface["category"],
    (plan: InvestmentPlanInterface) => { icon: typeof CalendarDays; title: string; desc: string }[]
> = {
    monthly: () => [
        { icon: CalendarDays, title: "Invest every month", desc: "Choose a fixed amount and contribute it every month — as simple as a standing instruction." },
        { icon: TrendingUp, title: "Your money grows", desc: "Each contribution is invested and grows steadily over your chosen SIP period." },
        { icon: Wallet, title: "Withdraw at maturity", desc: "Once your plan matures, withdraw your full contributions plus the interest earned." },
    ],
    lumpsum: plan => [
        { icon: Banknote, title: "Invest once", desc: "Make a single investment to get started — no recurring payments needed." },
        { icon: LockKeyhole, title: `${plan.lockInMonths ?? 12}-month lock-in`, desc: "Your money stays invested for this period so it has time to grow." },
        { icon: Wallet, title: "Withdraw with interest", desc: "Once the lock-in period ends, withdraw your full investment plus interest earned." },
    ],
    crypto: () => [
        { icon: Bitcoin, title: "Invest once", desc: "Allocate your funds in a single investment into our digital asset strategy." },
        { icon: CalendarDays, title: "Earn monthly payouts", desc: "Every month, interest earned on your investment becomes available to you." },
        { icon: Wallet, title: "Withdraw anytime", desc: "Withdraw your monthly payout in full, in part, or let it stay invested — your choice." },
    ],
};

export function toNum(v: unknown, fallback = NaN) {
    return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export const fmt = (v: unknown) => {
    const n = toNum(v);
    if (!Number.isFinite(n)) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
};

export const fmtROI = (plan: InvestmentPlanInterface) => {
    const min = toNum(plan.roiMin);
    const max = toNum(plan.roiMax, min);
    if (!Number.isFinite(min)) return "N/A";
    return plan.roiType === "fixed" || min === max ? `${min}%` : `${min}% – ${max}%`;
};

export const fmtDuration = (minV: unknown, maxV: unknown) => {
    const min = toNum(minV);
    const max = toNum(maxV, min);
    if (!Number.isFinite(min)) return "Flexible";
    return min === max ? `${min} Months` : `${min} – ${max} Months`;
};

export function fmtCountdown(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function fmtCrypto(n: number, decimals = 6) {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: decimals }).format(n);
}

export const isPlan = (v: unknown): v is InvestmentPlanInterface =>
    !!v && typeof v === "object" && "name" in v && "slug" in v && "minAmount" in v;

export function parsePlan(payload: unknown): InvestmentPlanInterface | null {
    const d = payload as { data?: unknown; plan?: unknown; investmentPlan?: unknown };
    if (isPlan(d?.plan)) return d.plan;
    if (isPlan(d?.investmentPlan)) return d.investmentPlan;
    if (isPlan(d?.data)) return d.data;
    return null;
}

export function parsePlanList(payload: unknown): InvestmentPlanInterface[] {
    const d = payload as { data?: unknown; plans?: unknown; investmentPlans?: unknown };
    const raw = d?.data ?? d?.plans ?? d?.investmentPlans;
    if (Array.isArray(raw)) return raw;
    const obj = raw as { docs?: InvestmentPlanInterface[] } | undefined;
    return obj?.docs ?? [];
}

/* ── Fund documents ──────────────────────────────────────────────────────────
   Fact sheets live in /public/funds-pdfs so the browser can stream them
   directly; files under src/ are not publicly routable. Add a fund's entry
   here once its PDF is dropped into that folder. */

export interface FundDocument {
    title: string;
    kind: string;
    href: string;
    /** Bytes — shown to the reader before they commit to a download. */
    size: number;
    updated: string;
    pages: number;
    description: string;
}

export const FUND_DOCUMENTS: Record<string, FundDocument[]> = {
    "trontrx-investment-fund": [
        {
            title: "Tron (TRX) Investment Fund — Fact Sheet",
            kind: "Fact Sheet",
            href: "/funds-pdfs/Tron-TRX-Investment-Fund.pdf",
            size: 289246,
            updated: "August 12, 2026",
            pages: 2,
            description:
                "The full investor fact sheet: the contracted rate of 18% p.a. over 12–60 months, a 1% platform fee, target strategy allocation, illustrative returns at each subscription level, and the fund's risk disclosures.",
        },
    ],
    "solana": [
        {
            title: "Solana (SOL) Investment Fund — Fact Sheet",
            kind: "Fact Sheet",
            href: "/funds-pdfs/Solana-SOL-Investment-Fund.pdf",
            size: 286263,
            updated: "August 12, 2026",
            pages: 2,
            description:
                "The full investor fact sheet: the contracted rate of 12% p.a. over 12–60 months, no platform fee, target strategy allocation, illustrative returns at each subscription level, and the fund's risk disclosures.",
        },
    ],
    "global-digital-index-fund": [
        {
            title: "Global Digital Index Fund — Fact Sheet",
            kind: "Fact Sheet",
            href: "/funds-pdfs/Global-Digital-Index-Fund.pdf",
            size: 289906,
            updated: "August 12, 2026",
            pages: 2,
            description:
                "The full investor fact sheet: the contracted rate of 22–25% p.a. over 12–60 months, a 1% platform fee, target strategy allocation, illustrative returns at each subscription level, and the fund's risk disclosures.",
        },
    ],
    "blue-chip-digital-fund": [
        {
            title: "Blue Chip Digital Fund — Fact Sheet",
            kind: "Fact Sheet",
            href: "/funds-pdfs/Blue-Chip-Digital-Fund.pdf",
            size: 283078,
            updated: "August 12, 2026",
            pages: 2,
            description:
                "The full investor fact sheet: the contracted rate of 18% p.a. over 12–60 months, a 2% platform fee, target strategy allocation, illustrative returns at each subscription level, and the fund's risk disclosures.",
        },
    ],
    "crypto-index-fund": [
        {
            title: "Crypto Index Fund — Fact Sheet",
            kind: "Fact Sheet",
            href: "/funds-pdfs/Crypto-Index-Fund.pdf",
            size: 283990,
            updated: "August 12, 2026",
            pages: 2,
            description:
                "The full investor fact sheet: the contracted rate of 15% p.a. over 12–60 months, a 1% platform fee, target strategy allocation, illustrative returns at each subscription level, and the fund's risk disclosures.",
        },
    ],
    "micro-income-fund": [
        {
            title: "Micro Income Fund — Fact Sheet",
            kind: "Fact Sheet",
            href: "/funds-pdfs/Micro-Income-Fund.pdf",
            size: 282015,
            updated: "August 12, 2026",
            pages: 2,
            description:
                "The full investor fact sheet: the contracted rate of 8% p.a. over 12–60 months, no platform fee, target strategy allocation, illustrative returns at each subscription level, and the fund's risk disclosures.",
        },
    ],
    "bitcoin-investment-fund": [
        {
            title: "Bitcoin Investment Fund — Fact Sheet",
            kind: "Fact Sheet",
            href: "/funds-pdfs/Bitcoin-Investment-Fund.pdf",
            size: 287911,
            updated: "August 12, 2026",
            pages: 2,
            description:
                "The full investor fact sheet: the contracted rate of 13% p.a. over 12–60 months, a 1.5% platform fee, target strategy allocation, illustrative returns at each subscription level, and the fund's risk disclosures.",
        },
    ],
    "ethereum-eth-investment-fund": [
        {
            title: "Ethereum (ETH) Investment Fund — Fact Sheet",
            kind: "Fact Sheet",
            href: "/funds-pdfs/Ethereum-ETH-Investment-Fund.pdf",
            size: 286759,
            updated: "August 12, 2026",
            pages: 2,
            description:
                "The full investor fact sheet: the contracted rate of 15% p.a. over 12–60 months, no platform fee, target strategy allocation, illustrative returns at each subscription level, and the fund's risk disclosures.",
        },
    ],
    "large-income-fund": [
        {
            title: "Large Income Fund — Fact Sheet",
            kind: "Fact Sheet",
            href: "/funds-pdfs/Large-Income-Fund.pdf",
            size: 281291,
            updated: "August 12, 2026",
            pages: 2,
            description:
                "The full investor fact sheet: the contracted rate of 12% p.a. over 12–60 months, no platform fee, target strategy allocation, illustrative returns at each subscription level, and the fund's risk disclosures.",
        },
    ],
    "tether-usdt-investment-fund": [
        {
            title: "Tether (USDT) Investment Fund — Fact Sheet",
            kind: "Fact Sheet",
            href: "/funds-pdfs/Tether-USDT-Investment-Fund.pdf",
            size: 287313,
            updated: "August 12, 2026",
            pages: 2,
            description:
                "The full investor fact sheet: the contracted rate of 8% p.a. over 12–60 months, no platform fee, target strategy allocation, illustrative returns at each subscription level, and the fund's risk disclosures.",
        },
    ],
};

export const getFundDocuments = (slug?: string): FundDocument[] =>
    (slug && FUND_DOCUMENTS[slug]) || [];

export function fmtFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
