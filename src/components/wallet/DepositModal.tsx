"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
    AlertCircle, ArrowLeft, ArrowRight, Check, ChevronDown,
    Clock, Copy, ImageIcon, Loader2, RefreshCw, Timer, Wallet, X,
} from "lucide-react";
import { toast } from "sonner";
import appClient from "@/lib/appClient";
import { optimizeKycImage, uploadKycAsset } from "@/lib/kycUpload";
import type { DepositRequest, DepositStep, PaymentMethod } from "@/interface/wallet";
import { CoinToken } from "@/components/wallet/currency";
import { DepositTimer, TIMER_TOTAL } from "@/components/wallet/DepositTimer";
import { StatusBadge } from "@/components/wallet/StatusBadge";
import { fmtAmt } from "@/utils/walletHelpers";

interface DepositModalProps {
    user: { _id: string; fullName?: string; firstName?: string } | null;
    paymentMethods: PaymentMethod[];
    pmLoading: boolean;
    onClose: () => void;
    onSubmitSuccess: () => void;
    onViewRequests: () => void;
}

const inputBase = "w-full rounded-xl border bg-white px-4 py-3 text-[13.5px] text-[#0e1f3d] outline-none transition placeholder:text-slate-300 focus:ring-2";
const inputOk = "border-slate-200 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/10";
const inputErr = "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10";

export function DepositModal({ user, paymentMethods, pmLoading, onClose, onSubmitSuccess, onViewRequests }: DepositModalProps) {
    const [depositStep, setDepositStep] = useState<DepositStep>("select");
    const [selectedPmId, setSelectedPmId] = useState("");
    const [depositAmount, setDepositAmount] = useState("");
    const [qrGenerating, setQrGenerating] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [senderWallet, setSenderWallet] = useState("");
    const [note, setNote] = useState("");
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [createdDeposit, setCreatedDeposit] = useState<DepositRequest | null>(null);
    const [timeLeft, setTimeLeft] = useState(TIMER_TOTAL);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const qrGenerationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const txHashRef = useRef<HTMLInputElement>(null);
    const senderWalletRef = useRef<HTMLInputElement>(null);

    const selectedPm = paymentMethods.find(m => m._id === selectedPmId);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(TIMER_TOTAL);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    toast.error("Session expired. Please start a new deposit.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Start timer on mount, clean up on unmount
    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (qrGenerationRef.current) clearTimeout(qrGenerationRef.current);
        };
    }, [startTimer]);

    function resetDepositForm(restartTimer = true) {
        setDepositStep("select");
        setSelectedPmId("");
        setDepositAmount("");
        setQrGenerating(false);
        setTxHash("");
        setSenderWallet("");
        setNote("");
        setProofFile(null);
        setProofPreview(null);
        setUploadProgress(0);
        setFieldErrors({});
        setCreatedDeposit(null);
        if (qrGenerationRef.current) clearTimeout(qrGenerationRef.current);
        if (restartTimer) startTimer();
    }

    // Auto-reset when timer expires
    useEffect(() => {
        if (timeLeft === 0) resetDepositForm(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    function startQrGeneration() {
        if (qrGenerationRef.current) clearTimeout(qrGenerationRef.current);
        setQrGenerating(true);
        qrGenerationRef.current = setTimeout(() => setQrGenerating(false), 950);
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setFieldErrors(prev => ({ ...prev, proof: "Please select an image file." }));
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setFieldErrors(prev => ({ ...prev, proof: "Screenshot must be 10MB or smaller." }));
            return;
        }
        if (proofPreview) URL.revokeObjectURL(proofPreview);
        setProofFile(file);
        setProofPreview(URL.createObjectURL(file));
        setUploadProgress(0);
        setFieldErrors(prev => ({ ...prev, proof: "" }));
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text)
            .then(() => toast.success("Copied!"))
            .catch(() => toast.error("Copy failed"));
    }

    function validateAndProceed() {
        const errors: Record<string, string> = {};
        if (!selectedPmId) errors.method = "Please select a payment method.";
        if (!depositAmount || Number(depositAmount) <= 0) errors.amount = "Please enter a valid amount.";
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;
        setDepositStep("proof");
    }

    async function handleSubmitDeposit() {
        if (!user?._id || !selectedPm) return;

        const errors: Record<string, string> = {};
        if (!txHash.trim()) errors.txHash = "Transaction hash is required.";
        if (!senderWallet.trim()) errors.senderWallet = "Sender wallet address is required.";
        if (!proofFile) errors.proof = "Payment screenshot is required.";
        setFieldErrors(errors);

        if (errors.txHash) {
            txHashRef.current?.focus();
            txHashRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        if (errors.senderWallet) {
            senderWalletRef.current?.focus();
            senderWalletRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        if (errors.proof) {
            fileInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setSubmitting(true);
        try {
            setUploading(true);
            setUploadProgress(0);
            const optimizedProof = await optimizeKycImage(proofFile!, proofFile!.name, 1600, 0.8);
            const proofUrl = await uploadKycAsset(
                "deposit_proof",
                optimizedProof.blob,
                optimizedProof.filename,
                setUploadProgress,
            );
            setUploading(false);
            const res = await appClient.post("/api/deposits/create", {
                userId: user._id,
                userModel: "Client",
                paymentMethodId: selectedPm._id,
                amount: Number(depositAmount) || 0,
                currency: selectedPm.currency,
                network: selectedPm.network,
                transactionHash: txHash.trim(),
                senderWalletAddress: senderWallet.trim(),
                paymentProofUrl: proofUrl,
                ...(note.trim() ? { note: note.trim() } : {}),
            });
            const d = res.data as Record<string, unknown>;
            setCreatedDeposit((d.data ?? d) as DepositRequest);
            setDepositStep("done");
            if (timerRef.current) clearInterval(timerRef.current);
            onSubmitSuccess();
        } catch (err: unknown) {
            const e = err as { message?: string; response?: { data?: { message?: string } } };
            setFieldErrors(prev => ({ ...prev, submit: e?.response?.data?.message ?? e.message ?? "Failed to submit deposit." }));
        } finally {
            setUploading(false);
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#071F55]/40 px-4 py-6 backdrop-blur-md">
            <div className="relative w-full max-w-6xl overflow-hidden rounded-[20px] border border-[#D9E3F2] bg-white shadow-[0_35px_120px_rgba(7,31,85,0.26)]">
                {timeLeft === 0 && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 p-6 text-center backdrop-blur-sm">
                        <AlertCircle className="h-16 w-16 text-rose-500 animate-bounce" />
                        <h3 className="mt-4 text-2xl font-bold text-[#071F55]">Session Expired</h3>
                        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#5A78B8]">
                            For your security, deposit sessions expire after 12 minutes. Please restart the deposit flow.
                        </p>
                        <button
                            onClick={() => resetDepositForm(true)}
                            className="mt-6 rounded-xl bg-[#0B5ED7] px-6 py-3 text-[13px] font-bold text-white shadow-md transition hover:bg-[#0B2E84]"
                        >
                            Start New Deposit
                        </button>
                    </div>
                )}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#D9E3F2] bg-white/90 text-[#5A78B8] shadow-sm transition hover:bg-white hover:text-[#071F55]"
                    aria-label="Close deposit modal"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="bg-white px-6 pb-5 pt-6 sm:px-9">
                    <div className="flex flex-col gap-4 pr-10 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-[#071F55]">New Deposit Request</h2>
                            <p className="mt-1 max-w-xl text-[13px] leading-5 text-[#5A78B8]">
                                {depositStep === "proof" ? "Review your details and submit your deposit request." : "Fund your account securely in just a few steps."}
                            </p>
                        </div>
                        {depositStep !== "done" && <DepositTimer seconds={timeLeft} />}
                    </div>

                    {/* Step indicators */}
                    <div className="mt-9 flex items-start gap-4">
                        {[
                            { key: "select", title: "Select Method", sub: "Choose your preferred payment method" },
                            { key: "payment", title: "Payment Details", sub: "Send payment to the provided address" },
                            { key: "proof", title: "Submit & Review", sub: "Upload proof and submit your request" },
                        ].map((item, index) => {
                            const active = item.key === "proof" ? depositStep === "proof" || depositStep === "done"
                                : item.key === "payment" ? depositStep === "payment"
                                    : depositStep === "select";
                            const complete = item.key === "select" ? depositStep !== "select" || !!selectedPm
                                : item.key === "payment" ? depositStep === "proof" || depositStep === "done"
                                    : depositStep === "done";
                            return (
                                <div key={item.key} className="flex flex-1 items-start gap-4">
                                    <button
                                        disabled={depositStep === "done" || (item.key !== "select" && !selectedPm) || (item.key === "proof" && !depositAmount)}
                                        onClick={() => setDepositStep(item.key as DepositStep)}
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold shadow-sm transition ${complete ? "bg-emerald-100 text-emerald-700"
                                                : active ? "bg-[#0B5ED7] text-white"
                                                    : "bg-white text-[#071F55] ring-1 ring-[#E2E8F0]"}`}
                                    >
                                        {complete ? <Check className="h-5 w-5" /> : index + 1}
                                    </button>
                                    <div className="min-w-0">
                                        <p className={`text-[13px] font-bold ${active ? "text-[#0B5ED7]" : "text-[#071F55]"}`}>{index + 1} {item.title}</p>
                                        <p className="mt-1 max-w-[180px] text-[12px] leading-5 text-[#5A78B8]">{item.sub}</p>
                                    </div>
                                    {index < 2 && (
                                        <span className={`mt-5 hidden h-0.5 flex-1 rounded-full sm:block ${complete ? "bg-[#0B5ED7]" : "bg-[#D9E3F2]"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Body */}
                <div className="max-h-[calc(100vh-220px)] overflow-y-auto bg-white px-6 pb-6 sm:px-9">

                    {/* ── Step: Select / Payment ── */}
                    {(depositStep === "select" || depositStep === "payment") && (
                        <div className="grid gap-4 lg:grid-cols-[410px_minmax(0,1fr)]">
                            {/* Left: method list */}
                            <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                                <h3 className="text-[16px] font-bold text-[#071F55]">Choose a payment method</h3>
                                <p className="mt-1 text-[13px] text-[#5A78B8]">Select the cryptocurrency you want to deposit</p>

                                {pmLoading ? (
                                    <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-14 text-[13px] text-[#5A78B8]">
                                        <Loader2 className="h-5 w-5 animate-spin" />Loading payment methods...
                                    </div>
                                ) : paymentMethods.length === 0 ? (
                                    <div className="mt-5 rounded-xl border border-dashed border-[#D9E3F2] bg-white py-12 text-center">
                                        <p className="text-[13px] font-medium text-[#5A78B8]">No payment methods available right now.</p>
                                    </div>
                                ) : (
                                    <div className="mt-5 space-y-3">
                                        {paymentMethods.map(pm => {
                                            const active = selectedPmId === pm._id;
                                            return (
                                                <button key={pm._id}
                                                    onClick={() => { startQrGeneration(); setSelectedPmId(pm._id); setFieldErrors(p => ({ ...p, method: "" })); setDepositStep("payment"); }}
                                                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${active
                                                        ? "border-[#0B5ED7] bg-[#F4F8FF] ring-1 ring-[#0B5ED7]/20"
                                                        : "border-[#E2E8F0] bg-white hover:border-[#BFD0EA] hover:bg-[#F8FAFC]"}`}
                                                >
                                                    <CoinToken currency={pm.currency} size={42} />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[13.5px] font-bold text-[#071F55]">{pm.name}</p>
                                                        <p className="mt-0.5 text-[12px] text-[#5A78B8]">
                                                            Min: {pm.minDeposit > 0 ? `${pm.minDeposit} ${pm.currency}` : "Flexible"}
                                                        </p>
                                                    </div>
                                                    {active
                                                        ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B5ED7]"><Check className="h-3 w-3 text-white" /></span>
                                                        : <ArrowRight className="h-4 w-4 text-[#8DA3C4]" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            {/* Right: payment details */}
                            <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                                {selectedPm ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <CoinToken currency={selectedPm.currency} size={42} />
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-[16px] font-bold text-[#071F55]">{selectedPm.name}</h3>
                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Active</span>
                                                </div>
                                                <p className="mt-0.5 text-[12px] text-[#5A78B8]">{selectedPm.network}</p>
                                            </div>
                                        </div>

                                        <div className="mt-5 rounded-xl border border-[#D9E3F2] bg-[#F8FAFC] px-4 py-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-[12px] font-semibold text-[#5A78B8]">Deposit Address</p>
                                                    <p className="mt-1 break-all font-mono text-[13px] font-bold text-[#071F55]">
                                                        {selectedPm.walletAddress || selectedPm.accountDetails || "No destination configured"}
                                                    </p>
                                                </div>
                                                {(selectedPm.walletAddress || selectedPm.accountDetails) && (
                                                    <button onClick={() => copyToClipboard(selectedPm.walletAddress || selectedPm.accountDetails)} title="Copy"
                                                        className="shrink-0 rounded-xl bg-white p-2 text-[#5A78B8] ring-1 ring-[#D9E3F2] transition hover:text-[#0B5ED7]">
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-5 sm:grid-cols-[170px_minmax(0,1fr)]">
                                            <div className="flex justify-center">
                                                {qrGenerating ? (
                                                    <div className="relative flex h-[174px] w-[174px] items-center justify-center overflow-hidden rounded-xl border border-[#CFE0FF] bg-[#F4F8FF]">
                                                        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_45%,rgba(11,94,215,0.16),transparent_38%)]" />
                                                        <div className="relative grid grid-cols-5 gap-1.5 rounded-xl bg-white/75 p-4 shadow-sm ring-1 ring-[#D9E3F2]">
                                                            {Array.from({ length: 25 }).map((_, i) => (
                                                                <span key={i} className={`h-3 w-3 rounded-[3px] ${[0, 2, 4, 6, 8, 12, 16, 18, 20, 22, 24].includes(i) ? "bg-[#0B5ED7]" : "bg-[#CFE0FF]"} animate-pulse`} style={{ animationDelay: `${i * 35}ms` }} />
                                                            ))}
                                                        </div>
                                                        <div className="absolute bottom-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#0B5ED7] shadow-sm ring-1 ring-[#D9E3F2]">
                                                            Generating QR...
                                                        </div>
                                                    </div>
                                                ) : selectedPm.qrCodeUrl ? (
                                                    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 opacity-100 shadow-sm transition duration-500 ease-out">
                                                        <Image src={selectedPm.qrCodeUrl} alt={`${selectedPm.name} QR code`} width={150} height={150} className="h-[150px] w-[150px] object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="flex h-[174px] w-[174px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D9E3F2] bg-[#F8FAFC] text-[#8DA3C4]">
                                                        <ImageIcon className="h-8 w-8" />
                                                        <p className="mt-2 text-[11px] font-semibold">No QR code</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4 pt-1">
                                                {[
                                                    ["Network", selectedPm.network],
                                                    ["Minimum Deposit", selectedPm.minDeposit > 0 ? `${selectedPm.minDeposit} ${selectedPm.currency}` : "Flexible"],
                                                    ["Confirmations", "32"],
                                                    ["Estimated Processing", selectedPm.processingTime || "1-3 minutes"],
                                                ].map(([label, value]) => (
                                                    <div key={label} className="flex items-center justify-between gap-4 text-[13px]">
                                                        <span className="font-medium text-[#5A78B8]">{label}</span>
                                                        <span className="text-right font-bold text-[#071F55]">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className={`mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] ${fieldErrors.amount ? "text-rose-500" : "text-[#5A78B8]"}`}>
                                                Deposit amount ({selectedPm.currency}) {fieldErrors.amount && `— ${fieldErrors.amount}`}
                                            </label>
                                            <div className={`flex h-12 items-center gap-3 rounded-xl border bg-[#F8FAFC] px-4 transition focus-within:ring-4 ${fieldErrors.amount ? "border-rose-300 focus-within:ring-rose-500/10" : "border-[#D9E3F2] focus-within:border-[#0B5ED7] focus-within:ring-[#0B5ED7]/10"}`}>
                                                <input type="number" placeholder="0.00" value={depositAmount}
                                                    onChange={e => { setDepositAmount(e.target.value); setFieldErrors(p => ({ ...p, amount: "" })); }}
                                                    className="w-full bg-transparent text-[18px] font-bold text-[#071F55] outline-none placeholder:text-[#B8C6DA]" />
                                                <span className="text-[13px] font-bold text-[#5A78B8]">{selectedPm.currency}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-[#CFE0FF] bg-[#F4F8FF] px-4 py-3">
                                            <p className="text-[13px] font-bold text-[#0B5ED7]">Important</p>
                                            <p className="mt-1 text-[12.5px] leading-5 text-[#5A78B8]">
                                                Send only {selectedPm.currency} to this address. Sending any other asset may result in permanent loss.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-dashed border-[#D9E3F2] bg-[#F8FAFC] text-center">
                                        <div>
                                            <Wallet className="mx-auto h-9 w-9 text-[#8DA3C4]" />
                                            <p className="mt-3 text-[13px] font-bold text-[#071F55]">Select a payment method</p>
                                            <p className="mt-1 text-[12px] text-[#5A78B8]">Payment details will appear here.</p>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <div className="flex justify-between lg:col-span-2">
                                <button onClick={onClose}
                                    className="rounded-xl border border-[#D9E3F2] bg-white px-5 py-3 text-[13px] font-bold text-[#5A78B8] transition hover:bg-[#F8FAFC]">
                                    Cancel
                                </button>
                                <button onClick={validateAndProceed} disabled={!selectedPm}
                                    className="group flex items-center gap-2 rounded-xl bg-[#0B5ED7] px-7 py-3 text-[13px] font-bold text-white shadow-[0_14px_32px_rgba(11,94,215,0.22)] transition hover:bg-[#0B2E84] disabled:cursor-not-allowed disabled:opacity-45">
                                    Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step: Proof ── */}
                    {depositStep === "proof" && selectedPm && (
                        <div className="space-y-6">
                            <div className="grid gap-4 lg:grid-cols-2">
                                {/* Left: review details */}
                                <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                                    <h3 className="text-[16px] font-bold text-[#071F55]">Review Deposit Details</h3>
                                    <p className="mt-1 text-[13px] text-[#5A78B8]">Please review all details carefully before submitting</p>

                                    <div className="mt-6 divide-y divide-[#E2E8F0]">
                                        {[
                                            ["Cryptocurrency", selectedPm.name, <CoinToken key="coin" currency={selectedPm.currency} size={38} />],
                                            ["Network", selectedPm.network, <Wallet key="network" className="h-5 w-5" />],
                                            ["Deposit Amount", `${depositAmount} ${selectedPm.currency}`, <ArrowLeft key="amount" className="h-5 w-5 -rotate-90" />],
                                            ["Deposit Address", selectedPm.walletAddress || selectedPm.accountDetails || "N/A", <Copy key="address" className="h-5 w-5" />],
                                            ["Minimum Deposit", selectedPm.minDeposit > 0 ? `${selectedPm.minDeposit} ${selectedPm.currency}` : "Flexible", <ChevronDown key="min" className="h-5 w-5" />],
                                            ["Confirmations Required", "32", <RefreshCw key="confirm" className="h-5 w-5" />],
                                            ["Estimated Processing Time", selectedPm.processingTime || "1-3 minutes", <Timer key="timer" className="h-5 w-5" />],
                                        ].map(([label, value, icon]) => (
                                            <div key={label as string} className="flex items-center gap-4 py-4">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1F5FB] text-[#5A78B8]">{icon as React.ReactNode}</span>
                                                <span className="min-w-0 flex-1 text-[13px] font-semibold text-[#5A78B8]">{label as string}</span>
                                                <span className="max-w-[240px] truncate text-right text-[13px] font-bold text-[#071F55]">{value as string}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 rounded-xl border border-[#CFE0FF] bg-[#F4F8FF] px-4 py-3">
                                        <p className="text-[13px] font-bold text-[#0B5ED7]">Important</p>
                                        <p className="mt-1 text-[12.5px] leading-5 text-[#5A78B8]">
                                            Send only {selectedPm.currency} to the address above. Sending any other asset may result in permanent loss.
                                        </p>
                                    </div>
                                </section>

                                {/* Right: upload proof */}
                                <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                                    <h3 className="text-[16px] font-bold text-[#071F55]">Upload Payment Proof</h3>
                                    <p className="mt-1 text-[13px] text-[#5A78B8]">Please upload a screenshot and add transaction details</p>

                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                                    <div className="mt-6">
                                        {proofPreview ? (
                                            <div className="relative">
                                                <Image src={proofPreview} alt="Proof preview" width={720} height={405}
                                                    className="max-h-56 w-full rounded-xl border border-[#E2E8F0] object-cover" />
                                                <button onClick={() => {
                                                    if (proofPreview) URL.revokeObjectURL(proofPreview);
                                                    setProofFile(null);
                                                    setProofPreview(null);
                                                    setUploadProgress(0);
                                                }}
                                                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow transition hover:bg-white">
                                                    <X className="h-4 w-4 text-[#071F55]" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => fileInputRef.current?.click()}
                                                className="flex min-h-[185px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD8EA] bg-white text-[#5A78B8] transition hover:border-[#0B5ED7] hover:bg-[#F8FAFC]">
                                                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F5FF] text-[#0B5ED7]">
                                                    <ImageIcon className="h-7 w-7" />
                                                </span>
                                                <span className="mt-4 text-[16px] font-bold text-[#071F55]">Drag and drop your file here</span>
                                                <span className="mt-1 text-[13px] font-semibold text-[#0B5ED7]">or click to browse</span>
                                            </button>
                                        )}
                                        <p className="mt-3 text-[12px] leading-5 text-[#5A78B8]">Supported formats: JPG, PNG, GIF, WebP<br />Max file size: 10MB</p>
                                        {fieldErrors.proof && <p className="mt-2 text-[11px] font-semibold text-rose-500">{fieldErrors.proof}</p>}
                                        {uploading && (
                                            <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,#061A43_0%,#0A3475_52%,#1264D9_100%)] p-[1px] shadow-[0_18px_45px_rgba(7,31,85,0.22)]">
                                                <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
                                                <div className="pointer-events-none absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-blue-400/25 blur-2xl" />
                                                <div className="relative rounded-[15px] bg-[linear-gradient(135deg,rgba(5,22,55,0.98),rgba(8,45,101,0.95))] px-4 py-4 backdrop-blur-xl">
                                                    <div className="flex items-center gap-3">
                                                        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                                                            <span className="absolute inset-1 animate-pulse rounded-lg bg-cyan-300/10" />
                                                            <ImageIcon className="relative h-4.5 w-4.5 text-cyan-200" />
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="text-[13px] font-bold tracking-wide text-white">Uploading</p>
                                                                    <p className="mt-0.5 text-[10.5px] font-medium text-blue-100/60">Secure payment proof transfer</p>
                                                                </div>
                                                                <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-2.5 py-1 font-mono text-[12px] font-bold tabular-nums text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                                                                    {uploadProgress}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="relative mt-4 h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/25 p-[2px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]">
                                                        <div
                                                            className="relative h-full overflow-hidden rounded-full bg-[linear-gradient(90deg,#38BDF8_0%,#60A5FA_48%,#A5F3FC_100%)] shadow-[0_0_18px_rgba(56,189,248,0.7)] transition-[width] duration-500 ease-out"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        >
                                                            <span className="absolute inset-y-0 right-0 w-12 animate-pulse bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px]" />
                                                        </div>
                                                    </div>

                                                    <div className="mt-2.5 flex items-center justify-between text-[9.5px] font-semibold uppercase tracking-[0.14em] text-blue-100/45">
                                                        <span>Encrypted transfer</span>
                                                        <span>{uploadProgress < 100 ? "In progress" : "Completed"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label className={`mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] ${fieldErrors.txHash ? "text-rose-500" : "text-[#5A78B8]"}`}>
                                                Transaction Hash <span className="text-rose-400">*</span>
                                            </label>
                                            <input ref={txHashRef} type="text" placeholder="0x... or txid" value={txHash}
                                                onChange={e => { setTxHash(e.target.value); setFieldErrors(p => ({ ...p, txHash: "" })); }}
                                                className={`${inputBase} font-mono ${fieldErrors.txHash ? inputErr : inputOk}`} />
                                            {fieldErrors.txHash && <p className="mt-1 text-[11px] font-semibold text-rose-500">{fieldErrors.txHash}</p>}
                                        </div>

                                        <div>
                                            <label className={`mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] ${fieldErrors.senderWallet ? "text-rose-500" : "text-[#5A78B8]"}`}>
                                                Sender Wallet <span className="text-rose-400">*</span>
                                            </label>
                                            <input ref={senderWalletRef} type="text" placeholder="The address you sent from" value={senderWallet}
                                                onChange={e => { setSenderWallet(e.target.value); setFieldErrors(p => ({ ...p, senderWallet: "" })); }}
                                                className={`${inputBase} font-mono ${fieldErrors.senderWallet ? inputErr : inputOk}`} />
                                            {fieldErrors.senderWallet && <p className="mt-1 text-[11px] font-semibold text-rose-500">{fieldErrors.senderWallet}</p>}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A78B8]">
                                            Notes <span className="normal-case text-[#8DA3C4]">(Optional)</span>
                                        </label>
                                        <textarea rows={4} maxLength={200} placeholder="Add any additional information about this deposit..." value={note}
                                            onChange={e => setNote(e.target.value)}
                                            className={`${inputBase} resize-none ${inputOk}`} />
                                        <p className="mt-1 text-right text-[11px] font-semibold text-[#5A78B8]">{note.length}/200</p>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                        <p className="text-[13px] font-bold text-emerald-800">You&apos;re almost done!</p>
                                        <p className="mt-1 text-[12.5px] text-emerald-700">Please review the details and submit your request.</p>
                                    </div>

                                    {fieldErrors.submit && (
                                        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700 ring-1 ring-inset ring-rose-200/70">
                                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                            {fieldErrors.submit}
                                        </div>
                                    )}
                                </section>
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setDepositStep("payment")} disabled={submitting}
                                    className="flex items-center gap-2 rounded-xl border border-[#D9E3F2] bg-white px-7 py-3 text-[13px] font-bold text-[#5A78B8] transition hover:bg-[#F8FAFC] disabled:opacity-40">
                                    <ArrowLeft className="h-4 w-4" />Back
                                </button>
                                <button onClick={handleSubmitDeposit} disabled={submitting || uploading}
                                    className="group flex items-center gap-2 rounded-xl bg-[#0B5ED7] px-8 py-3 text-[13px] font-bold text-white shadow-[0_14px_32px_rgba(11,94,215,0.22)] transition hover:bg-[#0B2E84] disabled:cursor-not-allowed disabled:opacity-60">
                                    {uploading ? (<><Loader2 className="h-4 w-4 animate-spin" />Uploading {uploadProgress}%</>)
                                        : submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>)
                                            : (<>Submit Deposit Request <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step: Done ── */}
                    {depositStep === "done" && (
                        <div className="flex min-h-[390px] items-center justify-center p-4 sm:p-8">
                            <div className="mx-auto flex max-w-md flex-col items-center text-center">
                                <div className="relative flex h-20 w-20 items-center justify-center">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-40" />
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-[0_18px_45px_rgba(22,163,74,0.28)]">
                                        <Check className="h-10 w-10 text-white" strokeWidth={3} />
                                    </div>
                                </div>

                                <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5A78B8]">Treasury review started</p>
                                <h3 className="mt-2 font-serif text-[28px] leading-tight text-[#071F55]">Deposit submitted</h3>
                                <p className="mt-3 text-[13.5px] leading-6 text-[#5A78B8]">
                                    We&apos;ve received your request. Your wallet will be credited once our team approves it, usually within 1 business day.
                                </p>

                                {createdDeposit && (
                                    <div className="mt-6 w-full space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
                                        {[["Currency", createdDeposit.currency], ["Amount", fmtAmt(createdDeposit.amount)], ["Status", null]].map(([label, value]) => (
                                            <div key={label as string} className="flex items-center justify-between text-[13px]">
                                                <span className="font-medium text-[#5A78B8]">{label}</span>
                                                {value ? <span className="font-bold text-[#071F55]">{value}</span> : <StatusBadge status="pending" />}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6 flex w-full gap-3">
                                    <button onClick={() => resetDepositForm()}
                                        className="h-11 flex-1 rounded-2xl border border-[#0B2E84] text-[13px] font-bold text-[#0B2E84] transition hover:bg-[#F4F8FF]">
                                        New deposit
                                    </button>
                                    <button onClick={onViewRequests}
                                        className="h-11 flex-1 rounded-2xl bg-[#071F55] text-[13px] font-bold text-white transition hover:bg-[#0B2E84]">
                                        View requests
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            {/* Floating Mobile Timer */}
            {depositStep !== "done" && timeLeft > 0 && (
                <div className="fixed bottom-4 right-4 z-[60] sm:hidden shadow-lg rounded-full">
                    <DepositTimer seconds={timeLeft} />
                </div>
            )}
        </div>
    );
}
