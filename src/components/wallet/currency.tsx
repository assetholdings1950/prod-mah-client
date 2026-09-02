const CURRENCY: Record<string, { ring: string; chip: string; dot: string }> = {
    BTC:  { ring: "ring-amber-200/70",   chip: "bg-amber-50 text-amber-700",   dot: "bg-amber-500"   },
    ETH:  { ring: "ring-indigo-200/70",  chip: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500"  },
    USDT: { ring: "ring-teal-200/70",    chip: "bg-teal-50 text-teal-700",     dot: "bg-teal-500"    },
    SOL:  { ring: "ring-violet-200/70",  chip: "bg-violet-50 text-violet-700", dot: "bg-violet-500"  },
    TRX:  { ring: "ring-rose-200/70",    chip: "bg-rose-50 text-rose-700",     dot: "bg-rose-500"    },
    USD:  { ring: "ring-emerald-200/70", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

export const cur = (c: string) =>
    CURRENCY[c?.toUpperCase()] ?? { ring: "ring-slate-200", chip: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };

export function getCurrencyIcon(currency: string) {
    const code = currency?.toUpperCase();

    if (code === "BTC") return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
            <circle cx="20" cy="20" r="20" fill="#F7931A" />
            <text x="20" y="26" textAnchor="middle" fontSize="21" fontWeight="700" fill="white" fontFamily="Arial, sans-serif">₿</text>
        </svg>
    );

    if (code === "SOL") return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
            <defs>
                <linearGradient id="solana-wallet-icon" x1="8" x2="32" y1="32" y2="8" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#14F195" />
                    <stop offset="0.5" stopColor="#80ECFF" />
                    <stop offset="1" stopColor="#9945FF" />
                </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="20" fill="#05070D" />
            <path d="M12.2 12.8c.28-.32.68-.5 1.1-.5h17.1c.63 0 .96.75.54 1.22l-3.1 3.45c-.28.32-.68.5-1.1.5H9.64c-.63 0-.96-.75-.54-1.22l3.1-3.45Z" fill="url(#solana-wallet-icon)" />
            <path d="M12.2 23.02c.28-.32.68-.5 1.1-.5h17.1c.63 0 .96.75.54 1.22l-3.1 3.45c-.28.32-.68.5-1.1.5H9.64c-.63 0-.96-.75-.54-1.22l3.1-3.45Z" fill="url(#solana-wallet-icon)" />
            <path d="M27.8 17.92c-.28-.32-.68-.5-1.1-.5H9.6c-.63 0-.96.75-.54 1.22l3.1 3.45c.28.32.68.5 1.1.5h17.1c.63 0 .96-.75.54-1.22l-3.1-3.45Z" fill="url(#solana-wallet-icon)" />
        </svg>
    );

    if (code === "ETH") return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
            <circle cx="20" cy="20" r="20" fill="#627EEA" />
            <path d="M20 7.5 12 20.15 20 16.5l8 3.65L20 7.5Z" fill="white" fillOpacity="0.9" />
            <path d="M20 16.5 12 20.15 20 24.9l8-4.75-8-3.65Z" fill="white" fillOpacity="0.65" />
            <path d="M12 21.7 20 32.5l8-10.8-8 4.75-8-4.75Z" fill="white" fillOpacity="0.9" />
        </svg>
    );

    if (code === "USDT") return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
            <circle cx="20" cy="20" r="20" fill="#26A17B" />
            <path d="M9.2 10.2h21.6v5.2h-8v3.05c5.15.24 9.02 1.24 9.02 2.43s-3.87 2.19-9.02 2.43v6.5h-5.6v-6.5c-5.14-.24-9.02-1.24-9.02-2.43s3.88-2.19 9.02-2.43V15.4h-8v-5.2Zm8 10.35c-3.2.16-5.56.58-5.56 1.08s2.36.92 5.56 1.08v-2.16Zm5.6 2.16c3.2-.16 5.56-.58 5.56-1.08s-2.36-.92-5.56-1.08v2.16Z" fill="white" />
        </svg>
    );

    if (code === "USDC") return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
            <circle cx="20" cy="20" r="20" fill="#2775CA" />
            <path d="M15.2 28.6a10.6 10.6 0 0 1 0-17.2l1.35 2.15a8.08 8.08 0 0 0 0 12.9L15.2 28.6Zm9.6 0-1.35-2.15a8.08 8.08 0 0 0 0-12.9l1.35-2.15a10.6 10.6 0 0 1 0 17.2Z" fill="white" fillOpacity="0.9" />
            <path d="M20.6 10.4v2.15c2.25.2 3.95 1.4 4.55 3.3l-2.55 1.05c-.38-1.18-1.3-1.82-2.62-1.82-1.22 0-2.02.55-2.02 1.38 0 .95.92 1.2 2.95 1.58 2.58.48 4.55 1.25 4.55 3.98 0 2.18-1.55 3.73-4.05 4.12v2.46h-2.3v-2.4c-2.65-.25-4.5-1.65-5.1-3.9l2.65-.95c.38 1.43 1.52 2.25 3.12 2.25 1.43 0 2.35-.58 2.35-1.48 0-1.02-1-1.32-3.08-1.72-2.38-.45-4.38-1.2-4.38-3.82 0-2.08 1.48-3.6 3.83-4V10.4h2.1Z" fill="white" />
        </svg>
    );

    if (code === "TRX") return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
            <circle cx="20" cy="20" r="20" fill="#EF0027" />
            <path d="M10 8.8 31.5 13 20.2 32.2 10 8.8Zm3.25 3.4 6.72 15.4 1.75-10.1-8.47-5.3Zm1.68-1.02 8.2 5.12 4.65-2.52-12.85-2.6Zm8.32 7.33-1.56 9.07 6.5-11.05-4.94 1.98Z" fill="white" />
        </svg>
    );

    if (code === "USD") return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
            <circle cx="20" cy="20" r="20" fill="#16A34A" />
            <text x="20" y="27" textAnchor="middle" fontSize="22" fontWeight="700" fill="white" fontFamily="Arial, sans-serif">$</text>
        </svg>
    );

    return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
            <circle cx="20" cy="20" r="19" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            <text x="20" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0F172A" fontFamily="Arial, sans-serif">
                {(code || "?").slice(0, 4)}
            </text>
        </svg>
    );
}

export function CoinToken({ currency, size = 40 }: { currency: string; size?: number }) {
    const c = cur(currency);
    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-white ring-1 ${c.ring}`}
            style={{ height: size, width: size }}
        >
            {getCurrencyIcon(currency)}
        </div>
    );
}
