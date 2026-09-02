"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import RippleGrid from "./UI/RippleGrid";

/* ─── Types ──────────────────────────────────────────────────── */
interface Step {
  number: string;
  title: string;
  desc: string;
  icon: ReactNode;
}
interface Feature {
  title: string;
  desc: string;
  icon: ReactNode;
}

/* ─── Icons (stroke = currentColor so they inherit color) ────── */
const IconUser = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9.5" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);
const IconShield = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const IconWallet = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    <path d="M21 12a2 2 0 0 0-2-2h-4a2 2 0 0 0 0 4h4a2 2 0 0 0 2-2z" />
  </svg>
);
const IconChart = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <line x1="4" y1="20" x2="4" y2="13" /><line x1="9" y1="20" x2="9" y2="9" />
    <line x1="14" y1="20" x2="14" y2="14" /><line x1="19" y1="20" x2="19" y2="6" />
    <polyline points="3 8 9 4 13 8 20 3" /><polyline points="20 7 20 3 16 3" />
  </svg>
);
const IconPie = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);
const IconLock = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconUsers = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconGlobe = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

/* ─── Data ───────────────────────────────────────────────────── */
const STEPS: Step[] = [
  { number: "01", title: "Create Account", desc: "Sign up in a few simple steps and create your secure account.", icon: IconUser },
  { number: "02", title: "Verify Identity", desc: "Complete identity verification to ensure a safe and compliant investment environment.", icon: IconShield },
  { number: "03", title: "Fund Account", desc: "Add funds using your preferred payment method quickly and securely.", icon: IconWallet },
  { number: "04", title: "Invest", desc: "Choose from our investment opportunities and start building your portfolio.", icon: IconChart },
  { number: "05", title: "Track Growth", desc: "Monitor your portfolio performance in real-time and watch your investments grow.", icon: IconPie },
];

const FEATURES: Feature[] = [
  { title: "Secure Platform", desc: "Advanced encryption and multi-layer security.", icon: IconLock },
  { title: "Expert Management", desc: "Professionally managed strategies focused on growth.", icon: IconUsers },
  { title: "Transparent Process", desc: "Clear steps, real information, complete visibility.", icon: IconPie },
  { title: "Global Opportunities", desc: "Access diversified markets and digital assets.", icon: IconGlobe },
];

/* ─── Step card ──────────────────────────────────────────────── */
function StepRow({ step, index, active }: { step: Step; index: number; active: boolean }) {
  const delay = 0.15 + index * 0.12;
  return (
    <div
      className="hiw__row"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateX(0)" : "translateX(24px)",
        transition: `opacity 0.6s ${delay}s ease-out, transform 0.7s ${delay}s cubic-bezier(0.23,1,0.32,1)`,
      }}
    >
      {/* number node */}
      <div className="hiw__node">
        <div className="hiw__circle">
          <span>{step.number}</span>
        </div>
        <div className="hiw__connector" aria-hidden>
          <span className="hiw__connDot" />
        </div>
      </div>

      {/* card */}
      <div className="hiw__card">
        <div className="hiw__iconTile">{step.icon}</div>
        <div className="hiw__cardBody">
          <h3 className="hiw__cardTitle">{step.title}</h3>
          <p className="hiw__cardDesc">{step.desc}</p>
        </div>
        <div className="hiw__watermark" aria-hidden>{step.icon}</div>
      </div>
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────── */
export default function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ["start 0.85", "end 0.4"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="hiw">
      <style>{css}</style>

      {/* backgrounds */}
      <div className="hiw__ripple" aria-hidden>
        <RippleGrid
          gridColor="#2563EB"
          opacity={0.32}
          gridSize={14}
          gridThickness={13}
          rippleIntensity={0.035}
          fadeDistance={1.6}
          vignetteStrength={2.2}
          glowIntensity={0.08}
          mouseInteraction={false}
        />
      </div>
      {/* <div className="hiw__map" aria-hidden />
      <div className="hiw__city" aria-hidden />
      <div className="hiw__wash" aria-hidden /> */}

      <div className="hiw__inner">
        <div className="hiw__top">
          {/* ── LEFT column ── */}
          <div
            className="hiw__left"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.8s 0.05s ease-out, transform 0.9s 0.05s cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            <div className="hiw__eyebrow">
              <span className="hiw__eyebrowLine" />
              <span>How It Works</span>
            </div>

            <h2 className="hiw__heading">
              Your Investment<br />Journey, Simplified
            </h2>

            <div className="hiw__rule" />

            <p className="hiw__lede">
              Start in minutes. Follow five simple steps to invest with confidence
              and track your growth over time.
            </p>

            {/* dark callout */}
            <div className="hiw__callout">
              <div className="hiw__calloutIcon">{IconShield}</div>
              <div>
                <p className="hiw__calloutTitle">Secure. Transparent. Trusted.</p>
                <p className="hiw__calloutDesc">
                  Bank-grade security and compliance standards to protect your
                  investments and personal data.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT timeline ── */}
          <div className="hiw__timeline">
            <div className="hiw__steps" ref={stepsRef}>
              {/* scroll-driven progress fill over the vertical line */}
              <motion.div
                className="hiw__progressFill"
                style={{ scaleY: lineScaleY }}
              />
              {STEPS.map((step, i) => (
                <StepRow key={step.number} step={step} index={i} active={active} />
              ))}
              {/* down arrow at the end */}
              <div className="hiw__arrow" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="4" x2="12" y2="19" />
                  <polyline points="6 13 12 19 18 13" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM feature bar ── */}
        <div
          className="hiw__bar"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 0.8s 0.7s ease-out, transform 0.8s 0.7s cubic-bezier(0.23,1,0.32,1)",
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="hiw__feat">
              <div className="hiw__featIcon">{f.icon}</div>
              <div className="hiw__featText">
                <p className="hiw__featTitle">{f.title}</p>
                <p className="hiw__featDesc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Styles — scoped under .hiw. Matches the reference design.
   Responsive: stacks on mobile, two-column on desktop.
   ──────────────────────────────────────────────────────────── */
const css = `
.hiw{
  --navy:#0a1f44; --navy-deep:#081a3a; --ink:#0d2350; --accent:#2563EB;
  --accent-light:#5b8def; --muted:#5b6b85; --line:rgba(10,31,68,.1);
  --card:#ffffff;
  position:relative; width:100%; overflow:hidden; isolation:isolate;
  background:linear-gradient(160deg, #eef2f8 0%, #e7edf6 45%, #dde6f2 100%);
  font-family:var(--font-inter, ui-sans-serif, system-ui, sans-serif);
}
.hiw *{ box-sizing:border-box; }

/* dotted world map, top-right */
.hiw__map{ position:absolute; top:0; right:0; width:62%; height:58%; z-index:0; opacity:.5;
  pointer-events:none;
  background-image:radial-gradient(rgba(37,99,235,.22) 1.1px, transparent 1.3px);
  background-size:11px 11px;
  -webkit-mask-image:radial-gradient(120% 120% at 75% 12%, #000 30%, transparent 68%);
          mask-image:radial-gradient(120% 120% at 75% 12%, #000 30%, transparent 68%); }
/* faint skyline, bottom-left */
.hiw__city{ position:absolute; left:0; bottom:0; width:55%; height:46%; z-index:0; opacity:.5;
  pointer-events:none;
  background:
    linear-gradient(to top, rgba(150,170,200,.4), transparent 70%),
    repeating-linear-gradient(90deg, transparent 0 14px, rgba(120,145,185,.18) 14px 16px);
  -webkit-mask-image:linear-gradient(to top, #000 8%, transparent 60%);
          mask-image:linear-gradient(to top, #000 8%, transparent 60%); }
.hiw__wash{ position:absolute; inset:0; z-index:0; pointer-events:none;
  background:radial-gradient(80% 60% at 70% 40%, rgba(255,255,255,.45), transparent 70%); }

/* WebGL ripple grid — ambient background layer */
.hiw__ripple{ position:absolute; inset:0; z-index:0; pointer-events:none;
  -webkit-mask-image:radial-gradient(120% 100% at 60% 35%, #000 25%, transparent 80%);
          mask-image:radial-gradient(120% 100% at 60% 35%, #000 25%, transparent 80%); }

.hiw__inner{ position:relative; z-index:1; margin:0 auto; max-width:1320px;
  padding:clamp(40px,6vw,80px) clamp(18px,4vw,64px); }

.hiw__top{ display:grid; grid-template-columns:1fr; gap:clamp(36px,5vw,56px); align-items:start; }

/* ── LEFT ── */
.hiw__eyebrow{ display:flex; align-items:center; gap:12px; margin-bottom:18px; }
.hiw__eyebrowLine{ width:28px; height:2px; background:var(--accent); border-radius:2px; }
.hiw__eyebrow span:last-child{ font-size:.66rem; font-weight:700; letter-spacing:.22em;
  text-transform:uppercase; color:var(--accent); }
.hiw__heading{ margin:0; color:var(--ink); line-height:1.12; letter-spacing:-.015em;
  font-family:var(--font-playfair, Georgia, "Times New Roman", serif); font-weight:700;
  font-size:clamp(1.9rem,4.6vw,3.1rem); }
.hiw__rule{ width:54px; height:3px; border-radius:3px; margin:clamp(16px,2vw,22px) 0;
  background:var(--accent); }
.hiw__lede{ margin:0; max-width:380px; line-height:1.7; color:var(--muted);
  font-size:clamp(.86rem,1.4vw,1rem); }

.hiw__callout{ display:flex; gap:16px; align-items:flex-start; margin-top:clamp(26px,3.5vw,40px);
  max-width:430px; padding:clamp(20px,2.4vw,26px); border-radius:18px;
  background:linear-gradient(150deg, #102a55 0%, #0a1c3e 100%);
  box-shadow:0 24px 50px -24px rgba(8,26,58,.7), inset 0 1px 0 rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.06); }
.hiw__calloutIcon{ flex:0 0 auto; width:48px; height:48px; padding:11px; border-radius:50%;
  display:grid; place-items:center; color:var(--accent-light);
  background:rgba(91,141,239,.16); border:1px solid rgba(91,141,239,.3); }
.hiw__calloutTitle{ margin:0 0 7px; color:#fff; font-weight:700;
  font-size:clamp(.92rem,1.5vw,1.05rem); letter-spacing:-.01em; }
.hiw__calloutDesc{ margin:0; color:rgba(255,255,255,.62); line-height:1.6;
  font-size:clamp(.76rem,1.2vw,.86rem); }

/* ── RIGHT timeline ── */
.hiw__timeline{ position:relative; }
.hiw__steps{ position:relative; display:flex; flex-direction:column; gap:clamp(14px,1.8vw,22px); }

.hiw__row{ position:relative; display:flex; align-items:center; gap:0; }

.hiw__node{ position:relative; flex:0 0 auto; display:flex; align-items:center;
  align-self:stretch; }
.hiw__circle{ position:relative; z-index:2; display:grid; place-items:center;
  width:clamp(54px,6vw,76px); height:clamp(54px,6vw,76px); border-radius:50%;
  background:radial-gradient(circle at 35% 30%, #ffffff, #eef3fb);
  box-shadow:0 10px 24px -8px rgba(37,99,235,.3), inset 0 1px 0 #fff,
    0 0 0 6px rgba(255,255,255,.5);
  border:1px solid rgba(37,99,235,.14); }
.hiw__circle span{ font-family:var(--font-playfair, Georgia, serif); font-weight:700;
  color:var(--accent); font-size:clamp(1.05rem,1.8vw,1.5rem); letter-spacing:.02em; }
/* vertical line behind circles */
.hiw__steps::before{ content:""; position:absolute; top:0; bottom:0; z-index:0;
  left:clamp(27px,3vw,38px); width:2px;
  background:rgba(37,99,235,.12); }

/* scroll-driven progress fill */
.hiw__progressFill{ position:absolute; top:0; bottom:0; z-index:1;
  left:clamp(27px,3vw,38px); width:2px; transform-origin:top;
  background:linear-gradient(180deg, #2563EB 0%, rgba(37,99,235,.6) 60%, rgba(37,99,235,.3) 100%);
  border-radius:999px; will-change:transform; pointer-events:none; }

.hiw__connector{ position:relative; display:flex; align-items:center;
  width:clamp(20px,2.4vw,46px); }
.hiw__connector::before{ content:""; flex:1; height:2px;
  background:rgba(37,99,235,.4); }
.hiw__connDot{ flex:0 0 auto; width:9px; height:9px; border-radius:50%;
  background:#fff; border:2px solid var(--accent); }

.hiw__card{ position:relative; flex:1; min-width:0; display:flex; align-items:center;
  gap:clamp(14px,2vw,22px); overflow:hidden; border-radius:18px;
  padding:clamp(16px,2vw,22px) clamp(18px,2.4vw,28px);
  background:rgba(255,255,255,.72);
  backdrop-filter:blur(14px) saturate(150%); -webkit-backdrop-filter:blur(14px) saturate(150%);
  border:1px solid rgba(255,255,255,.9);
  box-shadow:0 14px 36px -18px rgba(10,31,68,.28), inset 0 1px 0 rgba(255,255,255,.9);
  transition:transform .4s cubic-bezier(.23,1,.32,1), box-shadow .4s ease; }
.hiw__card:hover{ transform:translateY(-3px);
  box-shadow:0 24px 48px -20px rgba(10,31,68,.36), inset 0 1px 0 rgba(255,255,255,.9); }

.hiw__iconTile{ flex:0 0 auto; display:grid; place-items:center;
  width:clamp(48px,5.5vw,66px); height:clamp(48px,5.5vw,66px);
  padding:clamp(12px,1.4vw,17px); border-radius:16px; color:var(--accent);
  background:linear-gradient(155deg, rgba(91,141,239,.22), rgba(37,99,235,.1));
  border:1px solid rgba(255,255,255,.8);
  box-shadow:0 8px 18px -8px rgba(37,99,235,.4), inset 0 1px 0 rgba(255,255,255,.9); }

.hiw__cardBody{ flex:1; min-width:0; position:relative; z-index:1; }
.hiw__cardTitle{ margin:0 0 5px; color:var(--ink); line-height:1.2; letter-spacing:-.01em;
  font-family:var(--font-playfair, Georgia, serif); font-weight:700;
  font-size:clamp(1.02rem,1.7vw,1.3rem); }
.hiw__cardDesc{ margin:0; color:var(--muted); line-height:1.55; max-width:330px;
  font-size:clamp(.76rem,1.2vw,.9rem); }

.hiw__watermark{ position:absolute; right:clamp(-6px,1vw,18px); top:50%;
  transform:translateY(-50%); width:clamp(64px,7vw,92px); height:clamp(64px,7vw,92px);
  color:rgba(10,31,68,.07); pointer-events:none; }

.hiw__arrow{ display:grid; place-items:center; width:clamp(54px,6vw,76px);
  color:var(--accent); margin-top:2px; }
.hiw__arrow svg{ width:22px; height:22px; }

/* ── BOTTOM bar ── */
.hiw__bar{ position:relative; z-index:1; margin-top:clamp(28px,4vw,48px);
  display:grid; grid-template-columns:1fr; gap:0; border-radius:20px; overflow:hidden;
  padding:clamp(8px,1vw,14px) 0;
  background:linear-gradient(150deg, #102a55 0%, #0a1c3e 100%);
  box-shadow:0 30px 60px -30px rgba(8,26,58,.7), inset 0 1px 0 rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.05); }
.hiw__feat{ display:flex; align-items:center; gap:14px;
  padding:clamp(16px,2vw,22px) clamp(18px,2.6vw,30px); }
.hiw__featIcon{ flex:0 0 auto; display:grid; place-items:center; width:46px; height:46px;
  padding:11px; border-radius:50%; color:#fff;
  background:rgba(91,141,239,.16); border:1px solid rgba(91,141,239,.28); }
.hiw__featTitle{ margin:0 0 3px; color:#fff; font-weight:700;
  font-size:clamp(.82rem,1.3vw,.95rem); }
.hiw__featDesc{ margin:0; color:rgba(255,255,255,.55); line-height:1.45;
  font-size:clamp(.7rem,1.1vw,.8rem); }

/* ── Responsive ── */
@media (min-width:1024px){
  .hiw__top{ grid-template-columns:0.82fr 1.18fr; gap:clamp(40px,4vw,72px); }
  .hiw__left{ position:sticky; top:90px; }
  .hiw__bar{ grid-template-columns:repeat(4, 1fr); }
  .hiw__feat{ position:relative; }
  .hiw__feat:not(:first-child)::before{ content:""; position:absolute; left:0; top:22%;
    bottom:22%; width:1px; background:rgba(255,255,255,.12); }
}
@media (min-width:640px) and (max-width:1023px){
  .hiw__bar{ grid-template-columns:repeat(2, 1fr); }
  .hiw__feat:nth-child(n+3){ border-top:1px solid rgba(255,255,255,.1); }
}
@media (max-width:639px){
  .hiw__feat:not(:first-child){ border-top:1px solid rgba(255,255,255,.1); }
  .hiw__card{ flex-wrap:wrap; }
  .hiw__watermark{ display:none; }
}

@media (prefers-reduced-motion: reduce){
  .hiw__row, .hiw__left, .hiw__bar{ transition:none !important; }
  .hiw__card{ transition:none !important; }
}
`;