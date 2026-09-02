"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import appClient from "@/lib/appClient";
import { toastLoading, toastUpdate, toastError } from "@/utils/toast-message/toast-message";

const OTP_SECONDS = 300;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => setSecondsLeft((prev) => Math.max(prev - 1, 0)), 1000);
    window.setTimeout(() => otpRefs.current[0]?.focus(), 120);
    return () => window.clearInterval(timer);
  }, [step]);

  const submitEmail = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toastError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    const toastId = toastLoading("Sending verification code...");
    try {
      const res = await appClient.post("/api/auth/resend-otp", { email });
      if (!res.data?.status) {
        toastUpdate(toastId, "error", res.data?.message || "Failed to send OTP.");
        return;
      }
      toastUpdate(toastId, "success", res.data.message || "OTP has been sent to your email.");
      setOtp(["", "", "", "", "", ""]);
      setSecondsLeft(OTP_SECONDS);
      setStep("otp");
    } catch (err: unknown) {
      toastUpdate(toastId, "error", (err as { message?: string })?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const code = otp.join("");
    if (!/^\d{6}$/.test(code)) {
      toastError("Enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    const toastId = toastLoading("Verifying your code...");
    try {
      const res = await appClient.post("/api/auth/verify-otp", { email, otp: code });
      if (!res.data?.status) {
        toastUpdate(toastId, "error", res.data?.message || "Invalid OTP.");
        return;
      }
      toastUpdate(toastId, "success", res.data.message || "OTP verified successfully.");
      setStep("reset");
    } catch (err: unknown) {
      toastUpdate(toastId, "error", (err as { message?: string })?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toastError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const toastId = toastLoading("Resetting your password...");
    try {
      const res = await appClient.post("/api/auth/forgot-password", { email, password: newPassword });
      if (!res.data?.status) {
        toastUpdate(toastId, "error", res.data?.message || "Password reset failed.");
        return;
      }
      toastUpdate(toastId, "success", res.data.message || "Password changed successfully.");
      router.push("/login?reset=1");
    } catch (err: unknown) {
      toastUpdate(toastId, "error", (err as { message?: string })?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const setOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const pasteOtp = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    setOtp(Array.from({ length: 6 }, (_, i) => digits[i] ?? ""));
    otpRefs.current[Math.min(digits.length, 6) - 1]?.focus();
  };

  const resendOtp = async () => {
    if (secondsLeft > 0) return;
    setLoading(true);
    const toastId = toastLoading("Resending OTP...");
    try {
      const res = await appClient.post("/api/auth/resend-otp", { email });
      toastUpdate(toastId, "success", res.data?.message || "OTP has been sent to your email.");
      setSecondsLeft(OTP_SECONDS);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch {
      toastUpdate(toastId, "error", "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const countdown = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <AuthShell cardWidth="max-w-[540px]">
      <Header
        title={step === "email" ? "Forgot Password" : step === "otp" ? "Verify OTP" : "Create New Password"}
        body={
          step === "email"
            ? "Enter your registered email address to receive a verification code."
            : step === "otp"
            ? `Enter the 6-digit code sent to ${email}.`
            : "Choose a new password for your Merlion account."
        }
      />

      {step === "email" && (
        <form onSubmit={submitEmail} className="mt-4 space-y-3">
          <AuthInput
            label="Email Address"
            icon={<Mail className="h-5 w-5" />}
            value={email}
            onChange={setEmail}
            placeholder="Enter your email address"
            type="email"
          />
          <PrimaryButton loading={loading}>Send OTP</PrimaryButton>
          <p className="text-center text-sm text-[#405981]">
            Remembered your password?{" "}
            <Link href="/login" className="font-semibold text-[#005CFF]">Log in</Link>
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitOtp} className="mt-5">
          <div className="mx-auto flex max-w-lg justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(node) => { otpRefs.current[index] = node; }}
                value={digit}
                onChange={(e) => setOtpDigit(index, e.target.value)}
                onPaste={(e) => { e.preventDefault(); pasteOtp(e.clipboardData.getData("text")); }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
                }}
                inputMode="numeric"
                maxLength={1}
                className="h-11 w-10 rounded-xl border border-[#b8c7de] text-center text-lg font-bold text-[#071F55] outline-none transition focus:border-[#0B5ED7] focus:ring-4 focus:ring-[#0B5ED7]/10 sm:w-12"
              />
            ))}
          </div>

          <div className="mt-4 text-center text-xs text-[#405981]">
            {secondsLeft > 0 ? (
              <p>Resend code after <span className="font-bold text-[#071F55]">{countdown}</span></p>
            ) : (
              <button type="button" onClick={resendOtp} disabled={loading} className="font-bold text-[#005CFF] disabled:opacity-50">
                Resend OTP
              </button>
            )}
          </div>

          <div className="mt-5">
            <PrimaryButton loading={loading}>Verify OTP</PrimaryButton>
          </div>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="mt-3 w-full text-center text-xs font-semibold text-[#405981]"
          >
            Change email address
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={submitPassword} className="mt-4 space-y-3">
          <PasswordInput
            label="New Password"
            value={newPassword}
            show={showPassword}
            onToggle={() => setShowPassword((p) => !p)}
            onChange={setNewPassword}
            placeholder="Enter new password"
          />
          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm((p) => !p)}
            onChange={setConfirmPassword}
            placeholder="Confirm new password"
          />
          <PrimaryButton loading={loading}>Reset Password</PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}

function Header({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <div className="flex w-full items-center justify-center gap-4">
        <span className="h-px flex-1 bg-[#9db2d3]" />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef5ff] text-[#0B5ED7] shadow-[0_12px_28px_rgba(11,94,215,0.16)]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="h-px flex-1 bg-[#9db2d3]" />
      </div>
      <h2 className="mt-2 text-xl font-bold leading-tight text-[#071F55] sm:text-2xl">{title}</h2>
      <p className="mt-1 hidden max-w-md text-xs leading-5 text-[#405981] sm:block sm:text-sm">{body}</p>
    </div>
  );
}

function AuthInput({
  label, icon, value, onChange, placeholder, type = "text",
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-[#071F55]">{label}</span>
      <div className="mt-1 flex h-10 items-center rounded-xl border border-[#b8c7de] bg-white px-3 transition focus-within:border-[#0B5ED7] focus-within:ring-4 focus-within:ring-[#0B5ED7]/10">
        <span className="shrink-0 text-[#071F55]/70">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="ml-3 w-full bg-transparent text-xs font-medium text-[#071F55] outline-none placeholder:text-[#6b7d9c] sm:text-sm"
        />
      </div>
    </label>
  );
}

function PasswordInput({
  label, value, show, onToggle, onChange, placeholder,
}: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-[#071F55]">{label}</label>
      <div className="mt-1 flex h-10 items-center rounded-xl border border-[#b8c7de] bg-white px-3 transition focus-within:border-[#0B5ED7] focus-within:ring-4 focus-within:ring-[#0B5ED7]/10">
        <LockKeyhole className="h-5 w-5 shrink-0 text-[#071F55]/70" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="ml-3 w-full bg-transparent text-xs font-medium text-[#071F55] outline-none placeholder:text-[#6b7d9c] sm:text-sm"
        />
        <button type="button" onClick={onToggle} className="text-[#071F55]">
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function PrimaryButton({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#001f5f] text-sm font-bold text-white shadow-[0_16px_34px_rgba(0,31,95,0.22)] transition hover:bg-[#001747] disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{children} <ArrowRight className="h-4 w-4" /></>}
    </button>
  );
}
