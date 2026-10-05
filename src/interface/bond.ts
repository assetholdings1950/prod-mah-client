export type BondRiskLevel = "low" | "medium" | "high" | "very_high";
export type CouponFrequency = "monthly" | "quarterly" | "semiannual" | "annual" | "maturity";

export interface BondInterface {
    _id: string;
    name: string;
    code: string;
    slug: string;
    shortDescription?: string;
    description?: string;
    currency: "USD";
    minInvestment: number;
    maxInvestment?: number | null;
    termMonths: number;
    couponRateAnnual: number;
    couponFrequency: CouponFrequency;
    riskLevel: BondRiskLevel;
    earlyRedemptionAllowed: boolean;
    termsAndConditions?: string;
    riskDisclosure?: string;
    usdtBenefitEnabled?: boolean;
    usdtBenefitPercent?: number;
    usdtLockType?: "same_as_bond" | "custom";
    usdtLockMonths?: number | null;
    usdtUnlockMethod?: "automatic" | "admin_approval";
    usdtDescription?: string;
    usdtDisclosure?: string;
    minHoldingMonths?: number;
    noticeDays?: number;
    principalPenaltyPercent?: number;
    usdtEarlyExitTreatment?: "full_forfeit" | "partial_forfeit" | "retain" | "admin_review";
    usdtPartialForfeitPercent?: number | null;
    unpaidCouponTreatment?: "forfeit" | "pay_accrued" | "admin_review";
    paidCouponTreatment?: "no_clawback" | "full_clawback" | "partial_clawback";
    paidCouponClawbackPercent?: number | null;
    redemptionFeePercent?: number;
    earlyRedemptionTerms?: string;
    offeringDocumentUrl?: string;
    termSheetUrl?: string;
}

export interface BondPageResult {
    docs: BondInterface[];
    totalDocs: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
