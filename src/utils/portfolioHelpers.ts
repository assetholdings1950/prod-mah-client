export function fmt(v: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD", maximumFractionDigits: 0,
    }).format(v);
}

export function fmtFull(v: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(v);
}

export function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtCrypto(n: number) {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 }).format(n);
}

export function daysBetween(from: string, to: string) {
    return Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000));
}

export function fmtCountdown(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function addMonths(base: Date, months: number): Date {
    const d = new Date(base);
    d.setMonth(d.getMonth() + months);
    return d;
}
