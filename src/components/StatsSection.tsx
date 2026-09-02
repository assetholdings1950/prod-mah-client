"use client";

import { useScrollReveal } from "@/hooks/UseScrollReveal";
import { useEffect, useRef, useState, type ReactNode } from "react";
import SoftAurora from "./UI/SoftAurora";


/* ─── Types ──────────────────────────────────────────────────── */
interface Stat {
  value: number;
  decimals: number;
  suffix: string;
  prefix?: string;
  label: string;
  sub: string;
  shade: "bright" | "deep";
  icon: ReactNode;
}

/* ─── Counter hook ───────────────────────────────────────────── */
function useCounter(target: number, decimals: number, active: boolean, duration = 2200) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);
  const start = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    start.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, target, decimals, duration]);

  return count;
}

/* ─── Reusable scroll-reveal wrapper ─────────────────────────── */
function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const [ref, visible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.7s ${delay}s ease-out, transform 0.8s ${delay}s cubic-bezier(0.23,1,0.32,1)`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Blue accent shades (no gold) ──────────────────────────── */
const SHADES = {
  bright: { hex: "#60A5FA", rgb: "96,165,250" },
  deep: { hex: "#3B82F6", rgb: "59,130,246" },
} as const;

/* ─── Stat data ──────────────────────────────────────────────── */
const STATS: Stat[] = [
  {
    value: 125, decimals: 0, suffix: "M+", prefix: "S$",
    label: "Assets Under Management", sub: "Growing portfolio across global markets",
    shade: "bright",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    value: 10000, decimals: 0, suffix: "+",
    label: "Global Investors", sub: "Trusted by accredited investors worldwide",
    shade: "deep",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: 97.06, decimals: 2, suffix: "%",
    label: "Success Rate", sub: "Consistent performance across all funds",
    shade: "bright",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    value: 24, decimals: 0, suffix: "/7",
    label: "Expert Support", sub: "Round-the-clock advisory and monitoring",
    shade: "deep",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

/* ─── Stat card with 3D tilt + scroll reveal ─────────────────── */
function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const [cardRef, visible] = useScrollReveal<HTMLDivElement>({ threshold: 0.25 });
  const [hov, setHov] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const count = useCounter(stat.value, stat.decimals, visible, 2000 + index * 150);

  const { hex, rgb } = SHADES[stat.shade];
  const delay = 0.08 + index * 0.1;

  const display =
    stat.value === 10000
      ? count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toFixed(0)
      : count.toFixed(stat.decimals);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ x: (y - 0.5) * -16, y: (x - 0.5) * 16 });
    setSpot({ x: x * 100, y: y * 100 });
  };

  const handleLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHov(false);
  };

  /* transition logic — three phases */
  const transform = !visible
    ? "perspective(1000px) rotateX(14deg) rotateY(-4deg) translateY(52px) scale(0.94)"
    : hov
      ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px) scale(1.03)`
      : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)";

  const transition = !visible
    ? `opacity 0.7s ${delay}s ease-out, transform 0.9s ${delay}s cubic-bezier(0.23,1,0.32,1)`
    : hov
      ? "transform 0.06s ease-out, box-shadow 0.2s ease, border-color 0.2s ease"
      : "transform 0.65s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, border-color 0.4s ease";

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl cursor-default select-none"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: `1px solid rgba(${rgb},${hov ? 0.4 : 0.12})`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "clamp(12px, 2.6vw, 34px)",
        opacity: visible ? 1 : 0,
        transform,
        transition,
        boxShadow: hov
          ? `0 32px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(${rgb},0.18), inset 0 1px 0 rgba(255,255,255,0.08)`
          : "0 4px 28px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        willChange: "transform, opacity",
      }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={handleLeave}
    >
      {/* Mouse-following spotlight */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(${rgb},0.14) 0%, transparent 65%)`,
          opacity: hov ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Corner glow blob */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(${rgb},0.22) 0%, transparent 70%)`,
          opacity: hov ? 1 : 0.3,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Shimmer sweep on hover */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
        style={{ opacity: hov ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        <div
          style={{
            position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
            background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.04) 50%, transparent 80%)",
            animation: hov ? "shimmer-sweep 1.4s ease-in-out" : "none",
          }}
        />
      </div>

      {/* Icon */}
      <div
        className="relative inline-flex items-center justify-center rounded-xl mb-3 sm:mb-4"
        style={{
          width: "clamp(30px,4vw,46px)",
          height: "clamp(30px,4vw,46px)",
          background: `rgba(${rgb},0.14)`,
          color: hex,
          boxShadow: hov
            ? `0 0 0 1px rgba(${rgb},0.3), 0 6px 20px rgba(${rgb},0.25), 0 0 0 4px rgba(${rgb},0.06)`
            : "none",
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
          transform: hov ? "translateZ(20px) scale(1.1)" : "translateZ(0) scale(1)",
        }}
      >
        {stat.icon}
      </div>

      {/* Numeric value */}
      <div
        className="font-[var(--font-playfair,serif)] leading-none mb-1.5 sm:mb-2.5"
        style={{
          fontSize: "clamp(1.35rem, 5vw, 3.4rem)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          background: `linear-gradient(135deg, ${hex} 0%, rgba(${rgb},0.75) 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          transition: "transform 0.3s ease",
          transform: hov ? "translateZ(10px)" : "translateZ(0)",
        }}
      >
        {stat.prefix && (
          <span
            className="font-[var(--font-inter,sans-serif)] font-semibold mr-0.5 align-super"
            style={{ fontSize: "clamp(0.55rem, 1.4vw, 1rem)", opacity: 0.7 }}
          >
            {stat.prefix}
          </span>
        )}
        {display}
        <span
          className="font-[var(--font-inter,sans-serif)] font-medium"
          style={{ fontSize: "clamp(0.6rem, 1.6vw, 1.2rem)", opacity: 0.65 }}
        >
          {stat.suffix}
        </span>
      </div>

      {/* Label */}
      <div
        className="font-[var(--font-inter,sans-serif)] font-semibold uppercase tracking-[0.05em] mb-1"
        style={{ fontSize: "clamp(0.46rem, 1.6vw, 0.66rem)", color: "rgba(255,255,255,0.45)" }}
      >
        {stat.label}
      </div>

      {/* Sub text */}
      <div
        className="font-[var(--font-inter,sans-serif)] leading-[1.5]"
        style={{ fontSize: "clamp(0.54rem, 1.8vw, 0.78rem)", color: "rgba(255,255,255,0.28)" }}
      >
        {stat.sub}
      </div>

      {/* Bottom sliding accent bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] rounded-b-2xl"
        style={{
          background: `linear-gradient(90deg, ${hex}, rgba(${rgb},0.3), transparent)`,
          width: hov ? "100%" : "0%",
          transition: "width 0.45s cubic-bezier(0.23,1,0.32,1)",
        }}
      />
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────── */
export default function StatsSection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "var(--navy)" }}
    >
      {/* ── SoftAurora WebGL background ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.5 }}>
        <SoftAurora
          speed={0.9}
          scale={1.6}
          brightness={.9}
          color1="#3B82F6"
          color2="#60A5FA"
          noiseFrequency={2.2}
          bandHeight={0.55}
          bandSpread={1.1}
          colorSpeed={0.7}
          enableMouseInteraction
          mouseInfluence={0.18}
        />
      </div>

      {/* Dot grid texture */}
      {/* <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      /> */}

      {/* Ambient centre glow */}
      {/* <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 55%, rgba(59,130,246,0.08) 0%, transparent 70%)",
        }}
      /> */}

      {/* ── Content ────────────────────────────────────────────── */}
      <div
        className="relative mx-auto"
        style={{
          maxWidth: "1400px",
          padding: "clamp(64px, 9vw, 112px) clamp(18px, 5.5vw, 96px) clamp(60px, 8vw, 104px)",
        }}
      >
        {/* Section header */}
        <Reveal className="text-center mb-10 sm:mb-14">
          {/* Eyebrow — blue only */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{
              border: "1px solid rgba(96,165,250,0.25)",
              background: "rgba(96,165,250,0.07)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: "#60A5FA", animation: "pulse-glow 2s ease-in-out infinite" }}
            />
            <span
              className="font-[var(--font-inter,sans-serif)] font-semibold uppercase tracking-[0.2em]"
              style={{ fontSize: "0.58rem", color: "#60A5FA" }}
            >
              Performance Metrics
            </span>
          </div>

          {/* Headline */}
          <h2
            className="m-0 leading-[1.1] tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.75rem, 3.6vw, 2.9rem)", color: "#FFFFFF" }}
          >
            Driven by{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #60A5FA 0%, #93C5FD 50%, #3B82F6 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer-sweep 4s linear infinite",
              }}
            >
              proven results
            </span>
          </h2>

          {/* Blue divider */}
          <div className="flex items-center justify-center gap-3 mt-4 sm:mt-5">
            <div className="h-px w-10" style={{ background: "rgba(96,165,250,0.35)" }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(96,165,250,0.5)" }} />
            <div className="h-px w-10" style={{ background: "rgba(96,165,250,0.35)" }} />
          </div>

          <p
            className="font-[var(--font-inter,sans-serif)] mt-4 mx-auto"
            style={{
              fontSize: "clamp(0.74rem, 1.3vw, 0.92rem)",
              color: "rgba(255,255,255,0.35)",
              maxWidth: "460px",
              lineHeight: 1.8,
            }}
          >
            Transparent data, consistent delivery. Numbers that reflect disciplined
            investment strategy across global markets.
          </p>
        </Reveal>

        {/* Card grid — 1 col → 2 col → 4 col */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-5">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Footer trust strip */}
        <Reveal
          delay={0.1}
          y={16}
          className="relative flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10 mt-10 sm:mt-14 pt-7 sm:pt-10"
        >
          <div
            className="absolute left-0 right-0 top-0 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          {[
            { label: "MAS Regulated", sub: "Monetary Authority of Singapore", dotColor: "#60A5FA" },
            { label: "Global Coverage", sub: "20+ markets worldwide", dotColor: "#3B82F6" },
            { label: "Capital Protected", sub: "Risk-first philosophy", dotColor: "#60A5FA" },
          ].map(({ label, sub, dotColor }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}66` }}
              />
              <div>
                <div
                  className="font-[var(--font-inter,sans-serif)] font-semibold"
                  style={{ fontSize: "clamp(0.62rem, 1vw, 0.72rem)", color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}
                >
                  {label}
                </div>
                <div
                  className="font-[var(--font-inter,sans-serif)]"
                  style={{ fontSize: "clamp(0.56rem, 0.9vw, 0.64rem)", color: "rgba(255,255,255,0.22)" }}
                >
                  {sub}
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}