"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import appClient from "@/lib/appClient";
import { InvestmentPlanInterface } from "@/interface/investmentPlan";
import FundsCarousel3D from "./UI/Fundscarousel3d";

/* ─── Formatters ─────────────────────────────────────────────── */
const fmtROI = (p: InvestmentPlanInterface) =>
  p.roiType === "fixed" ? `${p.roiMin}%` : `${p.roiMin}–${p.roiMax}%`;

const fmtDuration = (min: number, max: number) =>
  min === max ? `${min} mo` : `${min}–${max} mo`;

const PAYOUT_LABEL: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  maturity: "At Maturity",
};

const CATEGORY_LABEL: Record<string, string> = {
  monthly: "Monthly SIP",
  lumpsum: "Lump Sum",
  crypto: "Crypto",
};

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low Risk", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  medium: { label: "Medium Risk", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  high: { label: "High Risk", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  very_high: { label: "Very High Risk", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

/* gradient per card index for visual variety */
const CARD_GRADIENTS = [
  "linear-gradient(148deg, #081B3A 0%, #0f2a52 50%, #1d4ed8 100%)",
  "linear-gradient(148deg, #061526 0%, #0e2346 50%, #2563EB 100%)",
  "linear-gradient(148deg, #080f20 0%, #081B3A 45%, #1e3a8a 100%)",
];

/* ─── Skeleton card ──────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 animate-pulse">
      <div className="h-32 sm:h-52 bg-slate-200" />
      <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
        <div className="h-4 sm:h-5 bg-slate-200 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="flex gap-1.5 sm:gap-2 pt-1">
          {[...Array(3)].map((_, i) => <div key={i} className="h-7 sm:h-8 flex-1 bg-slate-100 rounded-xl" />)}
        </div>
        <div className="h-9 sm:h-10 bg-slate-100 rounded-xl mt-2" />
      </div>
    </div>
  );
}

/* ─── Enhanced fund card ─────────────────────────────────────── */
function FundCard({
  plan,
  index,
}: {
  plan: InvestmentPlanInterface;
  index: number;
}) {
  const [hov, setHov] = useState(false);
  const risk = RISK_CONFIG[plan.riskLevel] ?? RISK_CONFIG.medium;

  return (
    <div
      className="relative flex flex-col rounded-3xl overflow-hidden bg-white cursor-grab active:cursor-grabbing"
      style={{
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: hov
          ? "0 40px 80px -24px rgba(8,27,58,0.45), 0 8px 24px rgba(8,27,58,0.12), inset 0 1px 0 rgba(255,255,255,0.9)"
          : "0 30px 60px -28px rgba(8,27,58,0.4), 0 4px 14px rgba(8,27,58,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        transition: "box-shadow 0.4s ease",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* ── Visual header ────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: "clamp(160px, 24vw, 210px)" }}>
        {/* Background: photo or gradient */}
        {plan.photourl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={plan.photourl}
            alt={plan.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out"
            style={{ transform: hov ? "scale(1.08)" : "scale(1)" }}
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: CARD_GRADIENTS[index % CARD_GRADIENTS.length] }} />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,27,58,0.25) 0%, rgba(8,27,58,0.7) 58%, rgba(8,27,58,0.96) 100%)",
          }}
        />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Sheen sweep on hover */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ opacity: hov ? 1 : 0, transition: "opacity 0.4s ease" }}
        >
          <div
            style={{
              position: "absolute", top: 0, left: hov ? "120%" : "-60%", width: "55%", height: "100%",
              background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.18), transparent)",
              transition: "left 0.9s cubic-bezier(0.23,1,0.32,1)",
            }}
          />
        </div>

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-start justify-between gap-1">
          <span
            className="font-[var(--font-inter,sans-serif)] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-lg"
            style={{
              fontSize: "clamp(0.5rem, 1vw, 0.6rem)",
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
            }}
          >
            {CATEGORY_LABEL[plan.category] ?? plan.category}
          </span>

          <span
            className="font-[var(--font-inter,sans-serif)] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg shrink-0"
            style={{
              fontSize: "clamp(0.48rem, 0.95vw, 0.56rem)",
              background: risk.bg,
              color: risk.color,
              border: `1px solid ${risk.color}55`,
              backdropFilter: "blur(8px)",
            }}
          >
            {risk.label}
          </span>
        </div>

        {/* ROI */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 sm:px-5 sm:pb-5">
          <div
            className="font-[var(--font-inter,sans-serif)] uppercase tracking-[0.18em] mb-0.5 sm:mb-1"
            style={{ fontSize: "clamp(0.46rem, 1vw, 0.56rem)", color: "rgba(255,255,255,0.55)" }}
          >
            Annual Return
          </div>
          <div
            className="font-[var(--font-playfair,serif)] leading-none font-bold text-white"
            style={{ fontSize: "clamp(1.7rem, 4vw, 2.5rem)", letterSpacing: "-0.02em" }}
          >
            {fmtROI(plan)}
            <span
              className="font-[var(--font-inter,sans-serif)] font-medium ml-1 text-white/55"
              style={{ fontSize: "clamp(0.66rem, 1.4vw, 0.9rem)" }}
            >
              p.a.
            </span>
          </div>
        </div>
      </div>

      {/* ── Card body ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 sm:p-6">
        <h3
          className="font-[var(--font-playfair,serif)] text-navy leading-[1.2] mb-1.5 sm:mb-2 tracking-[-0.01em]"
          style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)", fontWeight: 700 }}
        >
          {plan.name}
        </h3>

        {plan.shortDescription && (
          <p
            className="font-[var(--font-inter,sans-serif)] leading-[1.6] mb-3 sm:mb-4 line-clamp-2"
            style={{ fontSize: "clamp(0.74rem, 1.3vw, 0.84rem)", color: "var(--text-muted)" }}
            dangerouslySetInnerHTML={{ __html: plan.shortDescription }}
          />
        )}

        {/* Metric pills */}
        <div className="grid grid-cols-3 gap-2 mb-4 sm:mb-5">
          <MetricPill
            label="Duration"
            value={fmtDuration(plan.durationMinMonths, plan.durationMaxMonths)}
            icon={
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <MetricPill
            label="Payout"
            value={PAYOUT_LABEL[plan.payoutType] ?? plan.payoutType}
            icon={
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            }
          />
          {plan.lockInMonths && plan.lockInMonths > 0 ? (
            <MetricPill
              label="Lock-in"
              value={`${plan.lockInMonths} mo`}
              icon={
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />
          ) : (
            <MetricPill
              label="Period"
              value="Flexible"
              icon={
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
          )}
        </div>

        <div className="flex-1" />

        <div className="h-px w-full mb-3 sm:mb-4" style={{ background: "rgba(8,27,58,0.07)" }} />

        <Link
          href="/funds"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-[var(--font-inter,sans-serif)] font-semibold no-underline transition-all duration-300"
          style={{
            padding: "clamp(11px,1.4vh,14px) 0",
            fontSize: "clamp(0.74rem, 1.3vw, 0.84rem)",
            letterSpacing: "0.04em",
            background: hov ? "var(--navy)" : "rgba(8,27,58,0.05)",
            color: hov ? "#fff" : "var(--navy)",
            border: "1.5px solid rgba(8,27,58,0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          Enquire Now
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-[3px] rounded-b-3xl transition-all duration-500"
        style={{ background: "linear-gradient(90deg, #2563EB, #60A5FA)", width: hov ? "100%" : "0%" }}
      />
    </div>
  );
}

/* ─── Metric pill ────────────────────────────────────────────── */
function MetricPill({
  label, value, icon,
}: {
  label: string; value: string; icon: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-start gap-1 rounded-xl px-2.5 py-2.5"
      style={{ background: "rgba(8,27,58,0.04)", border: "1px solid rgba(8,27,58,0.06)" }}
    >
      <span
        className="font-[var(--font-inter,sans-serif)] font-semibold uppercase tracking-[0.08em] flex items-center gap-1 text-[var(--text-muted)]"
        style={{ fontSize: "clamp(0.44rem, 0.9vw, 0.5rem)" }}
      >
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        {label}
      </span>
      <span
        className="font-[var(--font-inter,sans-serif)] font-bold text-navy leading-none"
        style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.82rem)" }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────── */
export default function FundsSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [plans, setPlans] = useState<InvestmentPlanInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    appClient
      .get("/api/investment-plans", {
        params: { page: "1", limit: "6", search: "", status: "active" },
      })
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        const raw = data?.data ?? data?.plans ?? data?.investmentPlans;
        const docs: InvestmentPlanInterface[] = raw?.docs ?? raw ?? [];
        setPlans(docs);
      })
      .catch((err: { message?: string }) => {
        if (!cancelled) setError(err.message ?? "Could not load funds. Please try again later.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8,27,58,0.035) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(8,27,58,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div
        className="relative mx-auto"
        style={{
          maxWidth: "1400px",
          padding: "clamp(48px, 9vw, 112px) clamp(14px, 5.5vw, 96px)",
        }}
      >
        {/* ── Two-column layout: header left, carousel right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,0.85fr)_1.15fr] gap-8 lg:gap-12 xl:gap-16 items-center">

          {/* ── LEFT: Section header ─────────────────────────── */}
          <div
            className="lg:sticky lg:top-28"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.8s 0.05s ease-out, transform 0.8s 0.05s cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-4 sm:mb-5"
              style={{ border: "1px solid rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.06)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "var(--accent)", animation: "pulse-glow 2s ease-in-out infinite" }}
              />
              <span
                className="font-[var(--font-inter,sans-serif)] font-semibold uppercase tracking-[0.2em]"
                style={{ fontSize: "clamp(0.48rem, 1.2vw, 0.58rem)", color: "var(--accent)" }}
              >
                Investment Funds
              </span>
            </div>

            <h2
              className="m-0 text-navy leading-[1.1] tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.45rem, 3.6vw, 2.9rem)" }}
            >
              Institutional-grade{" "}
              <span className="italic" style={{ color: "var(--accent)" }}>opportunities</span>
            </h2>

            <div className="flex items-center gap-2.5 mt-3 sm:mt-4">
              <div className="h-[1.5px] w-10" style={{ background: "var(--accent)" }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(37,99,235,0.4)" }} />
              <div className="h-px w-6" style={{ background: "rgba(37,99,235,0.2)" }} />
            </div>

            <p
              className="font-[var(--font-inter,sans-serif)] mt-3 sm:mt-4"
              style={{
                fontSize: "clamp(0.7rem, 1.3vw, 0.9rem)",
                color: "var(--text-muted)",
                maxWidth: "420px",
                lineHeight: 1.75,
              }}
            >
              Carefully structured funds designed for capital growth, preservation,
              and digital-age returns. Regulated, transparent, and performance-driven.
            </p>

            {/* View all — desktop */}
            <Link
              href="/funds"
              className="hidden lg:inline-flex items-center gap-2 mt-6 font-[var(--font-inter,sans-serif)] font-medium no-underline transition-all duration-200 hover:gap-3"
              style={{ fontSize: "clamp(0.72rem, 1.2vw, 0.82rem)", color: "var(--accent)" }}
            >
              View all funds
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* ── RIGHT: Cards ─────────────────────────────────── */}
          <div className="min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div
                className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl"
                style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="font-[var(--font-inter,sans-serif)] text-sm font-medium" style={{ color: "#ef4444" }}>
                  {error}
                </p>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <p className="font-[var(--font-inter,sans-serif)] text-sm" style={{ color: "var(--text-muted)" }}>
                  No active funds available at this time.
                </p>
              </div>
            ) : (
              /* ── 3D coverflow carousel ── */
              <div
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? "translateY(0)" : "translateY(28px)",
                  transition: "opacity 0.8s 0.15s ease-out, transform 0.9s 0.15s cubic-bezier(0.23,1,0.32,1)",
                }}
              >
                <FundsCarousel3D
                  autoPlay={5000}
                  items={plans.map((plan, i) => (
                    <FundCard key={plan._id ?? i} plan={plan} index={i} />
                  ))}
                />
              </div>
            )}

            {/* ── Mobile view-all link ──────────────────────── */}
            {!loading && !error && plans.length > 0 && (
              <div
                className="flex justify-center mt-6 lg:hidden"
                style={{ opacity: active ? 1 : 0, transition: "opacity 0.8s 0.6s ease-out" }}
              >
                <Link
                  href="/funds"
                  className="inline-flex items-center gap-2 font-[var(--font-inter,sans-serif)] font-medium no-underline"
                  style={{ fontSize: "0.8rem", color: "var(--accent)" }}
                >
                  View all funds
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}