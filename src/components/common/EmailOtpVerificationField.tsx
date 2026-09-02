"use client";

import { useEffect, useState } from "react";
import { Loader2, MailCheck, X } from "lucide-react";
import appClient from "@/lib/appClient";

type VerificationResult = {
    email: string;
    verificationToken: string;
};

type EmailOtpVerificationFieldProps = {
    email: string;
    onEmailChange: (value: string) => void;
    isVerified: boolean;
    onVerified: (result: VerificationResult) => void;
    onVerificationReset: () => void;
    onError: (message: string) => void;
    inputClassName: string;
    labelClassName: string;
    requiredAccentClassName?: string;
    placeholder?: string;
};

type OtpApiError = {
    response?: {
        status?: number;
        data?: { message?: string; retryAfterSeconds?: number };
    };
};

export default function EmailOtpVerificationField({
    email,
    onEmailChange,
    isVerified,
    onVerified,
    onVerificationReset,
    onError,
    inputClassName,
    labelClassName,
    requiredAccentClassName = "text-blue-600",
    placeholder = "you@example.com",
}: EmailOtpVerificationFieldProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [modalError, setModalError] = useState("");
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [otpEmail, setOtpEmail] = useState("");
    const [resendSeconds, setResendSeconds] = useState(0);

    const normalizedEmail = email.trim().toLowerCase();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    const cooldownActive = otpEmail === normalizedEmail && resendSeconds > 0;

    useEffect(() => {
        if (resendSeconds <= 0) return;
        const timer = window.setTimeout(() => {
            setResendSeconds(seconds => Math.max(0, seconds - 1));
        }, 1000);
        return () => window.clearTimeout(timer);
    }, [resendSeconds]);

    const resetLocalVerification = () => {
        setModalOpen(false);
        setOtp("");
        setModalError("");
        setOtpEmail("");
        setResendSeconds(0);
        onVerificationReset();
    };

    const changeEmail = (value: string) => {
        if (value.trim().toLowerCase() !== normalizedEmail || isVerified) {
            resetLocalVerification();
        }
        onEmailChange(value);
    };

    const sendOtp = async () => {
        if (!emailIsValid) {
            onError("Please enter a valid email address before requesting verification.");
            return;
        }

        onError("");
        setModalError("");
        setSending(true);
        try {
            const response = await appClient.post("/api/consult/send-otp", {
                email: normalizedEmail,
            });
            setOtp("");
            setOtpEmail(normalizedEmail);
            setResendSeconds(response.data?.retryAfterSeconds || 60);
            setModalOpen(true);
        } catch (error: unknown) {
            const apiError = error as OtpApiError;
            const message = apiError.response?.data?.message || "Failed to send the verification code.";
            const rateLimited = apiError.response?.status === 429;

            if (rateLimited) {
                setOtpEmail(normalizedEmail);
                setResendSeconds(apiError.response?.data?.retryAfterSeconds || 60);
                setModalOpen(true);
                setModalError(message);
            } else if (modalOpen) {
                setModalError(message);
            } else {
                onError(message);
            }
        } finally {
            setSending(false);
        }
    };

    const openOrSendOtp = () => {
        if (cooldownActive) {
            setModalOpen(true);
            onError("");
            return;
        }
        sendOtp();
    };

    const verifyOtp = async () => {
        if (!/^\d{6}$/.test(otp)) {
            setModalError("Enter the six-digit code from your email.");
            return;
        }

        setModalError("");
        setVerifying(true);
        try {
            const response = await appClient.post("/api/consult/verify-otp", {
                email: normalizedEmail,
                otp,
            });
            if (!response.data?.status || !response.data?.verificationToken) {
                setModalError(response.data?.message || "The verification code is invalid.");
                return;
            }
            onVerified({
                email: normalizedEmail,
                verificationToken: response.data.verificationToken,
            });
            setModalOpen(false);
            setOtp("");
            setModalError("");
            onError("");
        } catch (error: unknown) {
            const apiError = error as OtpApiError;
            setModalError(apiError.response?.data?.message || "Failed to verify the code.");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <>
            <div>
                <label className={labelClassName}>
                    Email Address <span className={requiredAccentClassName}>*</span>
                </label>
                <div className="relative">
                    <input
                        required
                        type="email"
                        autoComplete="email"
                        placeholder={placeholder}
                        value={email}
                        onChange={event => changeEmail(event.target.value)}
                        className={inputClassName}
                    />
                    <button
                        type="button"
                        onClick={openOrSendOtp}
                        disabled={!emailIsValid || sending || isVerified}
                        className={`absolute right-2 top-1/2 inline-flex h-8 -translate-y-1/2 items-center gap-1.5 rounded-lg px-3 text-[11px] font-bold transition-all disabled:cursor-not-allowed ${
                            isVerified
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-[#081B3A] text-white hover:bg-[#102C5C] disabled:bg-[#081B3A]/35"
                        }`}
                    >
                        {sending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isVerified ? (
                            <MailCheck className="h-3.5 w-3.5" />
                        ) : null}
                        {sending
                            ? "Sending"
                            : isVerified
                                ? "Verified"
                                : cooldownActive
                                    ? "Enter Code"
                                    : "Verify"}
                    </button>
                </div>
            </div>

            {modalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#081B3A]/60 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="email-otp-title"
                >
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#dbe4ff] bg-white p-6 shadow-[0_24px_80px_rgba(8,27,58,0.3)] sm:p-8">
                        <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#081B3A] via-[#2563EB] to-[#60A5FA]" />
                        <button
                            type="button"
                            onClick={() => { setModalOpen(false); setModalError(""); }}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#081B3A]/45 transition-colors hover:bg-[#eef2ff] hover:text-[#081B3A]"
                            aria-label="Close verification dialog"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff]">
                            <MailCheck className="h-6 w-6 text-[#2563EB]" />
                        </div>
                        <h2 id="email-otp-title" className="text-2xl text-[#081B3A]" style={{ fontFamily: "var(--font-playfair)" }}>
                            Verify your email
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#081B3A]/55">
                            If <strong className="text-[#081B3A]">{normalizedEmail}</strong> exists, a six-digit verification code has been sent. The code expires in 5 minutes.
                        </p>

                        <label className="mt-6 block">
                            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#081B3A]/55">
                                Verification code
                            </span>
                            <input
                                autoFocus
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={otp}
                                onChange={event => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                                onKeyDown={event => {
                                    if (event.key === "Enter" && otp.length === 6) {
                                        event.preventDefault();
                                        verifyOtp();
                                    }
                                }}
                                placeholder="000000"
                                aria-describedby={modalError ? "email-otp-error" : undefined}
                                className="h-14 w-full rounded-xl border border-[#dbe4ff] bg-[#fbfcff] px-4 text-center font-mono text-xl font-bold tracking-[0.45em] text-[#081B3A] outline-none transition-all placeholder:text-[#081B3A]/20 focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                            />
                        </label>

                        {modalError && (
                            <p id="email-otp-error" className="mt-3 text-xs font-medium text-red-600">
                                {modalError}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={verifyOtp}
                            disabled={otp.length !== 6 || verifying}
                            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#081B3A] text-sm font-bold text-white transition-colors hover:bg-[#102C5C] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
                            {verifying ? "Verifying…" : "Verify Email"}
                        </button>

                        <button
                            type="button"
                            onClick={sendOtp}
                            disabled={sending || cooldownActive}
                            className="mt-4 w-full text-center text-xs font-bold text-[#2563EB] transition-colors hover:text-[#081B3A] disabled:opacity-50"
                        >
                            {sending
                                ? "Sending a new code…"
                                : cooldownActive
                                    ? `Resend code in ${resendSeconds}s`
                                    : "Resend code"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
