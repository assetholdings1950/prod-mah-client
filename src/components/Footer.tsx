"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import footerBg from "@/assets/footer_bg_visulas.png";
import mahLogo from "@/assets/MAH_main-logo.jpeg";

/* ─── Types ───────────────────────────────────────────────── */
interface Social {
  label: string;
  href: string;
  icon: ReactNode;
}

/* ─── Data ────────────────────────────────────────────────── */
const navLinks = [
  { label: "Funds", href: "/funds" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Risk Disclosure", href: "/risk-disclosure" },
  { label: "Compliance", href: "/compliance" },
];

const globalLocations = [
  { label: "Singapore HQ", code: "sg", isNew: false },
  { label: "UAE", code: "ae", isNew: false },
  { label: "Canada", code: "ca", isNew: false },
  { label: "Russia", code: "ru", isNew: false },
  { label: "UK", code: "gb", isNew: false },
  { label: "India", code: "in", isNew: true },
] as const;

const socials: Social[] = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="f-ico">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="f-ico">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="f-ico">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:support@merlionassetholdings.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="f-ico">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

/* ─── Animation ───────────────────────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
} as const;

/* ─── Component ───────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer className="f-root">
      <style>{css}</style>

      {/* ── Background image + overlays ───────────────── */}
      <div className="f-bg" aria-hidden>
        <Image
          src={footerBg}
          alt=""
          fill
          className="f-bgImg"
          priority
          quality={90}
          sizes="100vw"
        />
        {/* gradient overlay: darken edges, preserve skyline glow */}
        <div className="f-bgOvr" />
      </div>

      {/* decorative top hairline */}
      <div className="f-edge" aria-hidden />

      <div className="f-inner">

        {/* ── CTA band ──────────────────────────────── */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="f-cta"
        >
          <div className="f-ctaText">
            <p className="f-ctaEye">Start today</p>
            <h2 className="f-ctaTitle">
              Put your capital to work with{" "}
              <em className="f-ctaEm">disciplined strategy</em>.
            </h2>
          </div>
          <Link href="/contact" className="f-ctaBtn">
            Open an account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* ── Main grid ──────────────────────────────── */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.65, delay: 0.06, ease: "easeOut" }}
          className="f-grid"
        >
          {/* ── Brand column ── */}
          <div className="f-brand">
            <Link href="/" className="f-logoWrap">
              <Image
                src={mahLogo}
                alt="Merlion Asset Holdings"
                width={280}
                height={78}
                className="f-logo"
                priority
              />
            </Link>

            <p className="f-blurb">
              Professional digital asset investment opportunities designed for
              long-term growth and capital preservation.
            </p>

            <div className="f-locationGroup" aria-label="Merlion global locations">
              {globalLocations.map((location) => (
                <div className="f-badge" key={location.code}>
                  <span
                    className={`f-badgeFlag fi fi-${location.code}`}
                    aria-hidden
                  />
                  <span>{location.label}</span>
                  {location.isNew && <span className="f-new">New</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Navigation column ── */}
          <div className="f-col f-colNav">
            <h3 className="f-colHead">Navigation</h3>
            <ul className="f-list">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="f-link">
                    <span className="f-dash" aria-hidden />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal column ── */}
          <div className="f-col f-colLegal">
            <h3 className="f-colHead">Legal</h3>
            <ul className="f-list">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="f-link">
                    <span className="f-dash" aria-hidden />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact column ── */}
          <div className="f-col f-colContact">
            <h3 className="f-colHead">Contact</h3>
            <div className="f-contact">
              <p>Singapore, SG</p>
              <a href="mailto:support@merlionassetholdings.com" className="f-mail">
                support@merlionassetholdings.com
              </a>
              <div className="f-status">
                <span className="f-pulse" aria-hidden>
                  <span className="f-pulseRing" />
                  <span className="f-pulseDot" />
                </span>
                <span>24/7 Investor Support</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Oversized watermark ────────────────────── */}
        <div className="f-mark" aria-hidden>MERLION</div>

        {/* ── Bottom bar ─────────────────────────────── */}
        <div className="f-bottom">
          <p>© {new Date().getFullYear()} Merlion Asset Holdings Pvt Ltd. All rights reserved.</p>
          <p className="f-disc">
            Investments involve risk. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────────────────────
   CSS — scoped under .f-root
   Breakpoints: base=mobile-first  sm≥480  md≥768  lg≥1024  xl≥1280
   ──────────────────────────────────────────────────────────── */
const css = `
/* ── Reset & root ── */
.f-root{
  --accent:#2563EB; --accent-l:#60A5FA; --accent-xl:#93C5FD;
  position:relative; width:100%; overflow:hidden; isolation:isolate;
  color:#fff; font-family:var(--font-inter,ui-sans-serif,system-ui,sans-serif);
}
.f-root *{ box-sizing:border-box; }

/* ── Background ── */
.f-bg{ position:absolute; inset:0; z-index:0; }
.f-bgImg{ object-fit:cover; object-position:center 30%; }
.f-bgOvr{
  position:absolute; inset:0;
  background:
    linear-gradient(to bottom,
      rgba(4,12,34,.78) 0%,
      rgba(5,16,42,.84) 35%,
      rgba(4,11,30,.92) 70%,
      rgba(3,8,22,.97) 100%),
    radial-gradient(ellipse 80% 60% at 50% 100%, rgba(5,20,55,.6) 0%, transparent 70%);
}

/* decorative top edge */
.f-edge{
  position:absolute; top:0; left:0; right:0; height:1px; z-index:2;
  background:linear-gradient(90deg, transparent 0%, rgba(96,165,250,.55) 30%,
    rgba(37,99,235,.4) 60%, transparent 100%);
}

/* ── Inner container ── */
.f-inner{
  position:relative; z-index:1; margin:0 auto; max-width:1240px;
  /* mobile padding */
  padding:40px 20px 0;
}

/* ── CTA band ── */
.f-cta{
  display:flex; flex-direction:column; gap:22px;
  padding-bottom:36px; margin-bottom:36px;
  border-bottom:1px solid rgba(255,255,255,.1);
}
.f-ctaText{ display:flex; flex-direction:column; gap:0; }
.f-ctaEye{
  margin:0 0 10px; font-size:.6rem; font-weight:700;
  letter-spacing:.26em; text-transform:uppercase; color:var(--accent-l);
}
.f-ctaTitle{
  margin:0; color:#fff; font-weight:700; letter-spacing:-.02em;
  line-height:1.18; font-size:clamp(1.3rem,4.5vw,2.25rem);
  font-family:var(--font-playfair,Georgia,serif);
}
.f-ctaEm{
  font-style:italic; font-weight:inherit;
  background:linear-gradient(100deg, var(--accent-l), var(--accent-xl));
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
}
.f-ctaBtn{
  align-self:flex-start; display:inline-flex; align-items:center; gap:9px;
  padding:12px 22px; border-radius:999px; text-decoration:none;
  font-size:.82rem; font-weight:600; letter-spacing:.01em; color:#fff;
  background:linear-gradient(100deg, var(--accent), #1d4ed8);
  box-shadow:0 12px 28px -10px rgba(37,99,235,.75), inset 0 1px 0 rgba(255,255,255,.2);
  transition:transform .28s ease, box-shadow .28s ease;
  white-space:nowrap;
}
.f-ctaBtn:hover{
  transform:translateY(-2px);
  box-shadow:0 18px 36px -10px rgba(37,99,235,.9), inset 0 1px 0 rgba(255,255,255,.25);
}
.f-ctaBtn svg{ transition:transform .28s ease; flex-shrink:0; }
.f-ctaBtn:hover svg{ transform:translateX(3px); }

/* ── Main grid — mobile: single column ── */
.f-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  grid-template-areas:
    "brand  brand"
    "nav    legal"
    "contact contact";
  gap:32px 24px;
}

/* ── Brand column ── */
.f-brand{ grid-area:brand; display:flex; flex-direction:column; gap:18px; }
.f-logoWrap{
  display:inline-block; width:fit-content;
  background:rgba(255,255,255,.96); border-radius:10px;
  padding:10px 16px;
  box-shadow:0 4px 20px rgba(0,0,0,.35);
}
.f-logo{ width:150px; height:auto; object-fit:contain; display:block; }

.f-blurb{
  margin:0; max-width:320px; line-height:1.7; font-size:.82rem;
  color:rgba(255,255,255,.55);
}

/* social icons */
.f-socials{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.f-social{
  display:grid; place-items:center; width:38px; height:38px; border-radius:11px;
  color:rgba(255,255,255,.6); background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  transition:all .28s cubic-bezier(.4,0,.2,1); flex-shrink:0;
}
.f-social:hover{
  color:#fff; transform:translateY(-3px);
  background:rgba(37,99,235,.2); border-color:rgba(96,165,250,.5);
  box-shadow:0 8px 20px -8px rgba(37,99,235,.7);
}
.f-ico{ width:17px; height:17px; }

/* Global location badges */
.f-locationGroup{
  display:flex; flex-wrap:wrap; align-items:center; gap:8px; max-width:410px;
}
.f-badge{
  display:inline-flex; align-items:center; gap:8px; width:fit-content;
  padding:7px 13px; border-radius:999px; font-size:.72rem; font-weight:500;
  color:rgba(255,255,255,.65); background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.12);
}
.f-badgeFlag{
  width:17px; height:12px; flex-shrink:0; border-radius:2px;
  box-shadow:0 0 0 1px rgba(255,255,255,.14); background-size:cover;
}
.f-new{
  margin-left:1px; padding:2px 5px; border-radius:999px;
  color:#93C5FD; background:rgba(37,99,235,.2); font-size:.52rem;
  font-weight:700; letter-spacing:.08em; text-transform:uppercase;
}

/* ── Link columns ── */
.f-colNav{ grid-area:nav; }
.f-colLegal{ grid-area:legal; }
.f-colContact{ grid-area:contact; }

.f-colHead{
  margin:0 0 16px; font-size:.58rem; font-weight:700;
  letter-spacing:.26em; text-transform:uppercase; color:var(--accent-l);
}
.f-list{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:11px; }
.f-link{
  display:inline-flex; align-items:center; gap:0;
  text-decoration:none; font-size:.85rem; color:rgba(255,255,255,.6);
  transition:color .22s ease, gap .22s ease;
}
.f-link:hover{ color:#fff; gap:8px; }
.f-dash{
  display:block; height:1px; width:0; background:var(--accent-l);
  transition:width .28s cubic-bezier(.4,0,.2,1); flex-shrink:0;
}
.f-link:hover .f-dash{ width:12px; }

/* ── Contact block ── */
.f-contact{
  display:flex; flex-direction:column; gap:11px;
  font-size:.85rem; color:rgba(255,255,255,.6);
}
.f-contact p{ margin:0; }
.f-mail{
  color:rgba(255,255,255,.6); text-decoration:none;
  transition:color .22s ease;
}
.f-mail:hover{ color:var(--accent-l); }
.f-status{ display:inline-flex; align-items:center; gap:8px; font-size:.76rem; color:rgba(255,255,255,.5); }
.f-pulse{ position:relative; display:inline-flex; width:9px; height:9px; flex-shrink:0; }
.f-pulseRing{
  position:absolute; inset:0; border-radius:50%; background:#34D399;
  opacity:.75; animation:fPing 1.8s cubic-bezier(0,0,.2,1) infinite;
}
.f-pulseDot{ position:relative; width:9px; height:9px; border-radius:50%; background:#10B981; }

/* ── Watermark ── */
.f-mark{
  margin-top:36px; text-align:center; line-height:.8;
  letter-spacing:.04em; user-select:none; pointer-events:none;
  font-family:var(--font-playfair,Georgia,serif); font-weight:700; white-space:nowrap;
  font-size:clamp(2.8rem,11vw,10rem);
  background:linear-gradient(180deg, rgba(255,255,255,.09) 0%, rgba(255,255,255,.01) 100%);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
}

/* ── Bottom bar ── */
.f-bottom{
  display:flex; flex-direction:column; gap:6px; align-items:flex-start;
  padding:22px 0 24px;
  border-top:1px solid rgba(255,255,255,.09);
  font-size:.68rem; color:rgba(255,255,255,.38); line-height:1.6;
}
.f-bottom p{ margin:0; }
.f-disc{ max-width:420px; }

/* ── Keyframes ── */
@keyframes fPing{ 75%,100%{ transform:scale(2.2); opacity:0; } }

/* ────────────────────────────────────────────────────────────
   sm ≥ 480px — small phones in landscape / large phones
   ──────────────────────────────────────────────────────────── */
@media (min-width:480px){
  .f-inner{ padding:44px 24px 0; }
  .f-logo{ width:170px; }
}

/* ────────────────────────────────────────────────────────────
   md ≥ 768px — tablet portrait & landscape
   ──────────────────────────────────────────────────────────── */
@media (min-width:768px){
  .f-inner{ padding:60px 40px 0; }

  /* CTA: row layout */
  .f-cta{
    flex-direction:row; align-items:center;
    justify-content:space-between; gap:36px;
    padding-bottom:48px; margin-bottom:48px;
  }
  .f-ctaText{ max-width:520px; }
  .f-ctaBtn{ font-size:.88rem; padding:13px 26px; }

  /* grid: brand full top, 3 cols below */
  .f-grid{
    grid-template-columns:2fr 1fr 1fr;
    grid-template-areas:
      "brand  brand   brand"
      "nav    legal   contact";
    gap:40px 36px;
  }

  .f-logo{ width:190px; }
  .f-blurb{ font-size:.85rem; }
  .f-social{ width:40px; height:40px; border-radius:12px; }

  /* watermark visible on tablet */
  .f-mark{ margin-top:48px; }

  .f-bottom{
    flex-direction:row; align-items:center;
    justify-content:space-between; padding:26px 0 28px;
  }
  .f-disc{ text-align:right; max-width:380px; }
}

/* ────────────────────────────────────────────────────────────
   lg ≥ 1024px — desktop
   ──────────────────────────────────────────────────────────── */
@media (min-width:1024px){
  .f-inner{ padding:72px 60px 0; }

  .f-cta{ padding-bottom:56px; margin-bottom:56px; }

  /* grid: brand(2fr) + 3 equal cols */
  .f-grid{
    grid-template-columns:2fr 1fr 1fr 1fr;
    grid-template-areas:"brand nav legal contact";
    gap:0 48px;
  }

  .f-logo{ width:210px; }
  .f-blurb{ max-width:280px; }
  .f-social{ width:42px; height:42px; }

  .f-mark{ margin-top:60px; }
  .f-bottom{ padding:28px 0 32px; font-size:.71rem; }
}

/* ────────────────────────────────────────────────────────────
   xl ≥ 1280px — wide desktop
   ──────────────────────────────────────────────────────────── */
@media (min-width:1280px){
  .f-inner{ padding:80px 80px 0; }

  .f-grid{ gap:0 60px; }
  .f-logo{ width:230px; }
  .f-blurb{ font-size:.88rem; max-width:300px; }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion:reduce){
  .f-root *{ animation:none !important; transition:none !important; }
}
`;
