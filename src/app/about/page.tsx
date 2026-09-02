// // src/app/about/page.tsx  (or wherever your about route lives)
// // Images needed:
// //   /public/images/about/hero-bg.jpg      ← Singapore Merlion hero background
// //   /public/images/about/story-image.jpg  ← Singapore skyline/office story image

// "use client";

// import { useRef, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//     Globe, Shield, TrendingUp, BarChart2, Eye, RefreshCw,
//     Users, Headphones, ChevronRight, ArrowRight,
//     Bitcoin, DollarSign, Layers, Activity,
// } from "lucide-react";
// import {
//     motion,
//     useInView,
//     useScroll,
//     useTransform,
//     AnimatePresence,
// } from "framer-motion";
// import aboutBg from "@/assets/about/bg_visual.png"
// import story from "@/assets/about/story.png"
// /* ─────────── ANIMATION HELPERS ─────────── */

// const ease = [0.22, 1, 0.36, 1] as const;

// function FadeUp({
//     children,
//     delay = 0,
//     className = "",
// }: {
//     children: React.ReactNode;
//     delay?: number;
//     className?: string;
// }) {
//     const ref = useRef(null);
//     const inView = useInView(ref, { once: true, margin: "-80px" });
//     return (
//         <motion.div
//             ref={ref}
//             initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
//             animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
//             transition={{ duration: 0.7, delay, ease }}
//             className={className}
//         >
//             {children}
//         </motion.div>
//     );
// }

// function FadeIn({
//     children,
//     delay = 0,
//     className = "",
//     direction = "up",
// }: {
//     children: React.ReactNode;
//     delay?: number;
//     className?: string;
//     direction?: "up" | "left" | "right";
// }) {
//     const ref = useRef(null);
//     const inView = useInView(ref, { once: true, margin: "-60px" });
//     const initial =
//         direction === "left"
//             ? { opacity: 0, x: -40, filter: "blur(4px)" }
//             : direction === "right"
//                 ? { opacity: 0, x: 40, filter: "blur(4px)" }
//                 : { opacity: 0, y: 24, filter: "blur(4px)" };
//     const animate = { opacity: 1, x: 0, y: 0, filter: "blur(0px)" };
//     return (
//         <motion.div
//             ref={ref}
//             initial={initial}
//             animate={inView ? animate : {}}
//             transition={{ duration: 0.65, delay, ease }}
//             className={className}
//         >
//             {children}
//         </motion.div>
//     );
// }

// /** Word-by-word text reveal */
// function WordReveal({
//     text,
//     className = "",
//     delay = 0,
// }: {
//     text: string;
//     className?: string;
//     delay?: number;
// }) {
//     const ref = useRef(null);
//     const inView = useInView(ref, { once: true, margin: "-60px" });
//     const words = text.split(" ");
//     return (
//         <span ref={ref} className={className}>
//             {words.map((word, i) => (
//                 <motion.span
//                     key={i}
//                     className="inline-block mr-[0.22em]"
//                     initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
//                     animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
//                     transition={{ duration: 0.55, delay: delay + i * 0.06, ease }}
//                 >
//                     {word}
//                 </motion.span>
//             ))}
//         </span>
//     );
// }

// /** Animated counter */
// function CountUp({
//     end,
//     suffix = "",
//     duration = 1.8,
//     delay = 0,
// }: {
//     end: number;
//     suffix?: string;
//     duration?: number;
//     delay?: number;
// }) {
//     const ref = useRef<HTMLSpanElement>(null);
//     const inView = useInView(ref, { once: true });

//     useEffect(() => {
//         if (!inView || !ref.current) return;
//         const start = 0;
//         const startTime = performance.now() + delay * 1000;
//         const totalDuration = duration * 1000;

//         function update(now: number) {
//             if (now < startTime) { requestAnimationFrame(update); return; }
//             const elapsed = now - startTime;
//             const progress = Math.min(elapsed / totalDuration, 1);
//             const eased = 1 - Math.pow(1 - progress, 3);
//             if (ref.current) ref.current.textContent = Math.round(eased * end) + suffix;
//             if (progress < 1) requestAnimationFrame(update);
//         }
//         requestAnimationFrame(update);
//     }, [inView, end, suffix, duration, delay]);

//     return <span ref={ref}>0{suffix}</span>;
// }

// /* ─────────── DATA ─────────── */

// const philosophyPillars = [
//     {
//         icon: BarChart2,
//         title: "Strategic Diversification",
//         desc: "We allocate capital across multiple asset classes to reduce concentration risk and capture opportunities across market cycles.",
//     },
//     {
//         icon: TrendingUp,
//         title: "Long-Term Perspective",
//         desc: "We focus on sustainable growth rather than short-term market movements.",
//     },
//     {
//         icon: Shield,
//         title: "Disciplined Risk Management",
//         desc: "Capital preservation and prudent portfolio construction remain central to our investment process.",
//     },
//     {
//         icon: Eye,
//         title: "Transparency",
//         desc: "We believe investors deserve clear communication, straightforward reporting, and full visibility into their investment journey.",
//     },
// ];

// const markets = [
//     { icon: DollarSign, title: "Stablecoins", desc: "Secure, transparent and efficient digital value solutions." },
//     { icon: Layers, title: "Blockchain Infrastructure", desc: "Investing in the foundation of the decentralised future." },
//     { icon: Globe, title: "Global Stock Markets", desc: "Exposure to leading companies across developed markets." },
//     { icon: Bitcoin, title: "Cryptocurrencies", desc: "Access to high-growth digital assets with long-term potential." },
//     { icon: Activity, title: "Bitcoin", desc: "The world's leading digital asset and store of value." },
//     { icon: RefreshCw, title: "Foreign Exchange (Forex)", desc: "Global currency markets with strong liquidity and flexibility." },
// ];

// const whyChoose = [
//     { icon: Globe, title: "Global Market Exposure", desc: "Access diverse markets and high-quality opportunities." },
//     { icon: BarChart2, title: "Diversified Strategies", desc: "Balanced portfolios designed for various market conditions." },
//     { icon: Eye, title: "Transparent Reporting", desc: "Clear, timely and comprehensive performance reporting." },
//     { icon: Shield, title: "Secure Deposit Processes", desc: "Institution-grade security for your peace of mind." },
//     { icon: Users, title: "Investor-Centric Experience", desc: "Tailored solutions built around your goals and needs." },
//     { icon: Headphones, title: "24/7 Support", desc: "Our team is here whenever you need us." },
// ];

// /* ─────────── SECTION DIVIDER LINE ─────────── */

// function SectionLabel({ text }: { text: string }) {
//     const ref = useRef(null);
//     const inView = useInView(ref, { once: true });
//     return (
//         <motion.div
//             ref={ref}
//             initial={{ opacity: 0, x: -20 }}
//             animate={inView ? { opacity: 1, x: 0 } : {}}
//             transition={{ duration: 0.5, ease }}
//             className="flex items-center gap-3 mb-4"
//         >
//             <div className="h-px w-8 bg-[#1a3a6e]" />
//             <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a3a6e]">
//                 {text}
//             </span>
//         </motion.div>
//     );
// }

// /* ─────────── MAIN PAGE ─────────── */

// export default function AboutPage() {
//     const heroRef = useRef(null);
//     const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
//     const heroY = useTransform(heroScroll, [0, 1], ["0%", "20%"]);
//     const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

//     return (
//         <main className="bg-white text-[#0a1f44] antialiased font-sans overflow-hidden">

//             {/* ══════════════════════════════════════════
//                 SECTION 1 — HERO
//             ══════════════════════════════════════════ */}
//             <section
//                 ref={heroRef}
//                 className="relative min-h-[92vh] flex items-end overflow-hidden"
//             >
//                 {/* Parallax image */}
//                 <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
//                     <Image
//                         src={aboutBg}
//                         alt="Singapore Merlion skyline"
//                         fill
//                         className="object-cover object-center"
//                         priority
//                         sizes="100vw"
//                     />
//                     {/* Dark gradient overlay */}
//                     <div className="absolute inset-0 bg-gradient-to-r from-gray-400/85 via-gray-200/50 to-transparent" />
//                     <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f44]/60 via-transparent to-transparent" />
//                 </motion.div>

//                 {/* Content */}
//                 <motion.div
//                     className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32"
//                     style={{ opacity: heroOpacity }}
//                 >
//                     <SectionLabel text="About Merlion Asset Holdings" />

//                     <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight text-white max-w-3xl">
//                         <WordReveal text="Investing With Discipline." className="block" delay={0.1} />
//                         <WordReveal text="Building Wealth With Purpose." className="block text-gray-100" delay={0.4} />
//                     </h1>

//                     <FadeUp delay={0.7} className="mt-8 max-w-xl">
//                         <p className="text-base leading-relaxed text-white/75">
//                             Merlion Asset Holdings provides access to professionally managed
//                             investment opportunities across digital assets, global markets,
//                             and emerging technologies.
//                         </p>
//                         <p className="mt-4 text-base leading-relaxed text-white/65">
//                             Our mission is to help investors participate in the evolving global
//                             economy through disciplined strategies, transparent processes,
//                             and long-term thinking.
//                         </p>
//                     </FadeUp>

//                     {/* Feature badges */}
//                     <FadeUp delay={0.9} className="mt-10 flex flex-wrap gap-6">
//                         {[
//                             { icon: Globe, title: "Global Perspective", sub: "Opportunities across international markets" },
//                             { icon: Shield, title: "Built on Trust", sub: "Transparency, security and investor-first approach" },
//                         ].map((f, i) => (
//                             <div key={f.title} className="flex items-center gap-3">
//                                 <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
//                                     <f.icon className="h-4.5 w-4.5 text-white" />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm font-bold text-white">{f.title}</p>
//                                     <p className="text-[11px] text-white/55">{f.sub}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </FadeUp>
//                 </motion.div>

//                 {/* Bottom fade */}
//                 <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
//             </section>

//             {/* ══════════════════════════════════════════
//                 SECTION 2 — OUR STORY
//             ══════════════════════════════════════════ */}
//             <section className="py-20 md:py-28 bg-white">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="grid gap-12 lg:grid-cols-3 lg:gap-16 items-start">

//                         {/* Left: headline */}
//                         <div>
//                             <SectionLabel text="Our Story" />
//                             <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-[#0a1f44]">
//                                 <WordReveal text="Inspired by Singapore's Global Vision." className="block" delay={0.05} />
//                                 <WordReveal text="Built for the Future of Investing." className="block mt-1 text-[#1a3a6e]/70" delay={0.3} />
//                             </h2>
//                         </div>

//                         {/* Centre: body copy */}
//                         <FadeIn delay={0.15} direction="up">
//                             <div className="space-y-4 text-sm leading-relaxed text-[#0a1f44]/65">
//                                 <p>
//                                     Named after the iconic Merlion, a symbol of strength, resilience,
//                                     and global connectivity, Merlion Asset Holdings reflects the values
//                                     that define modern investing.
//                                 </p>
//                                 <p>
//                                     We believe the future of wealth creation lies at the intersection of
//                                     traditional finance and digital innovation.
//                                 </p>
//                                 <p>
//                                     Our investment approach combines disciplined risk management
//                                     with exposure to transformative opportunities across global markets.
//                                 </p>
//                                 <p>
//                                     By integrating data-driven research, strategic diversification,
//                                     and long-term investment principles, we aim to create
//                                     sustainable value for our investors.
//                                 </p>
//                             </div>
//                         </FadeIn>

//                         {/* Right: image */}
//                         <FadeIn delay={0.25} direction="right">
//                             <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(10,31,68,0.15)]">
//                                 <Image
//                                     src={story}
//                                     alt="Singapore skyline investment office"
//                                     width={520}
//                                     height={360}
//                                     className="w-full h-auto object-cover"
//                                     sizes="(max-width: 1024px) 100vw, 33vw"
//                                 />
//                                 {/* Decorative border */}
//                                 <div className="absolute inset-0 rounded-2xl border border-[#1a3a6e]/10" />
//                             </div>
//                         </FadeIn>
//                     </div>

//                     {/* Stats row */}
//                     <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
//                         {[
//                             { num: 12, suffix: "+", label: "Years of experience" },
//                             { num: 50, suffix: "+", label: "Countries served" },
//                             { num: 2, suffix: "B+", label: "Assets under management" },
//                             { num: 98, suffix: "%", label: "Client satisfaction rate" },
//                         ].map((s, i) => (
//                             <FadeUp key={s.label} delay={i * 0.1} className="text-center">
//                                 <p className="text-4xl font-extrabold text-[#1a3a6e] leading-none">
//                                     <CountUp end={s.num} suffix={s.suffix} delay={i * 0.12} />
//                                 </p>
//                                 <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#0a1f44]/40">
//                                     {s.label}
//                                 </p>
//                             </FadeUp>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* ══════════════════════════════════════════
//                 SECTION 3 — INVESTMENT PHILOSOPHY
//             ══════════════════════════════════════════ */}
//             <section className="py-20 md:py-28 bg-[#f4f7fc]">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="grid gap-12 lg:grid-cols-[1fr_2fr] items-start">

//                         {/* Left: headline */}
//                         <div className="lg:pr-8">
//                             <SectionLabel text="Our Investment Philosophy" />
//                             <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-[#0a1f44]">
//                                 <WordReveal text="A Diversified Approach to Long-Term Growth." delay={0.05} />
//                             </h2>
//                             <FadeUp delay={0.3} className="mt-5 text-sm leading-relaxed text-[#0a1f44]/60">
//                                 <p>
//                                     Markets evolve. Principles endure. Our investment framework is built
//                                     around diversification, disciplined execution, and active risk management.
//                                 </p>
//                             </FadeUp>
//                         </div>

//                         {/* Right: 4 pillars */}
//                         <div className="grid gap-5 sm:grid-cols-2">
//                             {philosophyPillars.map((p, i) => (
//                                 <FadeIn key={p.title} delay={i * 0.1} direction="up">
//                                     <motion.div
//                                         whileHover={{ y: -4 }}
//                                         className="group rounded-2xl border border-[#dce6f5] bg-white p-6 shadow-[0_2px_16px_rgba(10,31,68,0.06)] hover:shadow-[0_8px_32px_rgba(10,31,68,0.12)] transition-shadow duration-200"
//                                     >
//                                         <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0fb] border border-[#c8d9f0]">
//                                             <p.icon className="h-5 w-5 text-[#1a3a6e]" />
//                                         </div>
//                                         <h3 className="mb-2 text-sm font-extrabold text-[#0a1f44]">{p.title}</h3>
//                                         <p className="text-xs leading-relaxed text-[#0a1f44]/55">{p.desc}</p>
//                                     </motion.div>
//                                 </FadeIn>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* ══════════════════════════════════════════
//                 SECTION 4 — MARKETS WE FOCUS ON
//             ══════════════════════════════════════════ */}
//             <section className="py-20 md:py-28 bg-white">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="mb-12 text-center">
//                         <SectionLabel text="Markets We Focus On" />
//                         <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0a1f44] mt-2">
//                             <WordReveal text="Global Opportunities Across Diverse Markets" delay={0.05} />
//                         </h2>
//                         <FadeUp delay={0.35} className="mx-auto mt-4 max-w-xl">
//                             <p className="text-sm text-[#0a1f44]/55 leading-relaxed">
//                                 Our portfolios are designed to balance innovation with stability by combining
//                                 exposure to both traditional and digital asset classes.
//                             </p>
//                         </FadeUp>
//                     </div>

//                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                         {markets.map((m, i) => (
//                             <FadeIn key={m.title} delay={i * 0.08} direction="up">
//                                 <motion.div
//                                     whileHover={{ scale: 1.02 }}
//                                     className="group flex items-start gap-4 rounded-2xl border border-[#dce6f5] bg-white p-5 shadow-[0_2px_12px_rgba(10,31,68,0.05)] hover:border-[#1a3a6e]/30 hover:shadow-[0_6px_24px_rgba(10,31,68,0.10)] transition-all duration-200 cursor-default"
//                                 >
//                                     <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#e8f0fb] border border-[#c8d9f0] group-hover:bg-[#1a3a6e] group-hover:border-[#1a3a6e] transition-colors duration-200">
//                                         <m.icon className="h-5 w-5 text-[#1a3a6e] group-hover:text-white transition-colors duration-200" />
//                                     </div>
//                                     <div>
//                                         <h3 className="text-sm font-extrabold text-[#0a1f44] mb-1">{m.title}</h3>
//                                         <p className="text-xs leading-relaxed text-[#0a1f44]/50">{m.desc}</p>
//                                     </div>
//                                 </motion.div>
//                             </FadeIn>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* ══════════════════════════════════════════
//                 SECTION 5 — WHY INVESTORS CHOOSE MERLION
//                 (Dark navy section)
//             ══════════════════════════════════════════ */}
//             <section className="relative overflow-hidden bg-[#0a1f44] py-20 md:py-28">
//                 {/* Subtle background pattern */}
//                 <div className="pointer-events-none absolute inset-0">
//                     <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
//                         <defs>
//                             <pattern id="about-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
//                                 <circle cx="2" cy="2" r="1.5" fill="#90b8e8" />
//                             </pattern>
//                         </defs>
//                         <rect width="100%" height="100%" fill="url(#about-dots)" />
//                     </svg>
//                     <motion.div
//                         className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-[#1a3a6e]/40"
//                         animate={{ scale: [1, 1.1, 1] }}
//                         transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
//                         style={{ filter: "blur(80px)" }}
//                     />
//                     <motion.div
//                         className="absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#0f2d5e]/50"
//                         animate={{ scale: [1, 1.15, 1] }}
//                         transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
//                         style={{ filter: "blur(70px)" }}
//                     />
//                 </div>

//                 <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="grid gap-12 lg:grid-cols-[auto_1fr] items-center">

//                         {/* Left: label + headline */}
//                         <div className="lg:max-w-[220px]">
//                             <FadeIn direction="left">
//                                 <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#90b8e8] mb-3">
//                                     Why investors choose Merlion
//                                 </p>
//                                 <p className="text-sm leading-relaxed text-white/60">
//                                     Every decision we make is guided by a commitment to professionalism,
//                                     transparency, and long-term value creation.
//                                 </p>
//                             </FadeIn>
//                         </div>

//                         {/* Right: 6-column feature grid */}
//                         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//                             {whyChoose.map((w, i) => (
//                                 <FadeIn key={w.title} delay={i * 0.08} direction="up">
//                                     <div className="group flex items-start gap-3">
//                                         <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#90b8e8]/20 bg-[#90b8e8]/10">
//                                             <w.icon className="h-4 w-4 text-[#90b8e8]" />
//                                         </div>
//                                         <div>
//                                             <p className="text-xs font-bold text-white leading-tight">{w.title}</p>
//                                             <p className="mt-1 text-[11px] leading-relaxed text-white/45">{w.desc}</p>
//                                         </div>
//                                     </div>
//                                 </FadeIn>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* ══════════════════════════════════════════
//                 SECTION 6 — TRUST / CTA SPLIT
//             ══════════════════════════════════════════ */}
//             <section className="bg-white py-20 md:py-28">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="grid gap-12 lg:grid-cols-2 items-center">

//                         {/* Left: trust statement */}
//                         <div>
//                             <SectionLabel text="Our Investment" />
//                             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#0a1f44]">
//                                 <WordReveal text="Trust Is Earned Through Consistency." delay={0.05} />
//                             </h2>
//                             <FadeUp delay={0.3}>
//                                 <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#0a1f44]/60">
//                                     <p>
//                                         We understand that every investment represents more
//                                         than capital — it represents trust.
//                                     </p>
//                                     <p>
//                                         That is why we prioritise disciplined decision-making,
//                                         responsible risk management, and clear communication
//                                         at every stage of the investor journey.
//                                     </p>
//                                 </div>
//                             </FadeUp>
//                         </div>

//                         {/* Right: body copy + CTAs */}
//                         <FadeIn delay={0.15} direction="right">
//                             <div className="space-y-5">
//                                 <p className="text-sm leading-relaxed text-[#0a1f44]/60">
//                                     Our commitment is to build lasting relationships based
//                                     on integrity, transparency, and a shared vision for
//                                     long-term growth.
//                                 </p>

//                                 {/* CTA buttons */}
//                                 <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
//                                     <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
//                                         <Link
//                                             href="/investments"
//                                             className="group flex items-center justify-center gap-2 rounded-xl bg-[#0a1f44] px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(10,31,68,0.35)] hover:shadow-[0_8px_28px_rgba(10,31,68,0.5)] transition-shadow duration-200"
//                                         >
//                                             Explore Investment Plans
//                                             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                                         </Link>
//                                     </motion.div>

//                                     <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
//                                         <Link
//                                             href="/contact"
//                                             className="group flex items-center justify-center gap-2 rounded-xl border border-[#0a1f44]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#0a1f44] hover:border-[#0a1f44]/50 hover:bg-[#f4f7fc] transition-all duration-200"
//                                         >
//                                             Contact Our Team
//                                             <ArrowRight className="h-4 w-4 text-[#0a1f44]/50 transition-transform group-hover:translate-x-1" />
//                                         </Link>
//                                     </motion.div>
//                                 </div>
//                             </div>
//                         </FadeIn>
//                     </div>
//                 </div>
//             </section>

//             {/* ══════════════════════════════════════════
//                 RISK DISCLOSURE BAR
//             ══════════════════════════════════════════ */}
//             <div className="border-t border-[#dce6f5] bg-[#f4f7fc] px-4 py-4 sm:px-6 lg:px-8">
//                 <div className="mx-auto max-w-7xl flex items-start gap-3">
//                     <Shield className="h-4 w-4 flex-shrink-0 text-[#1a3a6e]/50 mt-0.5" />
//                     <p className="text-[11px] leading-relaxed text-[#0a1f44]/45">
//                         <span className="font-bold">Risk Disclosure:</span> Investments involve risk, including the potential loss of principal.
//                         Past performance does not guarantee future results. Investors should carefully review
//                         all relevant documentation and consider their financial objectives before making any investment decisions.
//                     </p>
//                 </div>
//             </div>
//         </main>
//     );
// }




















// src/app/about/page.tsx
// Video needed:
//   /public/videos/hero-bg.mp4   ← place your hero video here
//   /public/videos/hero-bg.webm  ← optional WebM for broader browser support

"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Globe, Shield, TrendingUp, BarChart2, Eye, RefreshCw,
    Users, Headphones, ArrowRight,
    Bitcoin, DollarSign, Layers, Activity,
} from "lucide-react";
import {
    motion,
    useInView,
    useScroll,
    useTransform,
} from "framer-motion";
import story from "@/assets/about/story.png";

/* ─────────────────── ANIMATION HELPERS ─────────────────── */

const ease = [0.22, 1, 0.36, 1] as const;

function FadeUp({
    children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.7, delay, ease }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function FadeIn({
    children, delay = 0, className = "", direction = "up",
}: {
    children: React.ReactNode; delay?: number; className?: string
    direction?: "up" | "left" | "right";
}) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const initial =
        direction === "left" ? { opacity: 0, x: -40, filter: "blur(4px)" } :
            direction === "right" ? { opacity: 0, x: 40, filter: "blur(4px)" } :
                { opacity: 0, y: 24, filter: "blur(4px)" };
    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={inView ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.65, delay, ease }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function WordReveal({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <span ref={ref} className={className}>
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    className="inline-block mr-[0.22em]"
                    initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                    animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                    transition={{ duration: 0.55, delay: delay + i * 0.06, ease }}
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}

function CountUp({ end, suffix = "", duration = 1.8, delay = 0 }: { end: number; suffix?: string; duration?: number; delay?: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView || !ref.current) return;
        const startTime = performance.now() + delay * 1000;
        const totalMs = duration * 1000;
        function update(now: number) {
            if (now < startTime) { requestAnimationFrame(update); return; }
            const p = Math.min((now - startTime) / totalMs, 1);
            const e = 1 - Math.pow(1 - p, 3);
            if (ref.current) ref.current.textContent = Math.round(e * end) + suffix;
            if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }, [inView, end, suffix, duration, delay]);
    return <span ref={ref}>0{suffix}</span>;
}

function SectionLabel({ text }: { text: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease }}
            className="mb-4 flex items-center gap-3"
        >
            <div className="h-px w-8 bg-[#1a3a6e]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a3a6e]">{text}</span>
        </motion.div>
    );
}

/* ─────────────────── DATA ─────────────────── */

const philosophyPillars = [
    { icon: BarChart2, title: "Strategic Diversification", desc: "We allocate capital across multiple asset classes to reduce concentration risk and capture opportunities across market cycles." },
    { icon: TrendingUp, title: "Long-Term Perspective", desc: "We focus on sustainable growth rather than short-term market movements." },
    { icon: Shield, title: "Disciplined Risk Management", desc: "Capital preservation and prudent portfolio construction remain central to our investment process." },
    { icon: Eye, title: "Transparency", desc: "We believe investors deserve clear communication, straightforward reporting, and full visibility into their investment journey." },
];

const markets = [
    { icon: DollarSign, title: "Stablecoins", desc: "Secure, transparent and efficient digital value solutions." },
    { icon: Layers, title: "Blockchain Infrastructure", desc: "Investing in the foundation of the decentralised future." },
    { icon: Globe, title: "Global Stock Markets", desc: "Exposure to leading companies across developed markets." },
    { icon: Bitcoin, title: "Cryptocurrencies", desc: "Access to high-growth digital assets with long-term potential." },
    { icon: Activity, title: "Bitcoin", desc: "The world's leading digital asset and store of value." },
    { icon: RefreshCw, title: "Foreign Exchange (Forex)", desc: "Global currency markets with strong liquidity and flexibility." },
];

const whyChoose = [
    { icon: Globe, title: "Global Market Exposure", desc: "Access diverse markets and high-quality opportunities." },
    { icon: BarChart2, title: "Diversified Strategies", desc: "Balanced portfolios designed for various market conditions." },
    { icon: Eye, title: "Transparent Reporting", desc: "Clear, timely and comprehensive performance reporting." },
    { icon: Shield, title: "Secure Deposit Processes", desc: "Institution-grade security for your peace of mind." },
    { icon: Users, title: "Investor-Centric Experience", desc: "Tailored solutions built around your goals and needs." },
    { icon: Headphones, title: "24/7 Support", desc: "Our team is here whenever you need us." },
];

/* ─────────────────── HERO VIDEO BACKGROUND ─────────────────── */

function HeroVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Ensure autoplay resumes if browser pauses it
        video.play().catch(() => {
            // Autoplay blocked — common on mobile until user interaction
            // The video will play as soon as the user taps anywhere
            const resume = () => { video.play().catch(() => { }); document.removeEventListener("click", resume); };
            document.addEventListener("click", resume, { once: true });
        });

        // Restart if it somehow ends (extra safety on top of loop attribute)
        const onEnded = () => { video.currentTime = 0; video.play().catch(() => { }); };
        video.addEventListener("ended", onEnded);
        return () => video.removeEventListener("ended", onEnded);
    }, []);

    return (
        <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            disablePictureInPicture
        >
            {/* WebM first for Chromium / Firefox; MP4 as fallback for Safari */}
            {/* <source src="/videos/hero-bg.webm" type="video/webm" /> */}
            <source src="/videos/hero_bg.mp4" type="video/mp4" />
        </video>
    );
}

/* ─────────────────── MAIN PAGE ─────────────────── */

export default function AboutPage() {
    const heroRef = useRef(null);
    const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroContentY = useTransform(heroScroll, [0, 1], ["0%", "12%"]);
    const heroOpacity = useTransform(heroScroll, [0, 0.75], [1, 0]);

    return (
        <main className="bg-white text-[#0a1f44] antialiased font-sans overflow-hidden">

            {/* ══════════════════ SECTION 1 — HERO ══════════════════ */}
            <section
                ref={heroRef}
                className="relative min-h-[92vh] flex items-end overflow-hidden"
            >
                {/* ── Video background ── */}
                <HeroVideo />

                {/* ── Gradient overlays (same as before, sitting on top of video) ── */}
                <div className="pointer-events-none absolute inset-0 z-[1]">
                    {/* Left-side darkening so copy stays readable */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-400/80 via-gray-400/45 to-transparent" />
                    {/* Bottom lift to white */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-400/55 via-transparent to-transparent" />
                </div>

                {/* ── Hero content ── */}
                <motion.div
                    className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32"
                    style={{ y: heroContentY, opacity: heroOpacity }}
                >
                    <SectionLabel text="About Merlion Asset Holdings" />

                    <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                        <WordReveal text="Investing With Discipline." className="block" delay={0.1} />
                        <WordReveal text="Building Wealth With Purpose." className="block text-gray-50" delay={0.4} />
                    </h1>

                    <FadeUp delay={0.7} className="mt-8 max-w-xl">
                        <p className="text-base leading-relaxed text-white/75">
                            Merlion Asset Holdings provides access to professionally managed
                            investment opportunities across digital assets, global markets,
                            and emerging technologies.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-white/65">
                            Our mission is to help investors participate in the evolving global
                            economy through disciplined strategies, transparent processes,
                            and long-term thinking.
                        </p>
                    </FadeUp>

                    {/* Feature badges */}
                    <FadeUp delay={0.9} className="mt-10 flex flex-wrap gap-6">
                        {[
                            { icon: Globe, title: "Global Perspective", sub: "Opportunities across international markets" },
                            { icon: Shield, title: "Built on Trust", sub: "Transparency, security and investor-first approach" },
                        ].map(f => (
                            <div key={f.title} className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
                                    <f.icon className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{f.title}</p>
                                    <p className="text-[11px] text-white/55">{f.sub}</p>
                                </div>
                            </div>
                        ))}
                    </FadeUp>
                </motion.div>

                {/* Bottom fade to white */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 bg-gradient-to-t from-white to-transparent" />
            </section>

            {/* ══════════════════ SECTION 2 — OUR STORY ══════════════════ */}
            <section className="bg-white py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid items-start gap-12 lg:grid-cols-3 lg:gap-16">
                        {/* Left */}
                        <div>
                            <SectionLabel text="Our Story" />
                            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0a1f44] sm:text-4xl">
                                <WordReveal text="Inspired by Singapore's Global Vision." className="block" delay={0.05} />
                                <WordReveal text="Built for the Future of Investing." className="mt-1 block text-[#1a3a6e]/70" delay={0.3} />
                            </h2>
                        </div>

                        {/* Centre */}
                        <FadeIn delay={0.15} direction="up">
                            <div className="space-y-4 text-sm leading-relaxed text-[#0a1f44]/65">
                                <p>Named after the iconic Merlion, a symbol of strength, resilience, and global connectivity, Merlion Asset Holdings reflects the values that define modern investing.</p>
                                <p>We believe the future of wealth creation lies at the intersection of traditional finance and digital innovation.</p>
                                <p>Our investment approach combines disciplined risk management with exposure to transformative opportunities across global markets.</p>
                                <p>By integrating data-driven research, strategic diversification, and long-term investment principles, we aim to create sustainable value for our investors.</p>
                            </div>
                        </FadeIn>

                        {/* Right image */}
                        <FadeIn delay={0.25} direction="right">
                            <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(10,31,68,0.15)]">
                                <Image src={story} alt="Singapore skyline investment office" width={520} height={360} className="h-auto w-full object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
                                <div className="absolute inset-0 rounded-2xl border border-[#1a3a6e]/10" />
                            </div>
                        </FadeIn>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {[
                            { num: 12, suffix: "+", label: "Years of experience" },
                            { num: 50, suffix: "+", label: "Countries served" },
                            { num: 2, suffix: "B+", label: "Assets under management" },
                            { num: 98, suffix: "%", label: "Client satisfaction rate" },
                        ].map((s, i) => (
                            <FadeUp key={s.label} delay={i * 0.1} className="text-center">
                                <p className="text-4xl font-extrabold leading-none text-[#1a3a6e]">
                                    <CountUp end={s.num} suffix={s.suffix} delay={i * 0.12} />
                                </p>
                                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#0a1f44]/40">{s.label}</p>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════ SECTION 3 — PHILOSOPHY ══════════════════ */}
            <section className="bg-[#f4f7fc] py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid items-start gap-12 lg:grid-cols-[1fr_2fr]">
                        <div className="lg:pr-8">
                            <SectionLabel text="Our Investment Philosophy" />
                            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0a1f44] sm:text-4xl">
                                <WordReveal text="A Diversified Approach to Long-Term Growth." delay={0.05} />
                            </h2>
                            <FadeUp delay={0.3} className="mt-5 text-sm leading-relaxed text-[#0a1f44]/60">
                                <p>Markets evolve. Principles endure. Our investment framework is built around diversification, disciplined execution, and active risk management.</p>
                            </FadeUp>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            {philosophyPillars.map((p, i) => (
                                <FadeIn key={p.title} delay={i * 0.1} direction="up">
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        className="group rounded-2xl border border-[#dce6f5] bg-white p-6 shadow-[0_2px_16px_rgba(10,31,68,0.06)] transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(10,31,68,0.12)]"
                                    >
                                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#c8d9f0] bg-[#e8f0fb]">
                                            <p.icon className="h-5 w-5 text-[#1a3a6e]" />
                                        </div>
                                        <h3 className="mb-2 text-sm font-extrabold text-[#0a1f44]">{p.title}</h3>
                                        <p className="text-xs leading-relaxed text-[#0a1f44]/55">{p.desc}</p>
                                    </motion.div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════ SECTION 4 — MARKETS ══════════════════ */}
            <section className="bg-white py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <SectionLabel text="Markets We Focus On" />
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0a1f44] sm:text-4xl lg:text-5xl">
                            <WordReveal text="Global Opportunities Across Diverse Markets" delay={0.05} />
                        </h2>
                        <FadeUp delay={0.35} className="mx-auto mt-4 max-w-xl">
                            <p className="text-sm leading-relaxed text-[#0a1f44]/55">Our portfolios are designed to balance innovation with stability by combining exposure to both traditional and digital asset classes.</p>
                        </FadeUp>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {markets.map((m, i) => (
                            <FadeIn key={m.title} delay={i * 0.08} direction="up">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="group flex cursor-default items-start gap-4 rounded-2xl border border-[#dce6f5] bg-white p-5 shadow-[0_2px_12px_rgba(10,31,68,0.05)] transition-all duration-200 hover:border-[#1a3a6e]/30 hover:shadow-[0_6px_24px_rgba(10,31,68,0.10)]"
                                >
                                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[#c8d9f0] bg-[#e8f0fb] transition-colors duration-200 group-hover:border-[#1a3a6e] group-hover:bg-[#1a3a6e]">
                                        <m.icon className="h-5 w-5 text-[#1a3a6e] transition-colors duration-200 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-sm font-extrabold text-[#0a1f44]">{m.title}</h3>
                                        <p className="text-xs leading-relaxed text-[#0a1f44]/50">{m.desc}</p>
                                    </div>
                                </motion.div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════ SECTION 5 — WHY CHOOSE (dark) ══════════════════ */}
            <section className="relative overflow-hidden bg-[#0a1f44] py-20 md:py-28">
                <div className="pointer-events-none absolute inset-0">
                    <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="about-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.5" fill="#90b8e8" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#about-dots)" />
                    </svg>
                    <motion.div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-[#1a3a6e]/40" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} style={{ filter: "blur(80px)" }} />
                    <motion.div className="absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#0f2d5e]/50" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }} style={{ filter: "blur(70px)" }} />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-[auto_1fr]">
                        <div className="lg:max-w-[220px]">
                            <FadeIn direction="left">
                                <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#90b8e8]">Why investors choose Merlion</p>
                                <p className="text-sm leading-relaxed text-white/60">Every decision we make is guided by a commitment to professionalism, transparency, and long-term value creation.</p>
                            </FadeIn>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {whyChoose.map((w, i) => (
                                <FadeIn key={w.title} delay={i * 0.08} direction="up">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#90b8e8]/20 bg-[#90b8e8]/10">
                                            <w.icon className="h-4 w-4 text-[#90b8e8]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold leading-tight text-white">{w.title}</p>
                                            <p className="mt-1 text-[11px] leading-relaxed text-white/45">{w.desc}</p>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════ SECTION 6 — TRUST / CTA ══════════════════ */}
            <section className="bg-white py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div>
                            <SectionLabel text="Our Investment" />
                            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0a1f44] sm:text-4xl lg:text-5xl">
                                <WordReveal text="Trust Is Earned Through Consistency." delay={0.05} />
                            </h2>
                            <FadeUp delay={0.3}>
                                <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#0a1f44]/60">
                                    <p>We understand that every investment represents more than capital — it represents trust.</p>
                                    <p>That is why we prioritise disciplined decision-making, responsible risk management, and clear communication at every stage of the investor journey.</p>
                                </div>
                            </FadeUp>
                        </div>
                        <FadeIn delay={0.15} direction="right">
                            <div className="space-y-5">
                                <p className="text-sm leading-relaxed text-[#0a1f44]/60">Our commitment is to build lasting relationships based on integrity, transparency, and a shared vision for long-term growth.</p>
                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                                        <Link href="/investments" className="group flex items-center justify-center gap-2 rounded-xl bg-[#0a1f44] px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(10,31,68,0.35)] transition-shadow duration-200 hover:shadow-[0_8px_28px_rgba(10,31,68,0.5)]">
                                            Explore Investment Plans
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                                        <Link href="/contact" className="group flex items-center justify-center gap-2 rounded-xl border border-[#0a1f44]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#0a1f44] transition-all duration-200 hover:border-[#0a1f44]/50 hover:bg-[#f4f7fc]">
                                            Contact Our Team
                                            <ArrowRight className="h-4 w-4 text-[#0a1f44]/50 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* ══════════════════ RISK DISCLOSURE ══════════════════ */}
            <div className="border-t border-[#dce6f5] bg-[#f4f7fc] px-4 py-4 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1a3a6e]/50" />
                    <p className="text-[11px] leading-relaxed text-[#0a1f44]/45">
                        <span className="font-bold">Risk Disclosure:</span> Investments involve risk, including the potential loss of principal.
                        Past performance does not guarantee future results. Investors should carefully review
                        all relevant documentation and consider their financial objectives before making any investment decisions.
                    </p>
                </div>
            </div>
        </main>
    );
}