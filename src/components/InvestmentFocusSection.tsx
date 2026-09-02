"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import Image from "next/image";
import bgVisual from "@/assets/investment_focus_background_visuals.png";

/* ─── Types ──────────────────────────────────────────────────── */
interface FocusArea {
  icon: ReactNode;
  title: string;
  desc: string;
}
interface Pillar {
  icon: ReactNode;
  title: string;
  desc: string;
}

/* ─── Data ───────────────────────────────────────────────────── */
const FOCUS_AREAS: FocusArea[] = [
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15" />
      </svg>
    ),
    title: "Stablecoins",
    desc: "Capital allocation into stable digital assets designed to support liquidity, efficiency, and lower volatility exposure.",
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="M12 7v4M12 11l-5 6M12 11l5 6" />
      </svg>
    ),
    title: "Blockchain Infrastructure",
    desc: "Investment exposure to blockchain networks, protocols, and infrastructure powering the future of digital finance.",
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: "Global Stock Market",
    desc: "Strategic participation in international equity markets across established companies and growth sectors.",
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="8" rx="8" ry="3" />
        <path d="M4 8v4c0 1.66 3.58 3 8 3s8-1.34 8-3V8" />
        <path d="M4 12v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" />
      </svg>
    ),
    title: "Cryptocurrency Markets",
    desc: "Diversified exposure to selected digital assets with long-term growth potential and strong market relevance.",
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L10.5 19.25m1.267-.161c4.923.868 6.139-6.025 1.215-6.894M10.5 19.25l-1.51-8.28m0 0c-4.924-.869-6.14 6.024-1.215 6.893m1.215-6.893L10.5 4.75m-1.51 6.22L7.477 4.82m3.023-.07c-4.924-.869-6.14 6.024-1.215 6.893" />
      </svg>
    ),
    title: "Bitcoin",
    desc: "Focused exposure to Bitcoin as a leading digital asset and store-of-value opportunity within the crypto market.",
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Forex",
    desc: "Participation in global currency markets through disciplined strategies focused on liquidity and market movement.",
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="20" />
        <line x1="15" y1="20" x2="15" y2="20" />
        <line x1="20" y1="9" x2="20" y2="9" />
        <line x1="20" y1="14" x2="20" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    ),
    title: "AI Infrastructure",
    desc: "Strategic investments in the hardware, software, and platforms powering the next generation of artificial intelligence.",
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    title: "Crypto Mining",
    desc: "Exposure to industrial-scale digital asset mining operations, capturing value through network consensus and infrastructure.",
  },
];

const FEATURE_PILLARS: Pillar[] = [
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Risk Managed",
    desc: "Disciplined strategies for capital protection.",
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
    title: "Diversified Portfolio",
    desc: "Balanced exposure across multiple asset classes.",
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    ),
    title: "Global Perspective",
    desc: "Access to worldwide markets and opportunities.",
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Secure & Compliant",
    desc: "Enterprise-grade security and regulatory compliance.",
  },
];

/* ─── Glass focus card with tilt + sheen ─────────────────────── */
function FocusCard({
  item, index, active,
}: {
  item: FocusArea; index: number; active: boolean;
}) {
  const [hov, setHov] = useState<boolean>(false);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [spot, setSpot] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);
  const delay = 0.1 + index * 0.08;

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ x: (y - 0.5) * -9, y: (x - 0.5) * 9 });
    setSpot({ x: x * 100, y: y * 100 });
  }, []);

  const handleLeave = useCallback((): void => {
    setTilt({ x: 0, y: 0 });
    setHov(false);
  }, []);

  const transform = !active
    ? "translateY(28px) scale(0.97)"
    : hov
      ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px) scale(1.02)`
      : "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";

  const transition = !active
    ? `opacity 0.65s ${delay}s ease-out, transform 0.75s ${delay}s cubic-bezier(0.23,1,0.32,1)`
    : hov
      ? "transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease"
      : "transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, border-color 0.4s ease";

  return (
    <div className="fc__persp">
      <div
        ref={cardRef}
        className="fc__card"
        style={{
          opacity: active ? 1 : 0,
          transform,
          transition,
          borderColor: hov ? "rgba(96,165,250,0.55)" : "rgba(255,255,255,0.14)",
          boxShadow: hov
            ? "0 28px 60px rgba(6,18,42,0.45), 0 6px 16px rgba(6,18,42,0.3), inset 0 1px 0 rgba(255,255,255,0.18)"
            : "0 8px 28px rgba(6,18,42,0.28), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
        onMouseMove={handleMove}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={handleLeave}
      >
        {/* mouse sheen */}
        <div
          className="fc__sheen"
          style={{
            background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(96,165,250,0.22) 0%, transparent 60%)`,
            opacity: hov ? 1 : 0,
          }}
        />
        {/* top glass highlight */}
        <div className="fc__highlight" />

        {/* Icon glass tile */}
        <div
          className="fc__icon"
          style={{
            background: hov ? "rgba(96,165,250,0.18)" : "rgba(255,255,255,0.08)",
            borderColor: hov ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.18)",
            color: hov ? "#93C5FD" : "#60A5FA",
            transform: hov ? "translateZ(30px) translateY(-2px) scale(1.06)" : "translateZ(0) scale(1)",
            boxShadow: hov
              ? "0 12px 26px -8px rgba(37,99,235,0.6), inset 0 1px 0 rgba(255,255,255,0.25)"
              : "0 2px 10px rgba(6,18,42,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <span className="fc__iconGlyph">{item.icon}</span>
        </div>

        <h3 className="fc__title" style={{ transform: hov ? "translateZ(18px)" : "none" }}>
          {item.title}
        </h3>
        <p className="fc__desc">{item.desc}</p>

        <div className="fc__bar" style={{ width: hov ? "42px" : "28px" }} />
      </div>
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────── */
export default function InvestmentFocusSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.07 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="ifs">
      <style>{css}</style>

      {/* ── FULL-BLEED BACKGROUND IMAGE (entire section) ── */}
      <div className="ifs__bg" aria-hidden>
        <Image
          src={bgVisual}
          alt="Singapore skyline with Merlion"
          fill
          className="ifs__bgImg"
          sizes="100vw"
          priority
        />
        {/* light scrim keeps navy text legible everywhere */}
        <div className="ifs__scrim" />
      </div>

      <div className="ifs__layout">
        {/* ── LEFT PANEL — text over image ── */}
        <div className="ifs__left">
          <div
            className="ifs__leftContent"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <div className="ifs__eyebrow">
              <span className="ifs__eyebrowLine" />
              <span className="ifs__eyebrowTxt">Our Investment Focus</span>
            </div>

            <h2 className="ifs__heading">
              Investment<br />Focus Areas
            </h2>

            <div className="ifs__divider" />

            <p className="ifs__sub">
              Diversified exposure.<br />Global opportunities.
            </p>

            <p className="ifs__body">
              Merlion Asset Holdings allocates capital across selected asset classes to
              capture long-term growth and deliver consistent value.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL — glass cards ── */}
        <div className="ifs__right">
          <div className="ifs__grid">
            {FOCUS_AREAS.map((item, i) => (
              <FocusCard key={item.title} item={item} index={i} active={active} />
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM FEATURE BAR ── */}
      <div
        className="ifs__bar2"
        style={{
          opacity: active ? 1 : 0,
          transform: active ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <div className="ifs__pillars">
          {FEATURE_PILLARS.map((pillar) => (
            <div key={pillar.title} className="ifs__pillar">
              <div className="ifs__pillarIcon">{pillar.icon}</div>
              <div className="ifs__pillarText">
                <div className="ifs__pillarTitle">{pillar.title}</div>
                <div className="ifs__pillarDesc">{pillar.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Styles — scoped under .ifs. Glassmorphism cards/icons,
   3D tilt + sheen, staggered reveals. Reduced-motion safe.
   ──────────────────────────────────────────────────────────── */
const css = `
.ifs{
  --navy:#081B3A; --accent:#2563EB; --accent-light:#60A5FA;
  --bg:var(--bg, #F8FAFC); --text-muted:var(--text-muted, #64748B);
  position:relative; width:100%; overflow:hidden; isolation:isolate;
  background:var(--bg);
  font-family:var(--font-inter, ui-sans-serif, system-ui, sans-serif);
}
.ifs *{ box-sizing:border-box; }

.ifs__layout{ position:relative; z-index:1; display:flex; flex-direction:column; min-height:560px; }

/* ── Full-bleed background image (entire section) ── */
.ifs__bg{ position:absolute; inset:0; z-index:0; overflow:hidden; }
.ifs__bgImg{ object-fit:cover; object-position:center;
  transform:scale(1.05); animation:ifsKenBurns 24s ease-in-out infinite alternate; }
.ifs__scrim{ position:absolute; inset:0;
  background:
    linear-gradient(135deg, rgba(248,250,252,.82) 0%, rgba(248,250,252,.62) 28%, rgba(248,250,252,.5) 50%),
    radial-gradient(120% 90% at 15% 25%, rgba(248,250,252,.55), transparent 10%); }

/* ── Left panel ── */
.ifs__left{ position:relative; display:flex; align-items:center; flex-shrink:0;
  min-height:clamp(340px,46vw,560px); }

.ifs__leftContent{ position:relative; z-index:10;
  padding:48px clamp(24px,5vw,56px);
  transition:opacity .8s .05s ease-out, transform .8s .05s cubic-bezier(.23,1,.32,1); }
.ifs__eyebrow{ display:flex; align-items:center; gap:12px; margin-bottom:20px; }
.ifs__eyebrowLine{ height:1px; width:32px; flex-shrink:0; background:var(--accent);
  position:relative; overflow:hidden; }
.ifs__eyebrowLine::after{ content:""; position:absolute; inset:0;
  background:linear-gradient(90deg, transparent, #fff, transparent);
  animation:ifsSweep 2.6s ease-in-out infinite; }
.ifs__eyebrowTxt{ font-weight:600; text-transform:uppercase; letter-spacing:.2em;
  font-size:clamp(.48rem,1vw,.6rem); color:var(--accent); }
.ifs__heading{ margin:0 0 20px; color:var(--navy); line-height:1.08; letter-spacing:-.02em;
  font-family:var(--font-playfair, Georgia, serif); font-weight:700;
  font-size:clamp(2rem,4.5vw,3.6rem); }
.ifs__divider{ height:3px; width:36px; border-radius:999px; margin-bottom:20px;
  background:linear-gradient(90deg, var(--accent), var(--accent-light)); }
.ifs__sub{ margin:0 0 16px; font-weight:600; line-height:1.3; color:var(--accent);
  font-size:clamp(.88rem,1.6vw,1.1rem); }
.ifs__body{ margin:0; max-width:340px; line-height:1.65; color:var(--text-muted);
  font-size:clamp(.72rem,1.2vw,.875rem); }

/* ── Right panel ── */
.ifs__right{ flex:1; display:flex; align-items:center;
  padding:clamp(24px,4vw,56px) clamp(16px,4vw,56px) clamp(32px,5vw,64px); }
.ifs__grid{ width:100%; display:grid; grid-template-columns:repeat(2, 1fr);
  gap:12px; }

/* ── Dark glass card ── */
.ifs__grid .fc__persp{ perspective:1000px; }
.fc__card{ position:relative; display:flex; flex-direction:column; align-items:center;
  text-align:center; padding:clamp(18px,2.6vw,26px); border-radius:18px; cursor:default;
  user-select:none; overflow:hidden; transform-style:preserve-3d; will-change:transform, opacity;
  background:linear-gradient(155deg, rgba(12,28,62,.62), rgba(8,21,46,.5));
  backdrop-filter:blur(18px) saturate(150%);
  -webkit-backdrop-filter:blur(18px) saturate(150%);
  border:1px solid rgba(255,255,255,.14); }
.fc__sheen{ position:absolute; inset:0; border-radius:18px; pointer-events:none;
  transition:opacity .3s ease; }
.fc__highlight{ position:absolute; top:0; left:0; right:0; height:45%; pointer-events:none;
  background:linear-gradient(180deg, rgba(255,255,255,.14), transparent);
  border-radius:18px 18px 0 0; }

.fc__icon{ position:relative; display:grid; place-items:center; border-radius:50%;
  margin-bottom:16px; flex-shrink:0; border:1.5px solid;
  width:clamp(52px,7vw,68px); height:clamp(52px,7vw,68px);
  backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  transition:all .35s cubic-bezier(.23,1,.32,1); }
.fc__iconGlyph{ display:block; width:clamp(24px,3.2vw,30px); height:clamp(24px,3.2vw,30px); }
.fc__title{ position:relative; margin:0 0 10px; color:#fff; line-height:1.3;
  letter-spacing:-.01em; font-family:var(--font-playfair, Georgia, serif); font-weight:700;
  font-size:clamp(.85rem,1.6vw,1.05rem); transition:transform .35s ease; }
.fc__desc{ position:relative; margin:0; flex:1; line-height:1.6; color:rgba(255,255,255,.62);
  font-size:clamp(.62rem,1.1vw,.78rem); }
.fc__bar{ position:relative; margin-top:16px; height:2.5px; border-radius:999px;
  background:linear-gradient(90deg, var(--accent-light), #fff);
  transition:width .5s cubic-bezier(.23,1,.32,1); }

/* ── Bottom feature bar ── */
.ifs__bar2{ position:relative; z-index:1;
  background:linear-gradient(180deg, rgba(8,21,46,.72), rgba(6,16,38,.82));
  backdrop-filter:blur(16px) saturate(140%);
  -webkit-backdrop-filter:blur(16px) saturate(140%);
  border-top:1px solid rgba(255,255,255,.1);
  transition:opacity .8s .55s ease-out, transform .8s .55s cubic-bezier(.23,1,.32,1); }
.ifs__pillars{ margin:0 auto; max-width:1400px; display:grid; grid-template-columns:repeat(2,1fr); }
.ifs__pillar{ position:relative; display:flex; align-items:flex-start; gap:14px;
  padding:clamp(18px,3vw,28px) clamp(16px,3.5vw,36px);
  border-top:2px solid rgba(255,255,255,.1); }
.ifs__pillarIcon{ flex-shrink:0; display:grid; place-items:center; border-radius:50%;
  margin-top:2px; padding:9px; color:rgba(255,255,255,.85);
  width:clamp(34px,4vw,42px); height:clamp(34px,4vw,42px);
  background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
  transition:all .35s ease; }
.ifs__pillar:hover .ifs__pillarIcon{ background:rgba(37,99,235,.3);
  border-color:rgba(96,165,250,.5); color:#fff; transform:translateY(-3px) scale(1.05);
  box-shadow:0 10px 22px -8px rgba(37,99,235,.7); }
.ifs__pillarTitle{ font-weight:600; color:#fff; line-height:1.3; margin-bottom:3px;
  font-size:clamp(.72rem,1.3vw,.875rem); }
.ifs__pillarDesc{ line-height:1.35; color:rgba(255,255,255,.55);
  font-size:clamp(.6rem,1vw,.72rem); }

/* ── Animations ── */
@keyframes ifsSweep{ 0%{ transform:translateX(-100%); } 60%,100%{ transform:translateX(200%); } }
@keyframes ifsKenBurns{ from{ transform:scale(1.05); } to{ transform:scale(1.14); } }

/* ── Responsive ── */
@media (min-width:640px){
  .ifs__grid{ grid-template-columns:repeat(3, 1fr); gap:16px; }
}
@media (min-width:1024px){
  .ifs__layout{ flex-direction:row; }
  .ifs__left{ width:38%; }
  .ifs__grid{ gap:20px; }
  .ifs__pillars{ grid-template-columns:repeat(4,1fr); }
  .ifs__pillar{ border-top:none; border-left:1px solid rgba(255,255,255,.1); }
  .ifs__pillar:first-child{ border-left:none; }
}
@media (min-width:1280px){
  .ifs__left{ width:36%; }
}

@media (prefers-reduced-motion: reduce){
  .ifs *{ animation:none !important; }
  .ifs__bgImg{ animation:none !important; }
}
`;