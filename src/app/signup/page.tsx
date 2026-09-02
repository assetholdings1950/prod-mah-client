"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import {
  ArrowRight, Check, Eye, EyeOff, Gift, LockKeyhole, Loader2, Mail, ShieldCheck, UserRound,
} from "lucide-react";
import appClient from "@/lib/appClient";
import { toastLoading, toastUpdate, toastError } from "@/utils/toast-message/toast-message";

type SignupForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  referral: string;
  agreed: boolean;
};

const initialForm: SignupForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  referral: "",
  agreed: false,
};

const OTP_SECONDS = 300;

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageClient />
    </Suspense>
  );
}

function SignupPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const stepParam = searchParams.get("step");
    if (emailParam) {
      setForm((prev) => ({ ...prev, email: emailParam }));
    }
    if (stepParam === "otp") {
      setStep("otp");
    }
  }, [searchParams]);

  const passwordRules = useMemo(() => [
    { label: "At least 8 characters", valid: form.password.length >= 8 },
    { label: "One lowercase letter", valid: /[a-z]/.test(form.password) },
    { label: "One special character", valid: /[^A-Za-z0-9]/.test(form.password) },
    { label: "One uppercase letter", valid: /[A-Z]/.test(form.password) },
    { label: "One number", valid: /\d/.test(form.password) },
  ], [form.password]);

  const canSubmit = passwordRules.every(r => r.valid) && form.agreed && !!form.firstName && !!form.lastName && !!form.email;
  const otpValue = otp.join("");

  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => setSecondsLeft(prev => Math.max(prev - 1, 0)), 1000);
    window.setTimeout(() => otpRefs.current[0]?.focus(), 120);
    return () => window.clearInterval(timer);
  }, [step]);

  const updateField = <K extends keyof SignupForm>(key: K, value: SignupForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const submitSignup = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!canSubmit) {
      toastError("Please complete all required fields and password requirements.");
      return;
    }
    setLoading(true);
    const toastId = toastLoading("Creating your account...");
    try {
      const payload: Record<string, string> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      };
      if (form.referral.trim()) payload.referralCode = form.referral.trim();

      const res = await appClient.post("/api/clients/register", payload);
      if (!res.data?.status) {
        toastUpdate(toastId, "error", res.data?.message || "Registration failed. Please try again.");
        return;
      }
      toastUpdate(toastId, "success", res.data.message || "Account created! Check your email for the OTP.");
      setSecondsLeft(OTP_SECONDS);
      setStep("otp");
    } catch (err: unknown) {
      toastUpdate(toastId, "error", (err as { message?: string })?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otpValue)) {
      toastError("Enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    const toastId = toastLoading("Verifying your code...");
    try {
      const res = await appClient.post("/api/auth/verify-otp", { email: form.email, otp: otpValue });
      if (!res.data?.status) {
        toastUpdate(toastId, "error", res.data?.message || "Invalid or expired OTP.");
        return;
      }
      toastUpdate(toastId, "success", res.data.message || "Email verified successfully.");
      router.push("/login?verified=1");
    } catch (err: unknown) {
      toastUpdate(toastId, "error", (err as { message?: string })?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const setOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp(prev => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (value: string) => {
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
      const res = await appClient.post("/api/auth/resend-otp", { email: form.email });
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
    <AuthShell cardWidth="max-w-[680px]">
      <Header
        icon={<ShieldCheck className="h-5 w-5" />}
        title={step === "form" ? "Create Your Account" : "Verify Your Email"}
        body={step === "form" ? "Sign up to access exclusive investment opportunities and expert insights." : `Enter the 6-digit code sent to ${form.email}.`}
      />

      {step === "form" ? (
        <form onSubmit={submitSignup} className="mt-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <AuthField label="First Name" icon={<UserRound className="h-5 w-5" />} placeholder="Enter your first name" value={form.firstName} onChange={v => updateField("firstName", v)} />
            <AuthField label="Last Name" icon={<UserRound className="h-5 w-5" />} placeholder="Enter your last name" value={form.lastName} onChange={v => updateField("lastName", v)} />
          </div>

          <AuthField label="Email Address" icon={<Mail className="h-5 w-5" />} placeholder="Enter your email address" type="email" value={form.email} onChange={v => updateField("email", v)} />

          <PasswordField value={form.password} show={showPassword} onToggle={() => setShowPassword(p => !p)} onChange={v => updateField("password", v)} />

          <div className="rounded-xl bg-[#f4f7fc] p-3">
            <p className="text-xs font-bold text-[#071F55]">Password must contain:</p>
            <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-3">
              {passwordRules.map(rule => (
                <div key={rule.label} className="flex items-center gap-2 text-xs text-[#071F55]">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${rule.valid ? "border-[#0B5ED7] text-[#0B5ED7]" : "border-[#9db2d3] text-transparent"}`}>
                    <Check className="h-3 w-3" />
                  </span>
                  {rule.label}
                </div>
              ))}
            </div>
          </div>

          <AuthField label="Referral Code (if available)" icon={<Gift className="h-5 w-5" />} placeholder="Enter referral code (optional)" value={form.referral} onChange={v => updateField("referral", v)} />

          <label className="flex items-center gap-2 text-xs text-[#071F55]">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={e => updateField("agreed", e.target.checked)}
              className="h-4 w-4 rounded border-[#9db2d3] accent-[#0B5ED7]"
            />
            <span>I agree to the <Link href="/terms-and-conditions" className="text-[#005CFF]">Terms & Conditions</Link> and <Link href="/privacy-policy" className="text-[#005CFF]">Privacy Policy</Link></span>
          </label>

          <PrimaryButton disabled={!canSubmit || loading} loading={loading}>Create Account</PrimaryButton>

          <p className="text-center text-sm text-[#405981]">
            Already have an account? <Link href="/login" className="font-semibold text-[#005CFF]">Log in</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="mt-5">
          <OtpInputs otp={otp} refs={otpRefs} onDigit={setOtpDigit} onPaste={handleOtpPaste} />

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

          <button type="button" onClick={() => setStep("form")} className="mt-3 w-full text-center text-xs font-semibold text-[#405981]">
            Back to signup details
          </button>
        </form>
      )}
    </AuthShell>
  );
}

function Header({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <div className="flex w-full items-center justify-center gap-4">
        <span className="h-px flex-1 bg-[#9db2d3]" />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef5ff] text-[#0B5ED7] shadow-[0_12px_28px_rgba(11,94,215,0.16)]">
          {icon}
        </div>
        <span className="h-px flex-1 bg-[#9db2d3]" />
      </div>
      <h2 className="mt-2 text-xl font-bold leading-tight text-[#071F55] sm:text-2xl">{title}</h2>
      <p className="mt-1 hidden max-w-md text-xs leading-5 text-[#405981] sm:block sm:text-sm">{body}</p>
    </div>
  );
}

function AuthField({ label, icon, placeholder, value, onChange, type = "text" }: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
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
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="ml-3 w-full bg-transparent text-xs font-medium text-[#071F55] outline-none placeholder:text-[#6b7d9c] sm:text-sm"
        />
      </div>
    </label>
  );
}

function PasswordField({ value, show, onToggle, onChange }: {
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-[#071F55]">Password</label>
      <div className="mt-1 flex h-10 items-center rounded-xl border border-[#b8c7de] bg-white px-3 transition focus-within:border-[#0B5ED7] focus-within:ring-4 focus-within:ring-[#0B5ED7]/10">
        <LockKeyhole className="h-5 w-5 shrink-0 text-[#071F55]/70" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Create a strong password"
          className="ml-3 w-full bg-transparent text-xs font-medium text-[#071F55] outline-none placeholder:text-[#6b7d9c] sm:text-sm"
        />
        <button type="button" onClick={onToggle} className="text-[#071F55]">
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function OtpInputs({ otp, refs, onDigit, onPaste }: {
  otp: string[];
  refs: React.RefObject<Array<HTMLInputElement | null>>;
  onDigit: (index: number, value: string) => void;
  onPaste: (value: string) => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg justify-center gap-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={node => { refs.current[index] = node; }}
          value={digit}
          onChange={e => onDigit(index, e.target.value)}
          onPaste={e => { e.preventDefault(); onPaste(e.clipboardData.getData("text")); }}
          onKeyDown={e => { if (e.key === "Backspace" && !otp[index] && index > 0) refs.current[index - 1]?.focus(); }}
          inputMode="numeric"
          maxLength={1}
          className="h-11 w-10 rounded-xl border border-[#b8c7de] text-center text-lg font-bold text-[#071F55] outline-none transition focus:border-[#0B5ED7] focus:ring-4 focus:ring-[#0B5ED7]/10 sm:w-12"
        />
      ))}
    </div>
  );
}

function PrimaryButton({ children, disabled = false, loading = false }: { children: React.ReactNode; disabled?: boolean; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#001f5f] text-sm font-bold text-white shadow-[0_16px_34px_rgba(0,31,95,0.22)] transition hover:bg-[#001747] disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{children} <ArrowRight className="h-4 w-4" /></>}
    </button>
  );
}
