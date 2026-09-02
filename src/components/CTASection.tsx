"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import iconImg from "@/app/icon.png";

/* ── Floating background orbs ───────────────────────────────── */
const ORBS = [
  { x: "8%",  y: "18%", size: 320, color: "rgba(37,99,235,0.10)", dur: "18s", delay: "0s"   },
  { x: "72%", y: "62%", size: 260, color: "rgba(37,99,235,0.07)", dur: "23s", delay: "3s"   },
  { x: "48%", y: "88%", size: 200, color: "rgba(96,165,250,0.06)", dur: "16s", delay: "1.5s" },
  { x: "88%", y: "12%", size: 180, color: "rgba(37,99,235,0.08)", dur: "20s", delay: "5s"   },
  { x: "30%", y: "55%", size: 140, color: "rgba(96,165,250,0.05)", dur: "26s", delay: "8s"  },
];

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    label: "MAS Regulated",
    desc: "Fully licensed under Singapore's Monetary Authority with strict compliance standards.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    label: "Capital Protected",
    desc: "All client funds held in segregated custodian accounts with institutional-grade security.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    label: "Consistent Returns",
    desc: "Proven track record of delivering risk-adjusted returns across global market cycles.",
  },
];

export default function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [active, setActive] = useState(false);
  const [hov, setHov] = useState(false);
  const [magnetic, setMagnetic] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgParallaxY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setMagnetic({ x: (e.clientX - cx) * 0.28, y: (e.clientY - cy) * 0.28 });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ background: "#081B3A" }}
    >
      {/* ── Background layers ──────────────────────────────────── */}

      {/* Dot texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Animated floating orbs with scroll parallax */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgParallaxY }}>
        {ORBS.map((o, i) => (
          <div
            key={i}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: o.x,
              top: o.y,
              width: o.size,
              height: o.size,
              background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
              transform: "translate(-50%, -50%)",
              animation: `float-gentle ${o.dur} ease-in-out infinite`,
              animationDelay: o.delay,
            }}
          />
        ))}
      </motion.div>

      {/* Centre radial spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 38% 50%, rgba(37,99,235,0.16) 0%, transparent 70%)",
        }}
      />

      {/* Slow-rotating ring — bottom left */}
      <svg
        className="absolute pointer-events-none hidden md:block"
        style={{
          left: "-100px",
          bottom: "-60px",
          opacity: 0.07,
          animation: "spin-slow 90s linear infinite",
          width: "clamp(220px, 30vw, 380px)",
          height: "clamp(220px, 30vw, 380px)",
        }}
        viewBox="0 0 400 400"
      >
        <circle cx="200" cy="200" r="190" fill="none" stroke="white" strokeWidth="0.8" strokeDasharray="5 16" />
        <circle cx="200" cy="200" r="152" fill="none" stroke="#60A5FA" strokeWidth="0.6" strokeDasharray="3 10" />
        <circle cx="200" cy="200" r="112" fill="none" stroke="white" strokeWidth="0.4" strokeDasharray="2 8" />
      </svg>

      {/* ── Content ────────────────────────────────────────────── */}
      <div
        className="relative mx-auto"
        style={{
          maxWidth: "1400px",
          padding: "clamp(64px, 10vw, 120px) clamp(14px, 5.5vw, 96px)",
        }}
      >
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-24">

          {/* ── LEFT: text content ─────────────────────────────── */}
          <div className="flex-1 flex flex-col items-start">

            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-6 sm:mb-7"
              style={{
                border: "1px solid rgba(96,165,250,0.25)",
                background: "rgba(37,99,235,0.12)",
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s 0.05s ease-out, transform 0.7s 0.05s cubic-bezier(0.23,1,0.32,1)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "#60A5FA", animation: "pulse-glow 2s ease-in-out infinite" }}
              />
              <span
                className="font-[var(--font-inter,sans-serif)] font-semibold uppercase tracking-[0.2em]"
                style={{ fontSize: "clamp(0.48rem, 1.2vw, 0.58rem)", color: "#60A5FA" }}
              >
                Merlion Asset Holdings · Singapore
              </span>
            </div>

            {/* Headline */}
            <h2
              className="m-0 leading-[1.08] tracking-[-0.025em]"
              style={{
                fontSize: "clamp(2rem, 4.8vw, 3.8rem)",
                fontFamily: "var(--font-playfair, serif)",
                fontWeight: 700,
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(28px)",
                transition: "opacity 0.85s 0.18s ease-out, transform 0.85s 0.18s cubic-bezier(0.23,1,0.32,1)",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(120deg, #93C5FD 0%, #60A5FA 40%, #BFDBFE 80%, #93C5FD 100%)",
                  backgroundSize: "250% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer-gold 5s linear infinite",
                }}
              >
                Build Your Future
              </span>
              <br />
              <span className="text-white">With Confidence</span>
            </h2>

            {/* Divider */}
            <div
              className="flex items-center gap-3 my-5 sm:my-7"
              style={{
                opacity: active ? 1 : 0,
                transition: "opacity 0.7s 0.32s ease-out",
              }}
            >
              <div className="h-[1.5px] w-10" style={{ background: "rgba(96,165,250,0.5)" }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(96,165,250,0.5)" }} />
              <div className="h-px w-6" style={{ background: "rgba(96,165,250,0.25)" }} />
            </div>

            {/* Sub-copy */}
            <p
              className="font-[var(--font-inter,sans-serif)] leading-[1.8] m-0 mb-8 sm:mb-10"
              style={{
                fontSize: "clamp(0.78rem, 1.4vw, 1rem)",
                color: "rgba(255,255,255,0.55)",
                maxWidth: "480px",
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s 0.42s ease-out, transform 0.7s 0.42s cubic-bezier(0.23,1,0.32,1)",
              }}
            >
              Join thousands of investors who trust Merlion Asset Holdings to grow and
              protect their wealth. Institutional discipline, transparent reporting,
              and personalised advisory — built for the future.
            </p>

            {/* Feature list */}
            <div
              className="flex flex-col gap-4 sm:gap-5 mb-10 sm:mb-12 w-full"
              style={{
                maxWidth: "480px",
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s 0.52s ease-out, transform 0.7s 0.52s cubic-bezier(0.23,1,0.32,1)",
              }}
            >
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3 sm:gap-4">
                  <div
                    className="shrink-0 flex items-center justify-center rounded-lg"
                    style={{
                      width: "clamp(34px, 3.5vw, 42px)",
                      height: "clamp(34px, 3.5vw, 42px)",
                      background: "rgba(37,99,235,0.18)",
                      border: "1px solid rgba(96,165,250,0.2)",
                      color: "#60A5FA",
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <p
                      className="font-[var(--font-inter,sans-serif)] font-semibold text-white m-0 mb-0.5"
                      style={{ fontSize: "clamp(0.72rem, 1.2vw, 0.85rem)" }}
                    >
                      {f.label}
                    </p>
                    <p
                      className="font-[var(--font-inter,sans-serif)] m-0 leading-[1.6]"
                      style={{ fontSize: "clamp(0.62rem, 1vw, 0.72rem)", color: "rgba(255,255,255,0.4)" }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div
              className="flex flex-row flex-wrap gap-3 sm:gap-4"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s 0.62s ease-out, transform 0.7s 0.62s cubic-bezier(0.23,1,0.32,1)",
              }}
            >
              <a
                ref={btnRef}
                href="#contact"
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => { setHov(false); setMagnetic({ x: 0, y: 0 }); }}
                onMouseMove={handleMagneticMove}
                className="inline-flex items-center justify-center gap-2.5 rounded-full font-[var(--font-inter,sans-serif)] font-semibold no-underline"
                style={{
                  fontSize: "clamp(0.72rem, 1.3vw, 0.9rem)",
                  letterSpacing: "0.04em",
                  padding: "clamp(12px, 1.8vh, 16px) clamp(28px, 4vw, 44px)",
                  background: "rgba(255,255,255,0.95)",
                  color: "#081B3A",
                  boxShadow: hov
                    ? "0 20px 48px rgba(0,0,0,0.4)"
                    : "0 8px 28px rgba(0,0,0,0.28)",
                  transform: `translate(${magnetic.x}px, ${magnetic.y}px) scale(${hov ? 1.04 : 1})`,
                  transition: hov
                    ? "transform 0.1s ease-out, box-shadow 0.3s ease"
                    : "transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease",
                  willChange: "transform",
                }}
              >
                Start Investing Today
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transition: "transform 0.3s", transform: hov ? "translateX(3px)" : "none" }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>

              <Link
                href="/funds"
                className="inline-flex items-center justify-center gap-2 rounded-full font-[var(--font-inter,sans-serif)] font-medium no-underline transition-all duration-300 hover:bg-white/10"
                style={{
                  fontSize: "clamp(0.72rem, 1.3vw, 0.9rem)",
                  letterSpacing: "0.04em",
                  padding: "clamp(12px, 1.8vh, 16px) clamp(28px, 4vw, 44px)",
                  color: "rgba(255,255,255,0.7)",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                }}
              >
                Explore Funds
              </Link>
            </div>
          </div>

          {/* ── RIGHT: icon image ───────────────────────────────── */}
          <div
            className="shrink-0 flex items-center justify-center relative"
            style={{
              width: "clamp(260px, 36vw, 460px)",
              height: "clamp(260px, 36vw, 460px)",
              opacity: active ? 1 : 0,
              transform: active ? "scale(1)" : "scale(0.92)",
              transition: "opacity 0.9s 0.35s ease-out, transform 0.9s 0.35s cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            {/* Outer animated ring */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 460 460"
              style={{ animation: "spin-slow 60s linear infinite", opacity: 0.18 }}
            >
              <circle cx="230" cy="230" r="224" fill="none" stroke="#60A5FA" strokeWidth="0.8" strokeDasharray="6 14" />
              <circle cx="230" cy="230" r="196" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="3 10" />
            </svg>

            {/* Counter-rotating inner ring */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 460 460"
              style={{ animation: "spin-slow 40s linear infinite reverse", opacity: 0.12 }}
            >
              <circle cx="230" cy="230" r="165" fill="none" stroke="#93C5FD" strokeWidth="0.7" strokeDasharray="4 12" />
            </svg>

            {/* Glow behind image */}
            <div
              className="absolute rounded-full"
              style={{
                width: "62%",
                height: "62%",
                background: "radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)",
                animation: "pulse-glow 3.5s ease-in-out infinite",
              }}
            />

            {/* Icon image */}
            <div
              className="relative rounded-full overflow-hidden"
              style={{
                width: "55%",
                height: "55%",
                border: "1.5px solid rgba(96,165,250,0.25)",
                boxShadow: "0 0 60px rgba(37,99,235,0.3), 0 24px 48px rgba(0,0,0,0.4)",
              }}
            >
              <Image
                src={iconImg}
                alt="Merlion Asset Holdings"
                fill
                sizes="(max-width: 768px) 140px, 260px"
                className="object-cover"
              />
            </div>

            {/* Floating badge — top right */}
            <div
              className="absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
              style={{
                top: "14%",
                right: "4%",
                background: "rgba(8,27,58,0.85)",
                border: "1px solid rgba(96,165,250,0.25)",
                backdropFilter: "blur(8px)",
                animation: "float-gentle 5s ease-in-out infinite",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#34d399" }} />
              <span
                className="font-[var(--font-inter,sans-serif)] font-semibold uppercase tracking-[0.12em] text-white"
                style={{ fontSize: "0.5rem" }}
              >
                Est. 2024
              </span>
            </div>

            {/* Floating badge — bottom left */}
            <div
              className="absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
              style={{
                bottom: "16%",
                left: "3%",
                background: "rgba(8,27,58,0.85)",
                border: "1px solid rgba(96,165,250,0.25)",
                backdropFilter: "blur(8px)",
                animation: "float-gentle 6s ease-in-out infinite",
                animationDelay: "2s",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span
                className="font-[var(--font-inter,sans-serif)] font-semibold uppercase tracking-[0.12em] text-white"
                style={{ fontSize: "0.5rem" }}
              >
                MAS Regulated
              </span>
            </div>
          </div>
        </div>

        {/* ── Trust strip ─────────────────────────────────────────── */}
        <div
          className="mt-16 sm:mt-20 pt-8 sm:pt-10 flex flex-wrap items-center justify-center sm:justify-between gap-6 sm:gap-8"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            opacity: active ? 1 : 0,
            transition: "opacity 0.7s 0.75s ease-out",
          }}
        >
          {[
            { label: "10,000+", sub: "Global Investors" },
            { label: "USD 1B+", sub: "Assets Under Management" },
            { label: "MAS", sub: "Licensed & Regulated" },
            { label: "15+", sub: "Markets Covered" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span
                className="font-[var(--font-playfair,serif)] font-bold text-white leading-none"
                style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)" }}
              >
                {item.label}
              </span>
              <span
                className="font-[var(--font-inter,sans-serif)] uppercase tracking-[0.14em]"
                style={{ fontSize: "clamp(0.42rem, 0.85vw, 0.52rem)", color: "rgba(255,255,255,0.32)" }}
              >
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
