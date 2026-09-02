export function fmtAmt(v: unknown) {
    const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function padTime(n: number) { return n.toString().padStart(2, "0"); }
