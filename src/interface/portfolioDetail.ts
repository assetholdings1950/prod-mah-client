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

export interface WalletBalance { currency: string; balance: number; }

export const LOCK_SECONDS = 600;
