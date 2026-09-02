"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle, ArrowRight, Building2, Check, ChevronDown,
    Loader2, Plus, Wallet, X,
} from "lucide-react";
import { toast } from "sonner";
import appClient from "@/lib/appClient";
import type { IBankDetail, IWalletDetail } from "@/interface/payment";
import type { WalletBalance } from "@/interface/wallet";
import { CoinToken } from "@/components/wallet/currency";
import { fmtAmt } from "@/utils/walletHelpers";
import { StatusBadge } from "@/components/wallet/StatusBadge";


interface WithdrawalModalProps {
    user: { _id: string; fullName?: string; firstName?: string } | null;
    balances: WalletBalance[];
    balancesLoading: boolean;
    bankDetails: IBankDetail[];
    clientWallets: IWalletDetail[];
    destinationsLoading: boolean;
    onClose: () => void;
    onSubmitSuccess: () => void;
    onOpenDepositModal: () => void;
}

const inputBase = "w-full rounded-xl border bg-white px-4 py-3 text-[13.5px] text-[#0e1f3d] outline-none transition placeholder:text-slate-300 focus:ring-2";
const inputOk = "border-slate-200 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/10";
const inputErr = "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10";

type WithdrawalStep = "form" | "review" | "done";

interface CreatedWithdrawal {
    _id: string;
    currency: string;
    amount: number;
    withdrawalMethod: string;
    status: "pending" | "approved" | "rejected";
}

export function WithdrawalModal({
    user, balances, balancesLoading, bankDetails, clientWallets,
    destinationsLoading, onClose, onSubmitSuccess, onOpenDepositModal,
}: WithdrawalModalProps) {
    const [step, setStep] = useState<WithdrawalStep>("form");
    const [method, setMethod] = useState<"bank" | "wallet">("wallet");
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedBankId, setSelectedBankId] = useState("");
    const [selectedWalletId, setSelectedWalletId] = useState("");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [created, setCreated] = useState<CreatedWithdrawal | null>(null);

    const selectedBank = bankDetails.find(b => b._id === selectedBankId);
    const selectedWallet = clientWallets.find(w => w._id === selectedWalletId);
    const selectedBalance = balances.find(b => b.currency === selectedCurrency);

    // Auto-pick first currency
    useEffect(() => {
        if (!selectedCurrency && balances.length > 0) {
            setSelectedCurrency(balances[0].currency);
        }
    }, [balances, selectedCurrency]);

    const validate = useCallback(() => {
        const errors: Record<string, string> = {};
        if (!selectedCurrency) errors.currency = "Select a currency to withdraw.";
        if (!amount || Number(amount) <= 0) errors.amount = "Enter a valid amount.";
        if (selectedBalance && Number(amount) > selectedBalance.balance) errors.amount = "Insufficient balance.";
        if (method === "bank" && !selectedBankId) errors.destination = "Select a bank account.";
        if (method === "wallet" && !selectedWalletId) errors.destination = "Select a wallet destination.";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [selectedCurrency, amount, selectedBalance, method, selectedBankId, selectedWalletId]);

    function handleContinue() {
        if (validate()) setStep("review");
    }

    async function handleSubmit() {
        if (!user?._id) return;
        if (!validate()) {
            setStep("form");
            return;
        }
        setSubmitting(true);
        try {
            const body: Record<string, unknown> = {
                userId: user._id,
                userModel: "Client",
                currency: selectedCurrency,
                amount: Number(amount),
                withdrawalMethod: method,
                ...(note.trim() ? { note: note.trim() } : {}),
            };
            if (method === "bank") body.bankDetailId = selectedBankId;
            if (method === "wallet") body.walletId = selectedWalletId;

            const res = await appClient.post("/api/withdrawals/create", body);
            const d = res.data as Record<string, unknown>;
            setCreated((d.data ?? d) as CreatedWithdrawal);
            setStep("done");
            onSubmitSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            const errMsg = e?.response?.data?.message ?? "Failed to submit withdrawal.";
            const lowerMsg = errMsg.toLowerCase();
            if (lowerMsg.includes("balance") || lowerMsg.includes("amount") || lowerMsg.includes("limit") || lowerMsg.includes("insufficient")) {
                setFieldErrors(prev => ({ ...prev, amount: errMsg }));
                setStep("form");
            } else if (lowerMsg.includes("wallet") || lowerMsg.includes("bank") || lowerMsg.includes("destination") || lowerMsg.includes("account")) {
                setFieldErrors(prev => ({ ...prev, destination: errMsg }));
                setStep("form");
            } else {
                setFieldErrors(prev => ({ ...prev, submit: errMsg }));
            }
        } finally {
            setSubmitting(false);
        }
    }

    function reset() {
        setStep("form");
        setAmount("");
        setNote("");
        setSelectedBankId("");
        setSelectedWalletId("");
        setFieldErrors({});
        setCreated(null);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#071F55]/40 px-4 py-6 backdrop-blur-md">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[20px] border border-[#D9E3F2] bg-white shadow-[0_35px_120px_rgba(7,31,85,0.26)]">
                <button onClick={onClose}
                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#D9E3F2] bg-white/90 text-[#5A78B8] shadow-sm transition hover:bg-white hover:text-[#071F55]"
                    aria-label="Close withdrawal modal">
                    <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="bg-white px-6 pb-5 pt-6 sm:px-8">
                    <div className="pr-10">
                        <h2 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-[#071F55]">
                            {step === "done" ? "Withdrawal Submitted" : "New Withdrawal Request"}
                        </h2>
                        <p className="mt-1 text-[13px] text-[#5A78B8]">
                            {step === "review" ? "Review your details before submitting." : step === "done" ? "Your request is being reviewed." : "Withdraw funds from your account."}
                        </p>
                    </div>

                    {/* Step pills */}
                    {step !== "done" && (
                        <div className="mt-6 flex items-center gap-3">
                            {[["form", "1", "Withdrawal details"], ["review", "2", "Review & confirm"]].map(([key, num, label]) => {
                                const active = step === key;
                                const complete = step === "review" && key === "form";
                                return (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold ${complete ? "bg-emerald-100 text-emerald-700" : active ? "bg-[#0B5ED7] text-white" : "bg-[#F1F5FB] text-[#5A78B8]"}`}>
                                            {complete ? <Check className="h-3.5 w-3.5" /> : num}
                                        </span>
                                        <span className={`text-[13px] font-semibold ${active ? "text-[#0B5ED7]" : "text-[#5A78B8]"}`}>{label}</span>
                                        {key === "form" && <span className="mx-2 h-px w-8 bg-[#D9E3F2]" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-6 pb-6 sm:px-8">

                    {/* ── Step: Form ── */}
                    {step === "form" && (
                        <div className="space-y-5">
                            {/* Balances */}
                            <div>
                                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A78B8]">Available Balances</p>
                                {balancesLoading ? (
                                    <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 py-3 text-[13px] text-[#5A78B8]">
                                        <Loader2 className="h-4 w-4 animate-spin" />Loading balances…
                                    </div>
                                ) : balances.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[#D9E3F2] px-4 py-4 text-center text-[13px] text-[#5A78B8]">
                                        No balances found.&nbsp;
                                        <button onClick={() => { onClose(); onOpenDepositModal(); }} className="font-semibold text-[#0B5ED7] underline">
                                            Make a deposit first
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {balances.map(b => (
                                            <button key={b.currency}
                                                onClick={() => { setSelectedCurrency(b.currency); setFieldErrors(p => ({ ...p, currency: "" })); }}
                                                className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${selectedCurrency === b.currency
                                                    ? "border-[#0B5ED7] bg-[#F4F8FF] ring-1 ring-[#0B5ED7]/20"
                                                    : "border-[#E2E8F0] bg-white hover:border-[#BFD0EA]"}`}>
                                                <CoinToken currency={b.currency} size={26} />
                                                <div className="text-left">
                                                    <p className="text-[12px] font-bold text-[#071F55]">{b.currency}</p>
                                                    <p className="text-[11px] text-[#5A78B8]">{fmtAmt(b.balance)} {b.currency}</p>
                                                </div>
                                                {selectedCurrency === b.currency && <Check className="h-3.5 w-3.5 text-[#0B5ED7]" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {fieldErrors.currency && <p className="mt-1 text-[11px] font-semibold text-rose-500">{fieldErrors.currency}</p>}
                            </div>

                            {/* Amount */}
                            <div>
                                <label className={`mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] ${fieldErrors.amount ? "text-rose-500" : "text-[#5A78B8]"}`}>
                                    Amount {selectedCurrency && `(${selectedCurrency})`}
                                    {fieldErrors.amount && ` — ${fieldErrors.amount}`}
                                </label>
                                <div className={`flex h-12 items-center gap-3 rounded-xl border px-4 transition focus-within:ring-4 ${fieldErrors.amount ? "border-rose-300 focus-within:ring-rose-500/10" : "border-slate-200 focus-within:border-[#0B5ED7] focus-within:ring-[#0B5ED7]/10"}`}>
                                    <input type="number" placeholder="0.00" value={amount}
                                        onChange={e => { setAmount(e.target.value); setFieldErrors(p => ({ ...p, amount: "" })); }}
                                        className="w-full bg-transparent text-[18px] font-bold text-[#071F55] outline-none placeholder:text-[#B8C6DA]" />
                                    {selectedCurrency && <span className="text-[13px] font-bold text-[#5A78B8]">{selectedCurrency}</span>}
                                </div>
                                {selectedBalance && (
                                    <p className="mt-1 text-[11px] text-[#5A78B8]">
                                        Balance: {fmtAmt(selectedBalance.balance)} {selectedBalance.currency}&nbsp;
                                        <button onClick={() => { setAmount(String(selectedBalance.balance)); setFieldErrors(p => ({ ...p, amount: "" })); }}
                                            className="font-semibold text-[#0B5ED7] hover:underline">
                                            Use max
                                        </button>
                                    </p>
                                )}
                            </div>

                            {/* Withdrawal method toggle */}
                            <div>
                                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A78B8]">Withdrawal Method</p>
                                <div className="flex gap-2">
                                    <button disabled
                                        className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 text-[13px] font-semibold text-[#B8C6DA] opacity-60">
                                        <Building2 className="h-4 w-4" />
                                        Bank Transfer
                                        <span className="ml-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Soon</span>
                                    </button>
                                    <button onClick={() => { setMethod("wallet"); setFieldErrors(p => ({ ...p, destination: "" })); }}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-[13px] font-semibold transition ${method === "wallet"
                                            ? "border-[#0B5ED7] bg-[#F4F8FF] text-[#0B5ED7]"
                                            : "border-[#E2E8F0] bg-white text-[#5A78B8] hover:border-[#BFD0EA]"}`}>
                                        <Wallet className="h-4 w-4" />
                                        Crypto Wallet
                                    </button>
                                </div>
                            </div>

                            {/* Destination */}
                            <div>
                                <label className={`mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] ${fieldErrors.destination ? "text-rose-500" : "text-[#5A78B8]"}`}>
                                    {method === "bank" ? "Bank Account" : "Wallet Address"}
                                    {fieldErrors.destination && ` — ${fieldErrors.destination}`}
                                </label>

                                {destinationsLoading ? (
                                    <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 py-3 text-[13px] text-[#5A78B8]">
                                        <Loader2 className="h-4 w-4 animate-spin" />Loading…
                                    </div>
                                ) : method === "bank" ? (
                                    bankDetails.length === 0 ? (
                                        <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-[#D9E3F2] px-4 py-3 text-[13px] text-[#5A78B8]">
                                            No bank accounts saved.
                                            <a href="/settings/payment" className="flex items-center gap-1.5 rounded-xl bg-[#0B5ED7] px-3 py-2 text-[12px] font-bold text-white transition hover:bg-[#0B2E84]">
                                                <Plus className="h-3.5 w-3.5" />Add bank
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select value={selectedBankId}
                                                onChange={e => { setSelectedBankId(e.target.value); setFieldErrors(p => ({ ...p, destination: "" })); }}
                                                className={`${inputBase} appearance-none pr-9 ${fieldErrors.destination ? inputErr : inputOk}`}>
                                                <option value="">Select a bank account</option>
                                                {bankDetails.map(b => (
                                                    <option key={b._id} value={b._id}>{b.bankName} — {b.accountName} ({b.accountNumber})</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    )
                                ) : (
                                    clientWallets.length === 0 ? (
                                        <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-[#D9E3F2] px-4 py-3 text-[13px] text-[#5A78B8]">
                                            No crypto wallets saved.
                                            <a href="/payment-methods" className="flex items-center gap-1.5 rounded-xl bg-[#0B5ED7] px-3 py-2 text-[12px] font-bold text-white transition hover:bg-[#0B2E84]">
                                                <Plus className="h-3.5 w-3.5" />Add wallet
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select value={selectedWalletId}
                                                onChange={e => { setSelectedWalletId(e.target.value); setFieldErrors(p => ({ ...p, destination: "" })); }}
                                                className={`${inputBase} appearance-none pr-9 ${fieldErrors.destination ? inputErr : inputOk}`}>
                                                <option value="">Select a wallet</option>
                                                {clientWallets.map(w => (
                                                    <option key={w._id} value={w._id}>{w.label ?? w.network} — {w.walletAddress}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Note */}
                            <div>
                                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A78B8]">
                                    Notes <span className="normal-case text-[#8DA3C4]">(Optional)</span>
                                </label>
                                <textarea rows={3} maxLength={200} placeholder="Any additional instructions…" value={note}
                                    onChange={e => setNote(e.target.value)}
                                    className={`${inputBase} resize-none ${inputOk}`} />
                                <p className="mt-1 text-right text-[11px] font-semibold text-[#5A78B8]">{note.length}/200</p>
                            </div>

                            {/* Fee notice */}
                            <div className="rounded-xl border border-[#CFE0FF] bg-[#F4F8FF] px-4 py-3">
                                <p className="text-[13px] font-bold text-[#0B5ED7]">Notice</p>
                                <p className="mt-1 text-[12.5px] leading-5 text-[#5A78B8]">
                                    Withdrawal requests are reviewed within 1 business day. Network fees may apply for crypto withdrawals.
                                </p>
                            </div>

                            <div className="flex justify-between pt-1">
                                <button onClick={onClose}
                                    className="rounded-xl border border-[#D9E3F2] bg-white px-5 py-3 text-[13px] font-bold text-[#5A78B8] transition hover:bg-[#F8FAFC]">
                                    Cancel
                                </button>
                                <button onClick={handleContinue}
                                    className="group flex items-center gap-2 rounded-xl bg-[#0B5ED7] px-7 py-3 text-[13px] font-bold text-white shadow-[0_14px_32px_rgba(11,94,215,0.22)] transition hover:bg-[#0B2E84]">
                                    Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step: Review ── */}
                    {step === "review" && (
                        <div className="space-y-5">
                            <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                                <h3 className="text-[15px] font-bold text-[#071F55]">Withdrawal Summary</h3>
                                <div className="mt-4 divide-y divide-[#E2E8F0]">
                                    {[
                                        ["Currency", selectedCurrency],
                                        ["Amount", `${amount} ${selectedCurrency}`],
                                        ["Method", method === "bank" ? "Bank Transfer" : "Crypto Wallet"],
                                        ...(method === "bank" && selectedBank ? [
                                            ["Bank", selectedBank.bankName ?? "—"],
                                            ["Account Name", selectedBank.accountName ?? "—"],
                                            ["Account No.", selectedBank.accountNumber ?? "—"],
                                        ] : []),
                                        ...(method === "wallet" && selectedWallet ? [
                                            ["Network", selectedWallet.network ?? "—"],
                                            ["Address", selectedWallet.walletAddress ?? "—"],
                                        ] : []),
                                        ...(note.trim() ? [["Note", note.trim()]] : []),
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-center justify-between gap-4 py-3 text-[13px]">
                                            <span className="font-medium text-[#5A78B8]">{label}</span>
                                            <span className="max-w-[260px] truncate text-right font-bold text-[#071F55]">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {fieldErrors.submit && (
                                <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700 ring-1 ring-inset ring-rose-200/70">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    {fieldErrors.submit}
                                </div>
                            )}

                            <div className="flex justify-between pt-1">
                                <button onClick={() => setStep("form")} disabled={submitting}
                                    className="rounded-xl border border-[#D9E3F2] bg-white px-5 py-3 text-[13px] font-bold text-[#5A78B8] transition hover:bg-[#F8FAFC] disabled:opacity-40">
                                    Edit
                                </button>
                                <button onClick={handleSubmit} disabled={submitting}
                                    className="group flex items-center gap-2 rounded-xl bg-[#0B5ED7] px-7 py-3 text-[13px] font-bold text-white shadow-[0_14px_32px_rgba(11,94,215,0.22)] transition hover:bg-[#0B2E84] disabled:cursor-not-allowed disabled:opacity-60">
                                    {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>) : (<>Submit <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step: Done ── */}
                    {step === "done" && (
                        <div className="flex min-h-[340px] items-center justify-center py-8">
                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                <div className="relative flex h-20 w-20 items-center justify-center">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-40" />
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-[0_18px_45px_rgba(22,163,74,0.28)]">
                                        <Check className="h-10 w-10 text-white" strokeWidth={3} />
                                    </div>
                                </div>

                                <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5A78B8]">Pending review</p>
                                <h3 className="mt-2 font-serif text-[26px] leading-tight text-[#071F55]">Withdrawal submitted</h3>
                                <p className="mt-3 text-[13.5px] leading-6 text-[#5A78B8]">
                                    Your request is under review. Funds will be sent within 1 business day once approved.
                                </p>

                                {created && (
                                    <div className="mt-6 w-full space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
                                        {[["Currency", created.currency], ["Amount", fmtAmt(created.amount)], ["Status", null]].map(([label, value]) => (
                                            <div key={label as string} className="flex items-center justify-between text-[13px]">
                                                <span className="font-medium text-[#5A78B8]">{label}</span>
                                                {value ? <span className="font-bold text-[#071F55]">{value}</span> : <StatusBadge status="pending" />}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6 flex w-full gap-3">
                                    <button onClick={reset}
                                        className="h-11 flex-1 rounded-2xl border border-[#0B2E84] text-[13px] font-bold text-[#0B2E84] transition hover:bg-[#F4F8FF]">
                                        New withdrawal
                                    </button>
                                    <button onClick={onClose}
                                        className="h-11 flex-1 rounded-2xl bg-[#071F55] text-[13px] font-bold text-white transition hover:bg-[#0B2E84]">
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
