import type { ClientPortfolioInterface } from "@/interface/portfolio";
import { addMonths } from "@/utils/portfolioHelpers";

export type InstallmentStatus = "paid" | "missed" | "upcoming";

export interface ScheduleRow {
    period: string;
    date: Date;
    periodicAmount: number;
    cumulative: number;
    isMaturity: boolean;
    installmentStatus?: InstallmentStatus;
}

export function buildPayoutSchedule(portfolio: ClientPortfolioInterface): ScheduleRow[] {
    const snap = portfolio.planSnapshot;
    const roiMin = snap.roiMin ?? 0;
    const payoutType = snap.payoutType;
    const amountUsd = portfolio.amountUsd;
    const duration = portfolio.durationMonths;
    const start = new Date(portfolio.startedAt);
    const monthlyInt = (amountUsd * roiMin / 100) / 12;
    const rows: ScheduleRow[] = [];

    const shortMonth = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    if (portfolio.investmentMode === "sip") {
        const totalInst = portfolio.sip?.totalInstallments ?? duration;

        if (payoutType === "maturity") {
            const paid   = portfolio.sip?.paidInstallments   ?? 0;
            const missed = portfolio.sip?.missedInstallments ?? 0;
            const now    = new Date();
            let cum = 0;
            for (let i = 0; i < totalInst; i++) {
                const remainingMonths = Math.max(1, duration - i);
                const lotProfit = monthlyInt * remainingMonths;
                cum += lotProfit;
                const installmentDate = addMonths(start, i);
                let installmentStatus: InstallmentStatus;
                if (i < paid) {
                    installmentStatus = "paid";
                } else if (i < paid + missed || installmentDate < now) {
                    installmentStatus = "missed";
                } else {
                    installmentStatus = "upcoming";
                }
                rows.push({
                    period: `Installment ${i + 1} — ${shortMonth(addMonths(start, i))}`,
                    date: addMonths(start, duration),
                    periodicAmount: lotProfit,
                    cumulative: cum,
                    isMaturity: i === totalInst - 1,
                    installmentStatus,
                });
            }
        } else {
            const groupByYear = duration > 24;
            if (groupByYear) {
                const totalYears = Math.ceil(duration / 12);
                let totalCum = 0;
                for (let y = 1; y <= totalYears; y++) {
                    const yStart = (y - 1) * 12 + 1;
                    const yEnd = Math.min(y * 12, duration);
                    let yearTotal = 0;
                    for (let m = yStart; m <= yEnd; m++) {
                        yearTotal += Math.min(m, totalInst) * monthlyInt;
                    }
                    totalCum += yearTotal;
                    rows.push({
                        period: `Year ${y}`,
                        date: addMonths(start, yEnd),
                        periodicAmount: yearTotal,
                        cumulative: totalCum,
                        isMaturity: yEnd >= duration,
                    });
                }
            } else {
                let cum = 0;
                for (let m = 1; m <= duration; m++) {
                    const income = Math.min(m, totalInst) * monthlyInt;
                    cum += income;
                    rows.push({
                        period: shortMonth(addMonths(start, m)),
                        date: addMonths(start, m),
                        periodicAmount: income,
                        cumulative: cum,
                        isMaturity: m === duration,
                    });
                }
            }
        }
        return rows;
    }

    // ── Lumpsum / Crypto ─────────────────────────────────────────────────────

    if (payoutType === "monthly") {
        const groupByYear = duration > 24;
        if (groupByYear) {
            const totalYears = Math.ceil(duration / 12);
            for (let y = 1; y <= totalYears; y++) {
                const elapsed = Math.min(y * 12, duration);
                const inPeriod = elapsed - (y - 1) * 12;
                rows.push({
                    period: `Year ${y}`,
                    date: addMonths(start, elapsed),
                    periodicAmount: monthlyInt * inPeriod,
                    cumulative: monthlyInt * elapsed,
                    isMaturity: elapsed >= duration,
                });
            }
        } else {
            for (let m = 1; m <= duration; m++) {
                rows.push({
                    period: shortMonth(addMonths(start, m)),
                    date: addMonths(start, m),
                    periodicAmount: monthlyInt,
                    cumulative: monthlyInt * m,
                    isMaturity: m === duration,
                });
            }
        }
    } else if (payoutType === "quarterly") {
        let cum = 0;
        for (let m = 3; m <= duration; m += 3) {
            const amount = monthlyInt * 3;
            cum += amount;
            rows.push({
                period: `Q${Math.round(m / 3)} — ${shortMonth(addMonths(start, m))}`,
                date: addMonths(start, m),
                periodicAmount: amount,
                cumulative: cum,
                isMaturity: m >= duration,
            });
        }
        const rem = duration % 3;
        if (rem > 0) {
            const amount = monthlyInt * rem;
            cum += amount;
            rows.push({
                period: `Final — ${shortMonth(addMonths(start, duration))}`,
                date: addMonths(start, duration),
                periodicAmount: amount,
                cumulative: cum,
                isMaturity: true,
            });
        }
    } else {
        // Maturity: year-by-year accrual
        for (let y = 1; y * 12 <= duration; y++) {
            const isFinal = y * 12 === duration;
            rows.push({
                period: `Year ${y}`,
                date: addMonths(start, y * 12),
                periodicAmount: monthlyInt * 12,
                cumulative: monthlyInt * y * 12,
                isMaturity: isFinal,
            });
        }
        const rem = duration % 12;
        if (rem > 0) {
            rows.push({
                period: "Maturity",
                date: addMonths(start, duration),
                periodicAmount: monthlyInt * rem,
                cumulative: monthlyInt * duration,
                isMaturity: true,
            });
        }
        if (rows.length > 0) rows[rows.length - 1].isMaturity = true;
    }

    return rows;
}
