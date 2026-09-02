"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Loader2, Mail } from "lucide-react";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";
import { toastLoading, toastUpdate } from "@/utils/toast-message/toast-message";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageClient />
    </Suspense>
  );
}

function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const reset = searchParams.get("reset") === "1";
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("rememberedEmail");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const submitLogin = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!email || !password) {
      toastUpdate(toastLoading(""), "error", "Enter your email address and password.");
      return;
    }

    setLoading(true);
    const toastId = toastLoading("Signing you in...");

    try {
      const res = await appClient.post("/api/auth/signin", { email, password, rememberMe });

      if (!res.data?.status) {
        if (res.data?.otpRequired || (res.data?.statusCode === 403 && res.data?.registeredByAgent)) {
          toastUpdate(toastId, "info", res.data?.message || "A verification code has been sent to your email.");
          router.push(`/signup?email=${encodeURIComponent(email)}&step=otp`);
          return;
        }
        toastUpdate(toastId, "error", res.data?.message || "Sign in failed.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      if (res.data?.user) setUser(res.data.user);
      toastUpdate(toastId, "success", res.data.message || "Welcome back!");
      router.replace(callbackUrl);
    } catch (err: unknown) {
      toastUpdate(toastId, "error", (err as { message?: string })?.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell cardWidth="max-w-[560px]">
      <Header title="Client Login" body="Sign in to access your Merlion investment account." />

      {(verified || reset) && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {verified ? "OTP verified successfully. You can now log in." : "Password reset successfully. Please log in."}
        </div>
      )}

      <form onSubmit={submitLogin} className="mt-3 space-y-3">
        <AuthInput
          label="Email Address"
          icon={<Mail className="h-5 w-5" />}
          value={email}
          onChange={setEmail}
          placeholder="Enter your email address"
          type="email"
        />

        <div>
          <label className="text-xs font-bold text-[#071F55]">Password</label>
          <div className="mt-1 flex h-10 items-center rounded-xl border border-[#b8c7de] bg-white px-3 transition focus-within:border-[#0B5ED7] focus-within:ring-4 focus-within:ring-[#0B5ED7]/10">
            <LockKeyhole className="h-5 w-5 shrink-0 text-[#071F55]/70" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="ml-3 w-full bg-transparent text-xs font-medium text-[#071F55] outline-none placeholder:text-[#6b7d9c] sm:text-sm"
            />
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-[#071F55]">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 text-[#405981]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[#9db2d3] accent-[#0B5ED7]"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-semibold text-[#005CFF]">Forgot password?</Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#001f5f] text-sm font-bold text-white shadow-[0_16px_34px_rgba(0,31,95,0.22)] transition hover:bg-[#001747] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Log In <ArrowRight className="h-4 w-4" /></>}
        </button>

        <p className="text-center text-sm text-[#405981]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[#005CFF]">Create account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

function Header({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <div className="flex w-full items-center justify-center gap-4">
        <span className="h-px flex-1 bg-[#9db2d3]" />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef5ff] text-[#0B5ED7] shadow-[0_12px_28px_rgba(11,94,215,0.16)]">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <span className="h-px flex-1 bg-[#9db2d3]" />
      </div>
      <h2 className="mt-2 text-xl font-bold leading-tight text-[#071F55] sm:text-2xl">{title}</h2>
      <p className="mt-1 hidden max-w-md text-xs leading-5 text-[#405981] sm:block sm:text-sm">{body}</p>
    </div>
  );
}

function AuthInput({ label, icon, value, onChange, placeholder, type = "text" }: {
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
