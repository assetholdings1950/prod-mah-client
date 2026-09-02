export interface PortfolioLot {
    _id: string;
    lotNo: number;
    amountUsd: number;
    paidCurrency: string;
    paidAmount: number;
    rate: number;
    source: string;
    walletTransactionId?: string | null;
    investedAt: string;
    maturityDate: string;
    monthlyInterestUsd: number;
    expectedProfitUsd: number;
    expectedMaturityValueUsd: number;
    status: "active" | "matured" | "closed";
}

export interface PortfolioSip {
    monthlyAmountUsd: number | null;
    totalInstallments: number | null;
    paidInstallments: number;
    missedInstallments: number;
    nextDueDate: string | null;
    lastPaidDate: string | null;
}

export interface PortfolioSummary {
    totalInvestedUsd: number;
    totalExpectedProfitUsd: number;
    totalPaidProfitUsd: number;
    currentValueUsd: number;
    expectedMaturityValueUsd: number;
    totalLots: number;
    activeLots: number;
    maturedLots: number;
}

export interface PortfolioPlanSnapshot {
    name: string;
    slug: string;
    category: "monthly" | "lumpsum" | "crypto";
    currency: string;
    roiType: "fixed" | "range";
    roiMin: number;
    roiMax?: number;
    roiPeriod: string;
    payoutType: "monthly" | "quarterly" | "maturity";
    riskLevel: "low" | "medium" | "high" | "very_high";
    lockInMonths?: number | null;
    exitPenaltyPercent?: number;
    minAmount?: number | null;
    maxAmount?: number | null;
}

export interface PortfolioPaidFromWallet {
    currency: string;
    amount: number;
    rate: number;
    source: string;
    convertedAt?: string;
    lockedAt?: string;
    lockedUntil?: string;
    walletTransactionId?: string | null;
}

export interface ClosedCharge {
    particular:    string;
    chargePercent: number;
    chargeUsd:     number;
}

export interface PortfolioClosedSummary {
    reason:           "maturity" | "early_exit" | "admin" | null;
    note:             string | null;
    principal:        number | null;
    earnedUsd:        number | null;
    penaltyPct:       number | null;
    penaltyUsd:       number | null;
    chargesBreakdown: ClosedCharge[];
    totalChargesUsd:  number;
    netRefundUsd:     number | null;
    payoutCurrency:   string | null;
    convertedAmount:  number | null;
    rate:             number | null;
}

export interface ClientPortfolioInterface {
    _id: string;
    clientId: string;
    userModel: "Client";
    portfolioId: string;
    planId: string | { _id: string; name: string; slug: string; category: string; status: string };
    planSnapshot: PortfolioPlanSnapshot;
    investmentMode: "sip" | "lumpsum";
    amountUsd: number;
    durationMonths: number;
    paidFromWallet: PortfolioPaidFromWallet;
    sip?: PortfolioSip;
    lots?: PortfolioLot[];
    summary: PortfolioSummary;
    startedAt: string;
    maturityDate: string;
    lockInEndDate?: string;
    closedAt?: string | null;
    closedSummary?: PortfolioClosedSummary | null;
    status: "active" | "paused" | "matured" | "closed" | "cancelled";
    createdAt: string;
    updatedAt: string;
}

export interface PortfolioListSummary {
    totalInvestedUsd: number;
    totalExpectedProfitUsd: number;
    totalCurrentValueUsd: number;
    activePortfolioCount: number;
    monthlySipCount: number;
    lumpsumCount: number;
}

export interface PortfolioListResponse {
    status: boolean;
    portfolios: ClientPortfolioInterface[];
    pagination: {
        total: number;
        page: number;
        totalPages: number;
        limit: number;
    };
    summary: PortfolioListSummary;
}

export interface PortfolioCreatePayload {
    planId: string;
    amountUsd: number;
    paymentCurrency: string;
    durationMonths: number;
    cryptoAmount: number;
    rate: number;
    source: string;
    lockedAt: string;
    lockedUntil: string;
    convertedAt?: string;
}
