import type { IBankDetail, IWalletDetail } from "@/interface/payment";

export interface PaymentMethod {
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

export interface WalletBalance {
    currency: string;
    balance: number;
}

export interface DepositRequest {
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

export interface WithdrawalRequest {
    _id: string;
    amount: number;
    currency: string;
    withdrawalMethod: "bank" | "wallet";
    bankDetailId?: IBankDetail | string | null;
    walletId?: IWalletDetail | string | null;
    note?: string;
    status: "pending" | "approved" | "rejected";
    adminNote?: string;
    createdAt: string;
}

export type HistoryFilter = "all" | "pending" | "approved" | "rejected";
export type MainTab = "deposit" | "history";
export type DepositStep = "select" | "payment" | "proof" | "done";
