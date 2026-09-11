// "use client";

// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import { motion, useScroll, useTransform } from "framer-motion";
// import heroBg from "@/assets/hero_bg_visuals.png";

// /* ── Floating accent dots (lg+ only) ──────────────────────────── */
// const DOTS = [
//   { x: "62%", y: "18%", size: 5, color: "rgba(201,162,83,0.55)", delay: "0s", dur: "5s" },
//   { x: "78%", y: "32%", size: 3, color: "rgba(37,99,235,0.5)", delay: "1.2s", dur: "6s" },
//   { x: "88%", y: "52%", size: 4, color: "rgba(201,162,83,0.4)", delay: "2.5s", dur: "4.5s" },
//   { x: "70%", y: "68%", size: 3, color: "rgba(37,99,235,0.45)", delay: "0.7s", dur: "7s" },
//   { x: "55%", y: "42%", size: 2.5, color: "rgba(201,162,83,0.35)", delay: "3.1s", dur: "5.5s" },
//   { x: "92%", y: "38%", size: 3, color: "rgba(37,99,235,0.35)", delay: "1.8s", dur: "6.5s" },
// ];

// export default function HeroSection() {
//   const [mounted, setMounted] = useState(false);
//   const sectionRef = useRef<HTMLElement>(null);
//   const [mouse, setMouse] = useState({ x: 0.75, y: 0.5 });

//   useEffect(() => setMounted(true), []);

//   const { scrollYProgress } = useScroll({
//     target: sectionRef,
//     offset: ["start start", "end start"],
//   });
//   const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
//   const textY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

//   return (
//     <section
//       ref={sectionRef}
//       className="relative w-full overflow-hidden bg-[#F8FAFC]"
//       style={{ minHeight: "100svh" }}
//       onMouseMove={(e) => {
//         const rect = e.currentTarget.getBoundingClientRect();
//         setMouse({
//           x: (e.clientX - rect.left) / rect.width,
//           y: (e.clientY - rect.top) / rect.height,
//         });
//       }}
//     >

//       {/* ══════════════════════════════════════════════
//           LAYER 3 — Background image  z-0
//       ══════════════════════════════════════════════ */}
//       <motion.div
//         className="absolute inset-0 z-0"
//         style={{ y: bgY }}
//       >
//         <div
//           className="absolute inset-0"
//           style={
//             mounted
//               ? { animation: "scale-up 2.4s cubic-bezier(0.16,1,0.3,1) both" }
//               : { opacity: 0 }
//           }
//         >
//           <Image
//             src={heroBg}
//             alt="Merlion Asset Holdings hero"
//             fill
//             priority
//             sizes="100vw"
//             className="object-cover object-center"
//           />
//         </div>
//       </motion.div>

//       {/* Mouse-tracking glow on the image side */}
//       <div
//         className="absolute inset-0 z-[1] pointer-events-none hidden md:block"
//         style={{
//           background: `radial-gradient(circle 480px at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(201,162,83,0.12) 0%, transparent 70%)`,
//           transition: "background 0.12s ease-out",
//         }}
//       />

//       {/* ══════════════════════════════════════════════
//           LAYER 2 — Grid · overlays · decorations  z-[2..5]
//       ══════════════════════════════════════════════ */}

//       {/* Subtle grid on top of image */}
//       <div
//         className="absolute inset-0 z-[2] pointer-events-none"
//         style={{
//           backgroundImage:
//             "linear-gradient(rgba(8,27,58,0.07) 1px, transparent 1px)," +
//             "linear-gradient(90deg, rgba(8,27,58,0.07) 1px, transparent 1px)",
//           backgroundSize: "72px 72px",
//         }}
//       />

//       {/* Mobile — gradient veil: image visible at top, readable at text area */}
//       <div
//         className="absolute inset-0 z-[3] pointer-events-none md:hidden"
//         style={{
//           background:
//             "linear-gradient(170deg," +
//             "rgba(248,250,252,0.18) 0%," +
//             "rgba(248,250,252,0.42) 28%," +
//             "rgba(248,250,252,0.68) 55%," +
//             "rgba(248,250,252,0.80) 100%)",
//         }}
//       />

//       {/* md+ — directional left-fade exposing image on right */}
//       <div
//         className="absolute inset-0 z-[3] pointer-events-none hidden md:block"
//         style={{
//           background:
//             "linear-gradient(108deg," +
//             "rgba(248,250,252,0.97) 0%," +
//             "rgba(248,250,252,0.93) 24%," +
//             "rgba(248,250,252,0.70) 42%," +
//             "rgba(248,250,252,0.18) 60%," +
//             "transparent 74%)",
//         }}
//       />

//       {/* Top vignette */}
//       <div className="absolute top-0 left-0 right-0 h-[22%] z-[3] pointer-events-none bg-[linear-gradient(180deg,rgba(248,250,252,0.65)_0%,transparent_100%)]" />

//       {/* Bottom vignette */}
//       <div className="absolute bottom-0 left-0 right-0 h-[18%] z-[3] pointer-events-none bg-[linear-gradient(0deg,rgba(248,250,252,0.65)_0%,transparent_100%)]" />

//       {/* Rotating ring — md+ */}
//       <svg
//         className="absolute pointer-events-none z-[4] hidden md:block"
//         style={{
//           right: "3%",
//           top: "50%",
//           transform: "translateY(-50%)",
//           opacity: 0.13,
//           animation: "spin-slow 60s linear infinite",
//           width: "clamp(240px,30vw,340px)",
//           height: "clamp(240px,30vw,340px)",
//         }}
//         viewBox="0 0 460 460"
//       >
//         <circle cx="230" cy="230" r="218" fill="none" stroke="#2563EB" strokeWidth="0.6" strokeDasharray="3 14" />
//         <circle cx="230" cy="230" r="184" fill="none" stroke="#C9A253" strokeWidth="1" strokeDasharray="2 8" />
//         <circle cx="230" cy="230" r="150" fill="none" stroke="#2563EB" strokeWidth="0.5" strokeDasharray="5 20" />
//         <circle cx="230" cy="230" r="112" fill="none" stroke="#C9A253" strokeWidth="0.6" strokeDasharray="2 10" />
//       </svg>

//       {/* Floating accent dots — lg+ */}
//       <div className="hidden lg:block">
//         {DOTS.map((d, i) => (
//           <div
//             key={i}
//             className="absolute rounded-full pointer-events-none z-[4]"
//             style={{
//               left: d.x, top: d.y,
//               width: d.size, height: d.size,
//               background: d.color,
//               animation: `float-gentle ${d.dur} ease-in-out infinite`,
//               animationDelay: d.delay,
//             }}
//           />
//         ))}
//       </div>

//       {/* Vertical ambient label — xl+ */}
//       <div
//         className="absolute right-[2.5%] top-[38%] z-[5] pointer-events-none hidden xl:block"
//         style={{
//           fontFamily: "var(--font-inter, sans-serif)",
//           fontSize: "8px",
//           letterSpacing: "0.3em",
//           textTransform: "uppercase",
//           color: "rgba(8,27,58,0.22)",
//           writingMode: "vertical-lr",
//           transform: "rotate(180deg)",
//           animation: "fade-in 1.2s 2s both",
//         }}
//       >
//         Merlion Asset Holdings · Singapore
//       </div>

//       {/* ══════════════════════════════════════════════
//           LAYER 1 — Text content  z-10
//       ══════════════════════════════════════════════ */}
//       <motion.div
//         style={{ y: textY }}
//         className="
//           absolute z-10 inset-0
//           md:right-auto md:w-[72%] lg:w-[58%]
//           flex flex-col justify-center
//           px-5 sm:px-8 md:pl-[clamp(32px,5.5vw,96px)] md:pr-6
//           pt-24 sm:pt-28 md:pt-0
//           pb-12 md:pb-0
//         "
//       >

//         {/* Eyebrow */}
//         <div
//           className="flex flex-wrap items-center gap-2 mb-5 sm:mb-7"
//           style={{ animation: "fade-up 0.8s 0.25s both" }}
//         >
//           <span
//             className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border font-semibold uppercase"
//             style={{
//               borderColor: "rgba(37,99,235,0.25)",
//               background: "rgba(37,99,235,0.07)",
//               fontFamily: "var(--font-inter, sans-serif)",
//               fontSize: "clamp(0.48rem, 1.4vw, 0.6rem)",
//               letterSpacing: "0.2em",
//               color: "var(--accent)",
//             }}
//           >
//             <span
//               className="w-1.5 h-1.5 rounded-full shrink-0"
//               style={{
//                 background: "var(--accent)",
//                 animation: "pulse-glow 2.2s ease-in-out infinite",
//               }}
//             />
//             Singapore · Est. 2024
//           </span>

//           <div className="hidden sm:flex items-center gap-2">
//             <div className="h-px w-6 sm:w-8" style={{ background: "rgba(201,162,83,0.5)" }} />
//             <span
//               style={{
//                 fontFamily: "var(--font-inter, sans-serif)",
//                 fontSize: "clamp(0.48rem, 1.2vw, 0.55rem)",
//                 letterSpacing: "0.15em",
//                 textTransform: "uppercase",
//                 color: "var(--text-muted)",
//               }}
//             >
//               Premier Investment
//             </span>
//           </div>
//         </div>

//         {/* Headline */}
//         <h1
//           className="m-0 leading-[1.06] tracking-[-0.025em]"
//           style={{
//             fontSize: "var(--text-hero)",
//             maxWidth: "min(580px, 100%)",
//             animation: "fade-up 1s 0.4s both",
//           }}
//         >
//           <span className="block text-navy">Build Wealth.</span>
//           <span
//             className="block"
//             style={{
//               background: "linear-gradient(120deg, #081B3A 0%, #2563EB 45%, #C9A253 72%, #081B3A 100%)",
//               backgroundSize: "300% 100%",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//               backgroundClip: "text",
//               animation: "shimmer-gold 6s linear infinite",
//             }}
//           >
//             Own The Future.
//           </span>
//         </h1>

//         {/* Gold separator */}
//         <div
//           className="flex items-center gap-2.5 sm:gap-3 my-4 sm:my-6"
//           style={{ animation: "fade-up 0.8s 0.58s both" }}
//         >
//           <div className="h-[1.5px]" style={{ width: "clamp(28px,4vw,48px)", background: "#C9A253" }} />
//           <div className="w-2 h-2 rounded-full border" style={{ borderColor: "#C9A253", background: "rgba(201,162,83,0.2)" }} />
//           <div className="h-px" style={{ width: "clamp(16px,2.5vw,24px)", background: "rgba(201,162,83,0.35)" }} />
//         </div>

//         {/* Body */}
//         <p
//           className="m-0 mb-7 sm:mb-9 leading-[1.75]"
//           style={{
//             fontFamily: "var(--font-inter, sans-serif)",
//             fontSize: "var(--text-base)",
//             color: "var(--text-muted)",
//             maxWidth: "min(430px, 100%)",
//             animation: "fade-up 0.8s 0.72s both",
//           }}
//         >
//           A premier investment institution offering global perspective,
//           disciplined strategy, and trusted returns — built for the future.
//         </p>

//         {/* CTAs */}
//         <div
//           className="flex flex-row flex-wrap gap-3"
//           style={{ animation: "fade-up 0.8s 0.88s both" }}
//         >
//           <CTAButton primary href="#funds" label="Explore Funds" />
//           <CTAButton primary={false} href="#about" label="Learn More" />
//         </div>

//         {/* Trust strip — sm+ */}
//         <div
//           className="hidden sm:flex items-center gap-2.5 mt-7 sm:mt-9"
//           style={{ animation: "fade-up 0.8s 1.05s both" }}
//         >
//           <div className="flex items-center gap-0.5">
//             {[...Array(5)].map((_, i) => (
//               <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#C9A253">
//                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//               </svg>
//             ))}
//           </div>
//           <div className="w-px h-3.5" style={{ background: "rgba(8,27,58,0.15)" }} />
//           <span
//             style={{
//               fontFamily: "var(--font-inter, sans-serif)",
//               fontSize: "var(--text-xs)",
//               color: "var(--text-muted)",
//               letterSpacing: "0.05em",
//             }}
//           >
//             Trusted by{" "}
//             <strong className="font-semibold" style={{ color: "var(--navy)" }}>10,000+</strong>{" "}
//             investors globally
//           </span>
//         </div>
//       </motion.div>

//       {/* Scroll indicator — md+ */}
//       <div
//         className="absolute z-10 hidden md:flex flex-col items-center gap-2"
//         style={{
//           bottom: "clamp(32px, 5vh, 52px)",
//           left: "clamp(32px, 5.5vw, 96px)",
//           animation: "fade-in 1s 2.2s both",
//         }}
//       >
//         <span
//           style={{
//             fontFamily: "var(--font-inter, sans-serif)",
//             fontSize: "var(--text-xxs)",
//             letterSpacing: "0.3em",
//             textTransform: "uppercase",
//             color: "rgba(100,116,139,0.5)",
//           }}
//         >
//           Scroll
//         </span>
//         <div className="w-px h-9 bg-gradient-to-b from-[var(--accent)]/50 to-transparent" />
//         <div
//           className="w-7 h-7 rounded-full flex items-center justify-center"
//           style={{
//             border: "1px solid rgba(37,99,235,0.22)",
//             background: "rgba(37,99,235,0.06)",
//           }}
//         >
//           <svg
//             width="11" height="11" viewBox="0 0 24 24" fill="none"
//             stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//             style={{ animation: "scroll-arrow 2s ease-in-out infinite" }}
//           >
//             <path d="M12 5v14M5 12l7 7 7-7" />
//           </svg>
//         </div>
//       </div>
//     </section>
//   );
// }

// /* ── CTA Button ─────────────────────────────────────────────── */
// function CTAButton({
//   primary,
//   href,
//   label,
// }: {
//   primary: boolean;
//   href: string;
//   label: string;
// }) {
//   const [hov, setHov] = useState(false);

//   return (
//     <a
//       href={href}
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       className="inline-flex items-center justify-center gap-2 rounded-full font-medium no-underline cursor-pointer transition-all duration-300"
//       style={{
//         fontFamily: "var(--font-inter, sans-serif)",
//         fontSize: "var(--text-sm)",
//         letterSpacing: "0.03em",
//         padding: "clamp(10px,1.5vh,13px) clamp(20px,3.5vw,28px)",
//         ...(primary
//           ? {
//             background: hov ? "var(--navy-2)" : "var(--navy)",
//             color: "#fff",
//             boxShadow: hov
//               ? "0 14px 36px rgba(8,27,58,0.3)"
//               : "0 4px 18px rgba(8,27,58,0.18)",
//             transform: hov ? "translateY(-2px)" : "none",
//           }
//           : {
//             background: hov ? "rgba(8,27,58,0.05)" : "transparent",
//             color: "var(--navy)",
//             border: "1.5px solid rgba(8,27,58,0.2)",
//             transform: hov ? "translateY(-2px)" : "none",
//           }),
//       }}
//     >
//       {label}
//       {primary && (
//         <svg
//           width="12" height="12" viewBox="0 0 24 24" fill="none"
//           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//         >
//           <path d="M5 12h14M12 5l7 7-7 7" />
//         </svg>
//       )}
//     </a>
//   );
// }



// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";

// /* ────────────────────────────────────────────────────────────
//    HeroSection — "Compounding"
//    Calm, institutional, white. One disciplined animated
//    centerpiece: a growth arc that draws itself and breathes,
//    with a value counting up along it. Everything else is quiet
//    whitespace + editorial type. No photo, no gold.
//    ──────────────────────────────────────────────────────────── */

// export default function HeroSection() {
//   const [mounted, setMounted] = useState(false);
//   const pathRef = useRef<SVGPathElement>(null);
//   const areaRef = useRef<SVGPathElement>(null);
//   const dotRef = useRef<SVGCircleElement>(null);
//   const [val, setVal] = useState(0);

//   useEffect(() => setMounted(true), []);

//   /* draw the arc once mounted, then animate the value counting up */
//   const animate = useCallback(() => {
//     const path = pathRef.current;
//     const dot = dotRef.current;
//     if (!path) return;

//     const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
//     const len = path.getTotalLength();

//     if (reduce) {
//       path.style.strokeDasharray = "none";
//       path.style.strokeDashoffset = "0";
//       if (dot) {
//         const p = path.getPointAtLength(len);
//         dot.setAttribute("cx", String(p.x));
//         dot.setAttribute("cy", String(p.y));
//       }
//       setVal(38.4);
//       return;
//     }

//     path.style.strokeDasharray = `${len}`;
//     path.style.strokeDashoffset = `${len}`;

//     const DURATION = 2200;
//     const start = performance.now();
//     let raf = 0;

//     const tick = (now: number) => {
//       const t = Math.min((now - start) / DURATION, 1);
//       const eased = 1 - Math.pow(1 - t, 3);
//       path.style.strokeDashoffset = `${len * (1 - eased)}`;
//       const p = path.getPointAtLength(len * eased);
//       if (dot) {
//         dot.setAttribute("cx", String(p.x));
//         dot.setAttribute("cy", String(p.y));
//       }
//       setVal(parseFloat((eased * 38.4).toFixed(1)));
//       if (t < 1) raf = requestAnimationFrame(tick);
//     };
//     raf = requestAnimationFrame(tick);
//     return () => cancelAnimationFrame(raf);
//   }, []);

//   useEffect(() => {
//     if (!mounted) return;
//     const cleanup = animate();
//     return cleanup;
//   }, [mounted, animate]);

//   return (
//     <section className="hero" aria-label="Merlion Asset Holdings">
//       <style>{css}</style>

//       {/* faint structural guides */}
//       <div className="hero__hair hero__hair--v" aria-hidden />
//       <div className="hero__glow" aria-hidden />

//       <div className="hero__inner">
//         {/* ── Left: editorial text ── */}
//         <div className="hero__text">
//           <div className="hero__eyebrow" style={{ animation: "hUp .8s .15s both" }}>
//             <span className="hero__eyebrowLine" />
//             Singapore · Est. 2024
//           </div>

//           <h1 className="hero__title">
//             <span className="hero__l1" style={{ animation: "hUp 1s .3s both" }}>
//               Wealth that
//             </span>
//             <span className="hero__l2" style={{ animation: "hUp 1s .42s both" }}>
//               compounds with
//             </span>
//             <span className="hero__l3" style={{ animation: "hUp 1s .54s both" }}>
//               <span className="hero__ital">discipline.</span>
//             </span>
//           </h1>

//           <p className="hero__body" style={{ animation: "hUp .8s .72s both" }}>
//             A premier investment institution offering global perspective, disciplined
//             strategy, and trusted returns — engineered for the long term.
//           </p>

//           <div className="hero__ctas" style={{ animation: "hUp .8s .86s both" }}>
//             <a href="#funds" className="hero__btn hero__btn--primary">
//               Explore Funds
//               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
//             </a>
//             <a href="#about" className="hero__btn hero__btn--ghost">Learn More</a>
//           </div>

//           {/* quiet credibility row */}
//           <div className="hero__meta" style={{ animation: "hUp .8s 1s both" }}>
//             <div className="hero__metaItem">
//               <span className="hero__metaNum">S$125M+</span>
//               <span className="hero__metaLabel">Assets managed</span>
//             </div>
//             <span className="hero__metaSep" />
//             <div className="hero__metaItem">
//               <span className="hero__metaNum">10,000+</span>
//               <span className="hero__metaLabel">Global investors</span>
//             </div>
//             <span className="hero__metaSep" />
//             <div className="hero__metaItem">
//               <span className="hero__metaNum">MAS</span>
//               <span className="hero__metaLabel">Regulated</span>
//             </div>
//           </div>
//         </div>

//         {/* ── Right: the animated centerpiece ── */}
//         <div className="hero__plate" style={{ animation: "hFade 1.2s .4s both" }}>
//           {/* small readout that counts up with the curve */}
//           <div className="hero__readout">
//             <span className="hero__readoutLabel">10-yr model growth</span>
//             <span className="hero__readoutVal">
//               +{val.toFixed(1)}<span className="hero__readoutPct">%</span>
//               <span className="hero__readoutAnnum"> p.a. avg</span>
//             </span>
//           </div>

//           <svg className="hero__chart" viewBox="0 0 520 360" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden>
//             <defs>
//               <linearGradient id="hArea" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
//                 <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
//               </linearGradient>
//               <linearGradient id="hLine" x1="0" y1="1" x2="1" y2="0">
//                 <stop offset="0%" stopColor="#93C5FD" />
//                 <stop offset="60%" stopColor="#2563EB" />
//                 <stop offset="100%" stopColor="#1d4ed8" />
//               </linearGradient>
//             </defs>

//             {/* baseline grid — very faint */}
//             {[300, 230, 160, 90].map((y) => (
//               <line key={y} x1="40" y1={y} x2="500" y2={y} stroke="#0B1F3A" strokeOpacity="0.05" strokeWidth="1" />
//             ))}
//             {/* y ticks */}
//             {[
//               { y: 300, t: "0" },
//               { y: 230, t: "" },
//               { y: 160, t: "" },
//               { y: 90, t: "" },
//             ].map((g, i) => (
//               <circle key={i} cx="40" cy={g.y} r="2" fill="#0B1F3A" fillOpacity="0.12" />
//             ))}

//             {/* filled area under the curve */}
//             <path
//               ref={areaRef}
//               d="M40 300 C 150 296, 210 268, 280 214 S 410 150, 500 70 L 500 320 L 40 320 Z"
//               fill="url(#hArea)"
//               style={{ animation: mounted ? "hAreaIn 1.6s .9s both" : "none" }}
//             />

//             {/* the growth arc (animated draw) */}
//             <path
//               ref={pathRef}
//               d="M40 300 C 150 296, 210 268, 280 214 S 410 150, 500 70"
//               stroke="url(#hLine)"
//               strokeWidth="3"
//               strokeLinecap="round"
//             />

//             {/* leading dot */}
//             <circle ref={dotRef} cx="40" cy="300" r="6" fill="#2563EB" stroke="#fff" strokeWidth="3" />
//           </svg>

//           {/* tiny corner labels for "calm data" feel */}
//           <div className="hero__plateFoot">
//             <span>2024</span>
//             <span className="hero__plateNote">Illustrative compounding model · not a forecast</span>
//             <span>2034</span>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// const css = `
// .hero{
//   --ink:#0B1F3A; --accent:#2563EB; --sky:#93C5FD; --muted:#64748B; --paper:#F8FAFC;
//   position:relative; width:100%; min-height:100svh; overflow:hidden; isolation:isolate;
//   background:
//     radial-gradient(120% 80% at 88% 12%, rgba(37,99,235,0.06), transparent 55%),
//     linear-gradient(180deg, #ffffff 0%, #fbfcfe 70%, #f4f7fc 100%);
//   font-family:var(--font-inter, ui-sans-serif, system-ui, sans-serif);
//   display:flex; align-items:center;
// }
// .hero *{ box-sizing:border-box; }

// .hero__hair--v{ position:absolute; top:0; bottom:0; left:50%; width:1px;
//   background:linear-gradient(180deg, transparent, rgba(11,31,58,0.06) 30%, rgba(11,31,58,0.06) 70%, transparent);
//   z-index:0; display:none; }
// .hero__glow{ position:absolute; right:-6%; top:-10%; width:46vw; height:46vw; max-width:640px; max-height:640px;
//   border-radius:50%; background:radial-gradient(circle, rgba(37,99,235,0.10), transparent 60%);
//   filter:blur(40px); z-index:0; pointer-events:none; }

// .hero__inner{ position:relative; z-index:1; width:100%; margin:0 auto; max-width:1280px;
//   display:grid; grid-template-columns:1fr; gap:clamp(32px,5vw,64px); align-items:center;
//   padding:clamp(96px,14vh,160px) clamp(20px,5vw,80px) clamp(56px,9vh,96px); }

// /* ── Text ── */
// .hero__eyebrow{ display:inline-flex; align-items:center; gap:12px; margin-bottom:clamp(20px,3vh,30px);
//   font-size:clamp(.56rem,1.1vw,.68rem); font-weight:600; letter-spacing:.22em;
//   text-transform:uppercase; color:var(--accent); }
// .hero__eyebrowLine{ width:34px; height:1.5px; background:var(--accent); border-radius:2px; }

// .hero__title{ margin:0; color:var(--ink); line-height:1.02; letter-spacing:-.03em;
//   font-family:var(--font-playfair, Georgia, "Times New Roman", serif); font-weight:700;
//   font-size:clamp(2.4rem,6.4vw,5rem); }
// .hero__title span{ display:block; }
// .hero__ital{ font-style:italic;
//   background:linear-gradient(100deg, var(--accent), #1d4ed8 60%, var(--sky));
//   -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }

// .hero__body{ margin:clamp(22px,3vh,32px) 0 0; max-width:430px; line-height:1.75;
//   font-size:clamp(.9rem,1.5vw,1.05rem); color:var(--muted); }

// .hero__ctas{ display:flex; flex-wrap:wrap; gap:13px; margin-top:clamp(26px,4vh,38px); }
// .hero__btn{ display:inline-flex; align-items:center; justify-content:center; gap:8px;
//   border-radius:999px; text-decoration:none; cursor:pointer; font-weight:600;
//   letter-spacing:.02em; font-size:clamp(.8rem,1.4vw,.92rem);
//   padding:clamp(12px,1.6vh,15px) clamp(24px,3.5vw,32px); transition:all .3s ease; }
// .hero__btn--primary{ color:#fff; background:var(--ink);
//   box-shadow:0 14px 34px -14px rgba(11,31,58,0.5); }
// .hero__btn--primary:hover{ transform:translateY(-2px); background:#13294c;
//   box-shadow:0 20px 44px -14px rgba(11,31,58,0.6); }
// .hero__btn--ghost{ color:var(--ink); border:1.5px solid rgba(11,31,58,0.18); background:transparent; }
// .hero__btn--ghost:hover{ background:rgba(11,31,58,0.04); transform:translateY(-2px); }

// .hero__meta{ display:flex; align-items:center; gap:clamp(16px,2.4vw,28px); flex-wrap:wrap;
//   margin-top:clamp(34px,5vh,52px); padding-top:clamp(22px,3vh,30px);
//   border-top:1px solid rgba(11,31,58,0.08); }
// .hero__metaItem{ display:flex; flex-direction:column; gap:3px; }
// .hero__metaNum{ font-family:var(--font-playfair, Georgia, serif); font-weight:700;
//   font-size:clamp(1rem,1.8vw,1.35rem); color:var(--ink); letter-spacing:-.01em; }
// .hero__metaLabel{ font-size:clamp(.58rem,1vw,.68rem); color:var(--muted);
//   letter-spacing:.06em; text-transform:uppercase; }
// .hero__metaSep{ width:1px; height:30px; background:rgba(11,31,58,0.1); }

// /* ── Centerpiece plate ── */
// .hero__plate{ position:relative; }
// .hero__readout{ display:flex; flex-direction:column; gap:4px; margin-bottom:6px;
//   padding-left:clamp(8px,2vw,24px); }
// .hero__readoutLabel{ font-size:clamp(.6rem,1.1vw,.7rem); letter-spacing:.14em;
//   text-transform:uppercase; color:var(--muted); }
// .hero__readoutVal{ font-family:var(--font-playfair, Georgia, serif); font-weight:700;
//   font-size:clamp(2.2rem,5vw,3.4rem); color:var(--ink); line-height:1;
//   font-variant-numeric:tabular-nums; }
// .hero__readoutPct{ color:var(--accent); }
// .hero__readoutAnnum{ font-family:var(--font-inter, sans-serif); font-weight:500;
//   font-size:clamp(.7rem,1.3vw,.9rem); color:var(--muted); letter-spacing:0; }
// .hero__chart{ width:100%; height:auto; display:block; overflow:visible; }
// .hero__plateFoot{ display:flex; align-items:center; justify-content:space-between;
//   padding:0 clamp(8px,2vw,16px); margin-top:6px;
//   font-size:clamp(.54rem,1vw,.64rem); color:var(--muted); letter-spacing:.04em; }
// .hero__plateNote{ color:rgba(11,31,58,0.32); font-style:italic; letter-spacing:0; }

// /* ── keyframes ── */
// @keyframes hUp{ from{ opacity:0; transform:translateY(22px); } to{ opacity:1; transform:none; } }
// @keyframes hFade{ from{ opacity:0; transform:translateY(16px) scale(.98); } to{ opacity:1; transform:none; } }
// @keyframes hAreaIn{ from{ opacity:0; } to{ opacity:1; } }

// /* ── responsive ── */
// @media (min-width:980px){
//   .hero__inner{ grid-template-columns:1.02fr 1.1fr; gap:clamp(40px,5vw,90px); }
//   .hero__hair--v{ display:block; }
// }
// @media (max-width:979px){
//   .hero__plate{ order:-1; margin-bottom:8px; max-width:560px; }
//   .hero__glow{ right:-20%; }
// }

// @media (prefers-reduced-motion: reduce){
//   .hero *{ animation:none !important; }
// }
// `;




// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";

// /* ────────────────────────────────────────────────────────────
//    HeroSection — centered, white, with an INFINITE animated
//    market-graph background. Continuously scrolling layered
//    line/area charts + drifting bars, drawn on <canvas>, looping
//    forever behind a soft white scrim. Centered editorial content
//    with eyebrow, headline, subhead, CTAs, trust row, stat strip.
//    No photo, no gold. Reduced-motion aware.
//    ──────────────────────────────────────────────────────────── */

// const STATS = [
//   { num: "S$125M+", label: "Assets under management" },
//   { num: "10,000+", label: "Global investors" },
//   { num: "99.8%", label: "Success rate" },
//   { num: "MAS", label: "Regulated in Singapore" },
// ];

// export default function HeroSection() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   /* ── Infinite scrolling market graph ── */
//   const draw = useCallback(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
//     const DPR = Math.min(window.devicePixelRatio || 1, 2);
//     let w = 0, h = 0;

//     const resize = () => {
//       const r = canvas.getBoundingClientRect();
//       w = r.width; h = r.height;
//       canvas.width = w * DPR;
//       canvas.height = h * DPR;
//       ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
//     };
//     resize();

//     // layered wave config — each scrolls left forever at its own speed
//     const layers = [
//       { base: 0.52, amp: 0.13, freq: 0.9, speed: 0.45, w: 2.4, color: "rgba(37,99,235,0.55)", fill: "rgba(37,99,235,0.07)" },
//       { base: 0.60, amp: 0.10, freq: 1.5, speed: 0.75, w: 1.6, color: "rgba(96,165,250,0.45)", fill: "rgba(96,165,250,0.05)" },
//       { base: 0.68, amp: 0.07, freq: 2.3, speed: 1.10, w: 1.2, color: "rgba(147,197,253,0.4)", fill: "rgba(147,197,253,0.04)" },
//     ];

//     let t = 0;
//     let raf = 0;

//     const wave = (L: typeof layers[number], phase: number) => {
//       ctx.beginPath();
//       for (let px = 0; px <= w; px += 6) {
//         const nx = px / w;
//         const y =
//           h * L.base +
//           Math.sin(nx * L.freq * Math.PI * 2 + phase) * h * L.amp * 0.55 +
//           Math.sin(nx * L.freq * 2.3 * Math.PI * 2 - phase * 1.3) * h * L.amp * 0.45;
//         if (px === 0) ctx.moveTo(px, y);
//         else ctx.lineTo(px, y);
//       }
//     };

//     const render = () => {
//       ctx.clearRect(0, 0, w, h);

//       // faint moving vertical grid (scrolls left)
//       ctx.strokeStyle = "rgba(11,31,58,0.04)";
//       ctx.lineWidth = 1;
//       const gap = 72;
//       const shift = (t * 0.4) % gap;
//       for (let x = -shift; x <= w; x += gap) {
//         ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
//       }

//       // drifting "volume" bars along the bottom (scroll left, wrap)
//       const barGap = 26;
//       const barShift = (t * 0.6) % barGap;
//       ctx.fillStyle = "rgba(37,99,235,0.05)";
//       for (let x = -barShift, i = 0; x <= w; x += barGap, i++) {
//         const bh = (Math.sin(i * 0.7 + t * 0.03) * 0.5 + 0.5) * h * 0.16 + 6;
//         ctx.fillRect(x, h - bh, barGap * 0.55, bh);
//       }

//       // layered scrolling waves
//       layers.forEach((L) => {
//         const phase = t * 0.02 * L.speed * Math.PI;
//         // area fill
//         wave(L, phase);
//         ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
//         ctx.fillStyle = L.fill;
//         ctx.fill();
//         // line
//         wave(L, phase);
//         ctx.strokeStyle = L.color;
//         ctx.lineWidth = L.w;
//         ctx.stroke();
//       });

//       t += 1;
//       if (!reduce) raf = requestAnimationFrame(render);
//     };

//     render();
//     const onResize = () => resize();
//     window.addEventListener("resize", onResize);
//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener("resize", onResize);
//     };
//   }, []);

//   useEffect(() => {
//     const cleanup = draw();
//     return cleanup;
//   }, [draw]);

//   return (
//     <section className="hero" aria-label="Merlion Asset Holdings">
//       <style>{css}</style>

//       {/* infinite animated graph background */}
//       <canvas ref={canvasRef} className="hero__canvas" aria-hidden />
//       {/* white scrim for readability */}
//       <div className="hero__scrim" aria-hidden />
//       <div className="hero__glow" aria-hidden />

//       {/* ── Centered content ── */}
//       <div className="hero__inner">
//         <div className="hero__eyebrow" style={{ animation: "hUp .8s .1s both" }}>
//           <span className="hero__pulse" />
//           Singapore · Est. 2024 · MAS-Regulated
//         </div>

//         <h1 className="hero__title">
//           <span style={{ animation: "hUp 1s .25s both" }}>Build wealth.</span>{" "}
//           <span className="hero__ital" style={{ animation: "hUp 1s .38s both" }}>
//             Compound the future.
//           </span>
//         </h1>

//         <p className="hero__body" style={{ animation: "hUp .8s .56s both" }}>
//           Merlion Asset Holdings is a premier investment institution pairing global
//           perspective with disciplined strategy. From digital assets to global markets,
//           we manage capital for the long term — transparently, and with trust at the core.
//         </p>

//         <div className="hero__ctas" style={{ animation: "hUp .8s .72s both" }}>
//           <a href="#funds" className="hero__btn hero__btn--primary">
//             Explore Funds
//             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
//           </a>
//           <a href="#about" className="hero__btn hero__btn--ghost">Learn More</a>
//         </div>

//         {/* trust row */}
//         <div className="hero__trust" style={{ animation: "hUp .8s .88s both" }}>
//           <div className="hero__stars">
//             {[...Array(5)].map((_, i) => (
//               <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#2563EB">
//                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//               </svg>
//             ))}
//           </div>
//           <span>Trusted by <strong>10,000+</strong> investors across 20+ markets</span>
//         </div>

//         {/* stat strip */}
//         <div className="hero__stats" style={{ animation: "hUp .8s 1.02s both" }}>
//           {STATS.map((s, i) => (
//             <div key={s.label} className="hero__stat">
//               <span className="hero__statNum">{s.num}</span>
//               <span className="hero__statLabel">{s.label}</span>
//               {i < STATS.length - 1 && <span className="hero__statSep" aria-hidden />}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* scroll cue */}
//       <div className="hero__scroll" style={{ animation: "hFade 1s 1.8s both" }} aria-hidden>
//         <span className="hero__scrollLine" />
//         <span>Scroll</span>
//       </div>
//     </section>
//   );
// }

// const css = `
// .hero{
//   --ink:#0B1F3A; --accent:#2563EB; --sky:#93C5FD; --muted:#64748B; --paper:#F8FAFC;
//   position:relative; width:100%; min-height:100svh; overflow:hidden; isolation:isolate;
//   background:linear-gradient(180deg,#ffffff 0%,#fbfcfe 60%,#f3f7fc 100%);
//   font-family:var(--font-inter, ui-sans-serif, system-ui, sans-serif);
//   display:flex; align-items:center; justify-content:center; text-align:center;
// }
// .hero *{ box-sizing:border-box; }

// .hero__canvas{ position:absolute; inset:0; width:100%; height:100%; z-index:0; }
// /* scrim keeps centre readable while edges show the moving graph */
// .hero__scrim{ position:absolute; inset:0; z-index:1; pointer-events:none;
//   background:
//     radial-gradient(70% 60% at 50% 46%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.75) 45%, rgba(255,255,255,0.35) 70%, transparent 100%),
//     linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 22%, transparent 78%, rgba(243,247,252,0.85) 100%); }
// .hero__glow{ position:absolute; left:50%; top:42%; transform:translate(-50%,-50%);
//   width:60vw; height:60vw; max-width:760px; max-height:760px; border-radius:50%;
//   background:radial-gradient(circle, rgba(37,99,235,0.08), transparent 60%);
//   filter:blur(50px); z-index:1; pointer-events:none; }

// .hero__inner{ position:relative; z-index:2; width:100%; max-width:880px;
//   margin:0 auto; display:flex; flex-direction:column; align-items:center;
//   padding:clamp(110px,16vh,170px) clamp(20px,5vw,40px) clamp(64px,10vh,110px); }

// .hero__eyebrow{ display:inline-flex; align-items:center; gap:9px; margin-bottom:clamp(20px,3vh,30px);
//   padding:7px 16px; border-radius:999px; border:1px solid rgba(37,99,235,0.22);
//   background:rgba(37,99,235,0.06); font-size:clamp(.54rem,1.1vw,.66rem);
//   font-weight:600; letter-spacing:.2em; text-transform:uppercase; color:var(--accent); }
// .hero__pulse{ width:6px; height:6px; border-radius:50%; background:var(--accent);
//   box-shadow:0 0 8px var(--accent); animation:hPulse 2.2s ease-in-out infinite; }

// .hero__title{ margin:0; color:var(--ink); line-height:1.05; letter-spacing:-.03em;
//   font-family:var(--font-playfair, Georgia, "Times New Roman", serif); font-weight:700;
//   font-size:clamp(2.5rem,7vw,5.4rem); max-width:14ch; }
// .hero__ital{ font-style:italic;
//   background:linear-gradient(100deg, var(--accent), #1d4ed8 55%, var(--sky));
//   -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }

// .hero__body{ margin:clamp(22px,3.5vh,32px) auto 0; max-width:620px; line-height:1.8;
//   font-size:clamp(.92rem,1.5vw,1.08rem); color:var(--muted); }

// .hero__ctas{ display:flex; flex-wrap:wrap; justify-content:center; gap:13px;
//   margin-top:clamp(28px,4vh,40px); }
// .hero__btn{ display:inline-flex; align-items:center; justify-content:center; gap:8px;
//   border-radius:999px; text-decoration:none; cursor:pointer; font-weight:600;
//   letter-spacing:.02em; font-size:clamp(.82rem,1.4vw,.94rem);
//   padding:clamp(13px,1.7vh,16px) clamp(26px,3.6vw,34px); transition:all .3s ease; }
// .hero__btn--primary{ color:#fff; background:var(--ink);
//   box-shadow:0 16px 38px -16px rgba(11,31,58,0.55); }
// .hero__btn--primary:hover{ transform:translateY(-2px); background:#13294c;
//   box-shadow:0 22px 48px -16px rgba(11,31,58,0.65); }
// .hero__btn--ghost{ color:var(--ink); border:1.5px solid rgba(11,31,58,0.18);
//   background:rgba(255,255,255,0.6); backdrop-filter:blur(4px); }
// .hero__btn--ghost:hover{ background:rgba(11,31,58,0.05); transform:translateY(-2px); }

// .hero__trust{ display:flex; align-items:center; justify-content:center; gap:11px;
//   margin-top:clamp(26px,4vh,36px); font-size:clamp(.68rem,1.2vw,.8rem); color:var(--muted); }
// .hero__stars{ display:flex; gap:2px; }
// .hero__trust strong{ color:var(--ink); font-weight:700; }

// .hero__stats{ display:flex; flex-wrap:wrap; align-items:center; justify-content:center;
//   gap:clamp(14px,2.4vw,30px); margin-top:clamp(38px,5.5vh,58px);
//   padding-top:clamp(24px,3.5vh,34px); border-top:1px solid rgba(11,31,58,0.08);
//   width:100%; max-width:760px; }
// .hero__stat{ position:relative; display:flex; flex-direction:column; gap:4px;
//   padding:0 clamp(6px,1.4vw,14px); }
// .hero__statNum{ font-family:var(--font-playfair, Georgia, serif); font-weight:700;
//   font-size:clamp(1.1rem,2.2vw,1.7rem); color:var(--ink); letter-spacing:-.01em;
//   font-variant-numeric:tabular-nums; }
// .hero__statLabel{ font-size:clamp(.56rem,1vw,.66rem); color:var(--muted);
//   letter-spacing:.05em; text-transform:uppercase; }
// .hero__statSep{ position:absolute; right:0; top:50%; transform:translateY(-50%);
//   width:1px; height:28px; background:rgba(11,31,58,0.1); }

// .hero__scroll{ position:absolute; z-index:2; bottom:clamp(22px,4vh,40px); left:50%;
//   transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:8px; }
// .hero__scrollLine{ width:1px; height:38px; background:linear-gradient(180deg,var(--accent),transparent);
//   animation:hScroll 2s ease-in-out infinite; transform-origin:top; }
// .hero__scroll span:last-child{ font-size:.5rem; letter-spacing:.3em; text-transform:uppercase;
//   color:rgba(100,116,139,0.55); }

// /* keyframes */
// @keyframes hUp{ from{ opacity:0; transform:translateY(22px); } to{ opacity:1; transform:none; } }
// @keyframes hFade{ from{ opacity:0; } to{ opacity:1; } }
// @keyframes hPulse{ 0%,100%{ opacity:.4; } 50%{ opacity:1; } }
// @keyframes hScroll{ 0%,100%{ transform:scaleY(.4); opacity:.5; } 50%{ transform:scaleY(1); opacity:1; } }

// @media (max-width:520px){
//   .hero__stat{ flex:0 0 40%; }
//   .hero__statSep{ display:none; }
//   .hero__scroll{ display:none; }
// }
// @media (prefers-reduced-motion: reduce){
//   .hero *{ animation:none !important; }
// }
// `;






"use client";

import { useEffect, useRef, useCallback } from "react";

/* ────────────────────────────────────────────────────────────
   HeroSection — centered content over an animated damped-
   oscillation chart (white background). Three curves with
   different damping (undamped / light / critical) draw and
   travel on a moving time axis, with legend, ticks, and a
   hatched ruler strip. Blue palette, no photo. Canvas-based,
   loops forever, reduced-motion aware.
   ──────────────────────────────────────────────────────────── */

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    // palette
    const INK = "#0B1F3A";
    const ACCENT = "#2563EB";
    const SKY = "#60A5FA";
    const SOFT = "rgba(37,99,235,0.5)";
    const GRID = "rgba(11,31,58,0.06)";
    const AXIS = "rgba(11,31,58,0.18)";
    const LABEL = "rgba(11,31,58,0.4)";

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    let t = 0;
    let raf = 0;
    let visible = false;

    // chart geometry helpers (computed each frame for responsiveness)
    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // plot area — leave margins for labels + bottom ruler
      const padL = Math.max(40, w * 0.05);
      const padR = Math.max(20, w * 0.04);
      const padT = h * 0.16;
      const rulerH = 26;
      const padB = 54 + rulerH;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const midY = padT + plotH / 2;

      const CYCLES = 4;             // 0..4 on the x axis
      const phase = t * 0.012;      // scroll/animate the waves

      const xAt = (cyc: number) => padL + (cyc / CYCLES) * plotW;
      const yAt = (v: number) => midY - v * (plotH / 2) * 0.92;

      /* ── grid ── */
      ctx.strokeStyle = GRID;
      ctx.lineWidth = 1;
      for (let c = 0; c <= CYCLES; c++) {
        const x = xAt(c);
        ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
      }
      [1, 0.5, 0, -0.5, -1].forEach((v) => {
        const y = yAt(v);
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
      });

      /* ── zero axis ── */
      ctx.strokeStyle = AXIS;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padL + plotW, midY); ctx.stroke();

      /* ── y labels ── */
      ctx.fillStyle = LABEL;
      ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      [1, 0.5, 0, -0.5, -1].forEach((v) => {
        ctx.fillText(v.toFixed(1), padL - 10, yAt(v));
      });
      /* ── x labels ── */
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let c = 0; c <= CYCLES; c++) {
        ctx.fillText(String(c), xAt(c), padT + plotH + 10);
      }

      /* ── curve plotter ──
         value(x) for a damped oscillation: e^(-z*ω*x) * cos(ω*x)
         z = damping ratio. Undamped z=0, light z=0.1, critical ~ decays w/o oscillation. */
      const omega = Math.PI * 2; // one full cycle per unit
      const STEP = 2;

      const plot = (
        zeta: number,
        color: string,
        lineWidth: number,
        dash: number[],
        critical = false
      ) => {
        ctx.beginPath();
        for (let px = 0; px <= plotW; px += STEP) {
          const cyc = (px / plotW) * CYCLES;
          const x = cyc; // in "cycles"
          let v: number;
          if (critical) {
            // critical/over-damped: smooth decay back to 0, no oscillation
            v = (1 + 1.6 * x) * Math.exp(-2.2 * x);
            v = v * 2 - 1 * Math.exp(-2.2 * x); // keep it starting ~1, easing toward 0
            v = (1 + 2.2 * x) * Math.exp(-2.2 * x); // clean critical form
          } else {
            const env = Math.exp(-zeta * omega * x);
            v = env * Math.cos(omega * x - phase);
          }
          const yy = yAt(v);
          if (px === 0) ctx.moveTo(padL + px, yy);
          else ctx.lineTo(padL + px, yy);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(dash);
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.setLineDash([]);
      };

      // UNDAMPED (z=0) — dotted, pale
      plot(0, SOFT, 1.6, [2, 6]);
      // CRITICAL (z=1) — dashed, mid
      plot(1, SKY, 1.6, [8, 6], true);
      // LIGHT (z=0.1) — solid, bold accent
      plot(0.1, ACCENT, 2.6, []);

      /* ── marker dot riding the LIGHT curve at x≈2 ── */
      const markCyc = 2;
      const env = Math.exp(-0.1 * omega * markCyc);
      const markV = env * Math.cos(omega * markCyc - phase);
      const mx = xAt(markCyc);
      // vertical guide
      ctx.strokeStyle = "rgba(37,99,235,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(mx, yAt(markV)); ctx.lineTo(mx, midY); ctx.stroke();
      // dot + halo
      ctx.beginPath();
      ctx.arc(mx, yAt(markV), 5, 0, Math.PI * 2);
      ctx.fillStyle = ACCENT;
      ctx.shadowColor = ACCENT; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(mx, midY, 3, 0, Math.PI * 2);
      ctx.fillStyle = SKY; ctx.fill();

      /* ── y-axis caption ── */
      ctx.fillStyle = LABEL;
      ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("›  X(T)", padL - 2, padT - 14);

      /* ── legend (top-right) ── */
      const legend = [
        { label: "UNDAMPED (Z=0)", color: SOFT, dash: [2, 5], lw: 1.6 },
        { label: "LIGHT (Z=0.1)", color: ACCENT, dash: [], lw: 2.4 },
        { label: "CRITICAL (Z=1)", color: SKY, dash: [7, 5], lw: 1.6 },
      ];
      ctx.font = "600 10px ui-sans-serif, system-ui, sans-serif";
      ctx.textBaseline = "middle";
      // measure from the right
      let lx = padL + plotW;
      const ly = padT - 14;
      ctx.textAlign = "left";
      // lay out right-to-left
      const items = legend.map((it) => ({ ...it, w: ctx.measureText(it.label).width + 34 }));
      let totalW = items.reduce((s, it) => s + it.w, 0);
      let startX = padL + plotW - totalW;
      if (startX < padL + 80) startX = padL + 80; // avoid overlap on small screens
      items.forEach((it) => {
        // sample line
        ctx.strokeStyle = it.color;
        ctx.lineWidth = it.lw;
        ctx.setLineDash(it.dash);
        ctx.beginPath(); ctx.moveTo(startX, ly); ctx.lineTo(startX + 22, ly); ctx.stroke();
        ctx.setLineDash([]);
        // label
        ctx.fillStyle = LABEL;
        ctx.fillText(it.label, startX + 28, ly);
        startX += it.w;
      });

      /* ── hatched ruler strip at bottom ── */
      const ry = h - rulerH - 6;
      // baseline bar
      ctx.fillStyle = SKY;
      ctx.fillRect(padL, ry, plotW, 3);
      // hatches
      ctx.strokeStyle = "rgba(37,99,235,0.35)";
      ctx.lineWidth = 1;
      const hatchGap = 9;
      const hatchShift = (t * 0.5) % hatchGap;
      for (let x = padL - hatchShift; x <= padL + plotW; x += hatchGap) {
        ctx.beginPath();
        ctx.moveTo(x, ry + 6);
        ctx.lineTo(x + 6, ry + rulerH);
        ctx.stroke();
      }

      t += 1;
      if (!reduce) raf = requestAnimationFrame(render);
    };

    const start = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(render);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { rootMargin: "120px" });
    const handleVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    if (reduce) render();
    else observer.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibility);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const cleanup = draw();
    return cleanup;
  }, [draw]);

  return (
    <section className="hero" aria-label="Merlion Asset Holdings">
      <style>{css}</style>

      {/* animated damped-oscillation chart background */}
      <canvas ref={canvasRef} className="hero__canvas" aria-hidden />
      <div className="hero__scrim" aria-hidden />

      {/* ── Centered content ── */}
      <div className="hero__inner">
        <div className="hero__eyebrow" style={{ animation: "hUp .8s .1s both" }}>
          <span className="hero__pulse" />
          <span>Singapore Headquarters · Global Presence · Now in India</span>
          <span aria-hidden className="hero__indiaFlag fi fi-in" />
        </div>

        <h1 className="hero__title">
          <span style={{ animation: "hUp 1s .25s both" }}>Build wealth.</span>{" "}
          <span className="hero__ital" style={{ animation: "hUp 1s .38s both" }}>
            Compound the future.
          </span>
        </h1>

        <p className="hero__body" style={{ animation: "hUp .8s .56s both" }}>
          Merlion Asset Holdings is a premier investment institution pairing global
          perspective with disciplined strategy. From digital assets to global markets,
          we manage capital for the long term — transparently, and with trust at the core.
        </p>

        <div className="hero__ctas" style={{ animation: "hUp .8s .72s both" }}>
          <a href="/funds" className="hero__btn hero__btn--primary">
            Explore Funds
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
          <a href="/consult-with-us" className="hero__btn hero__btn--ghost">Consult with Us</a>
        </div>

        <div className="hero__trust" style={{ animation: "hUp .8s .88s both" }}>
          <div className="hero__stars">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#2563EB">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span>Trusted by <strong>10,000+</strong> investors across 20+ markets</span>
        </div>
      </div>
    </section>
  );
}

const css = `
.hero{
  --ink:#0B1F3A; --accent:#2563EB; --sky:#60A5FA; --muted:#64748B;
  position:relative; width:100%; min-height:100svh; overflow:hidden; isolation:isolate;
  background:linear-gradient(180deg,#ffffff 0%,#fbfcfe 60%,#f3f7fc 100%);
  font-family:var(--font-inter, ui-sans-serif, system-ui, sans-serif);
  display:flex; align-items:center; justify-content:center; text-align:center;
}
.hero *{ box-sizing:border-box; }

.hero__canvas{ position:absolute; inset:0; width:100%; height:100%; z-index:0; }
/* keep centre readable; let the chart breathe at top + bottom */
.hero__scrim{ position:absolute; inset:0; z-index:1; pointer-events:none;
  background:radial-gradient(64% 52% at 50% 46%, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.78) 42%, rgba(255,255,255,0.30) 70%, transparent 100%); }

.hero__inner{ position:relative; z-index:2; width:100%; max-width:860px; margin:0 auto;
  display:flex; flex-direction:column; align-items:center;
  padding:clamp(110px,16vh,180px) clamp(20px,5vw,40px) clamp(96px,14vh,150px); }

.hero__eyebrow{ display:inline-flex; align-items:center; gap:9px; margin-bottom:clamp(20px,3vh,30px);
  padding:7px 16px; border-radius:999px; border:1px solid rgba(37,99,235,0.22);
  background:rgba(37,99,235,0.06); font-size:clamp(.54rem,1.1vw,.66rem);
  font-weight:600; letter-spacing:.2em; text-transform:uppercase; color:var(--accent); }
.hero__pulse{ width:6px; height:6px; border-radius:50%; background:var(--accent);
  box-shadow:0 0 8px var(--accent); animation:hPulse 2.2s ease-in-out infinite; }
.hero__indiaFlag{ width:17px; height:12px; flex-shrink:0; border-radius:2px;
  box-shadow:0 0 0 1px rgba(11,31,58,.12); background-size:cover; }

.hero__title{ margin:0; color:var(--ink); line-height:1.05; letter-spacing:-.03em;
  font-family:var(--font-playfair, Georgia, "Times New Roman", serif); font-weight:700;
  font-size:clamp(2.5rem,7vw,5.4rem); max-width:14ch; }
.hero__ital{ font-style:italic;
  background:linear-gradient(100deg, var(--accent), #1d4ed8 55%, var(--sky));
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }

.hero__body{ margin:clamp(22px,3.5vh,32px) auto 0; max-width:600px; line-height:1.8;
  font-size:clamp(.92rem,1.5vw,1.06rem); color:var(--muted); }

.hero__ctas{ display:flex; flex-wrap:wrap; justify-content:center; gap:13px;
  margin-top:clamp(28px,4vh,40px); }
.hero__btn{ display:inline-flex; align-items:center; justify-content:center; gap:8px;
  border-radius:999px; text-decoration:none; cursor:pointer; font-weight:600;
  letter-spacing:.02em; font-size:clamp(.82rem,1.4vw,.94rem);
  padding:clamp(13px,1.7vh,16px) clamp(26px,3.6vw,34px); transition:all .3s ease; }
.hero__btn--primary{ color:#fff; background:var(--ink);
  box-shadow:0 16px 38px -16px rgba(11,31,58,0.55); }
.hero__btn--primary:hover{ transform:translateY(-2px); background:#13294c;
  box-shadow:0 22px 48px -16px rgba(11,31,58,0.65); }
.hero__btn--ghost{ color:var(--ink); border:1.5px solid rgba(11,31,58,0.18);
  background:rgba(255,255,255,0.6); backdrop-filter:blur(4px); }
.hero__btn--ghost:hover{ background:rgba(11,31,58,0.05); transform:translateY(-2px); }

.hero__trust{ display:flex; align-items:center; justify-content:center; gap:11px;
  margin-top:clamp(26px,4vh,36px); font-size:clamp(.68rem,1.2vw,.8rem); color:var(--muted); }
.hero__stars{ display:flex; gap:2px; }
.hero__trust strong{ color:var(--ink); font-weight:700; }

@keyframes hUp{ from{ opacity:0; transform:translateY(22px); } to{ opacity:1; transform:none; } }
@keyframes hPulse{ 0%,100%{ opacity:.4; } 50%{ opacity:1; } }

@media (prefers-reduced-motion: reduce){
  .hero *{ animation:none !important; }
}
`;
