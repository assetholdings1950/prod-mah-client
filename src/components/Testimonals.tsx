"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────── */
interface Testimonial {
    quote: string;
    name: string;
    role: string;
    rating: number;
}

/* ─── Data ───────────────────────────────────────────────────── */
const TESTIMONIALS: Testimonial[] = [
    {
        quote:
            "Merlion Asset Holdings has been a game-changer for our portfolio. Their disciplined approach and deep market insights consistently deliver strong, risk-adjusted returns.",
        name: "Investor",
        role: "Private Wealth",
        rating: 5,
    },
    {
        quote:
            "The team's expertise in both traditional and digital assets gives us confidence in every market cycle. Transparency and communication are second to none.",
        name: "Investor",
        role: "Institutional Investor",
        rating: 5,
    },
    {
        quote:
            "We appreciate Merlion's long-term vision and unwavering commitment to protecting and growing our investments. A truly trusted investment partner.",
        name: "Investor",
        role: "Family Office",
        rating: 5,
    },
    {
        quote:
            "From onboarding to reporting, every step felt considered and professional. Merlion treats our capital with the same care we would ourselves.",
        name: "Investor",
        role: "Private Client",
        rating: 5,
    },
    {
        quote:
            "Consistent performance, clear communication, and a genuine understanding of our goals. Merlion has earned a permanent place in our strategy.",
        name: "Investor",
        role: "Corporate Treasury",
        rating: 5,
    },
    {
        quote:
            "Merlion Asset Holdings has been a game-changer for our portfolio. Their disciplined approach and deep market insights consistently deliver strong, risk-adjusted returns.",
        name: "Investor",
        role: "Private Wealth",
        rating: 5,
    },
    {
        quote:
            "The team's expertise in both traditional and digital assets gives us confidence in every market cycle. Transparency and communication are second to none.",
        name: "Investor",
        role: "Institutional Investor",
        rating: 5,
    },
    {
        quote:
            "We appreciate Merlion's long-term vision and unwavering commitment to protecting and growing our investments. A truly trusted investment partner.",
        name: "Investor",
        role: "Family Office",
        rating: 5,
    },
    {
        quote:
            "From onboarding to reporting, every step felt considered and professional. Merlion treats our capital with the same care we would ourselves.",
        name: "Investor",
        role: "Private Client",
        rating: 5,
    },
    {
        quote:
            "Consistent performance, clear communication, and a genuine understanding of our goals. Merlion has earned a permanent place in our strategy.",
        name: "Investor",
        role: "Corporate Treasury",
        rating: 5,
    },
];

/* ─── Star row ───────────────────────────────────────────────── */
function Stars({ count }: { count: number }) {
    return (
        <div className="flex items-center gap-1.5" aria-label={`${count} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={i < count ? "#2563EB" : "rgba(8,27,58,0.15)"}
                    className="shrink-0"
                >
                    <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

/* ─── Single card ────────────────────────────────────────────── */
function TestimonialCard({ t }: { t: Testimonial }) {
    return (
        <div
            className="flex h-full flex-col rounded-3xl bg-white/95 p-6 sm:p-7 lg:p-8 ring-1 ring-[rgba(8,27,58,0.05)] backdrop-blur-sm"
            style={{
                boxShadow: "0 24px 60px -30px rgba(8,27,58,0.35), 0 4px 16px rgba(8,27,58,0.06)",
                transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px) scale(1.015)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 40px 80px -30px rgba(8,27,58,0.42), 0 8px 24px rgba(8,27,58,0.1)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 24px 60px -30px rgba(8,27,58,0.35), 0 4px 16px rgba(8,27,58,0.06)";
            }}
        >
            {/* Quote mark */}
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[rgba(37,99,235,0.1)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#2563EB" aria-hidden>
                    <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h6.83v-6.83H5.5A1.67 1.67 0 0 1 7.17 9.5V6zm9 0A5.17 5.17 0 0 0 11 11.17V18h6.83v-6.83H14.5a1.67 1.67 0 0 1 1.67-1.67V6z" />
                </svg>
            </div>

            {/* Quote text */}
            <p
                className="font-[var(--font-inter,sans-serif)] leading-[1.7] text-[#1e293b]"
                style={{ fontSize: "clamp(0.86rem,1.4vw,0.96rem)" }}
            >
                {t.quote}
            </p>

            {/* spacer pushes footer down for equal heights */}
            <div className="flex-1" />

            {/* Divider */}
            <div className="my-5 h-px w-full bg-[rgba(8,27,58,0.08)]" />

            {/* Stars */}
            <Stars count={t.rating} />

            {/* Person */}
            <div className="mt-5 flex items-center gap-3.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-b from-[#7c8db0] to-[#aebbd4]">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                        <circle cx="12" cy="8.5" r="4" />
                        <path d="M4 21v-1a7 7 0 0 1 16 0v1z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <p
                        className="m-0 font-[var(--font-inter,sans-serif)] font-bold text-[var(--navy,#081B3A)]"
                        style={{ fontSize: "clamp(0.92rem,1.5vw,1.02rem)" }}
                    >
                        {t.name}
                    </p>
                    <p
                        className="m-0 font-[var(--font-inter,sans-serif)] text-[var(--text-muted,#64748B)]"
                        style={{ fontSize: "clamp(0.74rem,1.2vw,0.84rem)" }}
                    >
                        {t.role}
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ─── Section ────────────────────────────────────────────────── */
export default function TestimonialsSection() {
    const ref = useRef<HTMLElement>(null);
    const [active, setActive] = useState(false);
    const [page, setPage] = useState(0);
    const [perView, setPerView] = useState(3);

    /* reveal on scroll */
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect(); } },
            { threshold: 0.12 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    /* responsive cards-per-view */
    useEffect(() => {
        const calc = () => {
            const w = window.innerWidth;
            setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
        };
        calc();
        window.addEventListener("resize", calc);
        return () => window.removeEventListener("resize", calc);
    }, []);

    const pageCount = Math.max(1, Math.ceil(TESTIMONIALS.length / perView));
    const safePage = Math.min(page, pageCount - 1);

    const go = useCallback(
        (dir: number) => setPage((p) => (p + dir + pageCount) % pageCount),
        [pageCount]
    );

    /* keep page valid when perView changes */
    useEffect(() => {
        setPage((p) => Math.min(p, Math.max(0, pageCount - 1)));
    }, [pageCount]);

    return (
        <section
            ref={ref}
            className="relative w-full overflow-hidden"
            style={{
                background:
                    "radial-gradient(120% 80% at 80% 0%, #dbe8fb 0%, transparent 55%)," +
                    "linear-gradient(160deg, #e8f0fb 0%, #dde9f8 50%, #d2e2f5 100%)",
            }}
        >
            {/* dotted world map (top-left) */}
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-50"
                aria-hidden
                style={{
                    backgroundImage:
                        "radial-gradient(rgba(37,99,235,0.18) 1px, transparent 1.4px)",
                    backgroundSize: "12px 12px",
                    WebkitMaskImage:
                        "radial-gradient(80% 90% at 25% 10%, #000 25%, transparent 70%)",
                    maskImage:
                        "radial-gradient(80% 90% at 25% 10%, #000 25%, transparent 70%)",
                }}
            />

            {/* faint city/waterfront wash on the left */}
            <div
                className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[42%] opacity-[0.22]"
                aria-hidden
                style={{
                    background:
                        "linear-gradient(to top, rgba(37,99,235,0.25), transparent 65%)," +
                        "repeating-linear-gradient(90deg, transparent 0 18px, rgba(37,99,235,0.12) 18px 20px)",
                    WebkitMaskImage: "linear-gradient(to right, #000 30%, transparent 95%)",
                    maskImage: "linear-gradient(to right, #000 30%, transparent 95%)",
                }}
            />

            {/* flowing curves (right) */}
            <div
                className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[40%] opacity-40"
                aria-hidden
                style={{
                    background:
                        "repeating-radial-gradient(120% 120% at 130% 50%, transparent 0 38px, rgba(255,255,255,0.6) 38px 40px)",
                    WebkitMaskImage: "linear-gradient(to left, #000 10%, transparent 80%)",
                    maskImage: "linear-gradient(to left, #000 10%, transparent 80%)",
                }}
            />

            <div
                className="relative z-[1] mx-auto"
                style={{
                    maxWidth: "1280px",
                    padding: "clamp(56px,9vw,104px) clamp(16px,4vw,40px)",
                }}
            >
                {/* ── Header ── */}
                <div
                    className="mx-auto mb-10 max-w-[760px] text-center sm:mb-14"
                    style={{
                        opacity: active ? 1 : 0,
                        transform: active ? "translateY(0)" : "translateY(24px)",
                        transition: "opacity 0.8s 0.05s ease-out, transform 0.9s 0.05s cubic-bezier(0.23,1,0.32,1)",
                    }}
                >
                    {/* eyebrow with decorative lines */}
                    <div className="mb-5 flex items-center justify-center gap-3">
                        <span className="h-px w-12 bg-gradient-to-r from-transparent to-[rgba(37,99,235,0.5)]" />
                        <span className="h-1 w-1 rounded-full bg-[rgba(37,99,235,0.5)]" />
                        <span
                            className="font-[var(--font-inter,sans-serif)] font-bold uppercase tracking-[0.28em] text-[var(--accent,#2563EB)]"
                            style={{ fontSize: "clamp(0.6rem,1.1vw,0.7rem)" }}
                        >
                            Testimonials
                        </span>
                        <span className="h-1 w-1 rounded-full bg-[rgba(37,99,235,0.5)]" />
                        <span className="h-px w-12 bg-gradient-to-l from-transparent to-[rgba(37,99,235,0.5)]" />
                    </div>

                    <h2
                        className="m-0 font-[var(--font-playfair,Georgia,serif)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--navy,#081B3A)]"
                        style={{ fontSize: "clamp(1.8rem,5vw,3.4rem)" }}
                    >
                        Trusted by Investors.
                        <br />
                        Proven by <span className="text-[var(--accent,#2563EB)]">Performance.</span>
                    </h2>

                    <p
                        className="mx-auto mt-5 max-w-[560px] font-[var(--font-inter,sans-serif)] leading-[1.7] text-[var(--text-muted,#64748B)]"
                        style={{ fontSize: "clamp(0.82rem,1.4vw,1rem)" }}
                    >
                        Hear from our investors and partners who trust Merlion Asset Holdings
                        to deliver long-term value and exceptional results.
                    </p>
                </div>

                {/* ── Carousel ── */}
                <div
                    className="relative"
                    style={{
                        opacity: active ? 1 : 0,
                        transform: active ? "translateY(0)" : "translateY(28px)",
                        transition: "opacity 0.8s 0.18s ease-out, transform 0.9s 0.18s cubic-bezier(0.23,1,0.32,1)",
                    }}
                >
                    {/* prev arrow */}
                    <button
                        type="button"
                        onClick={() => go(-1)}
                        aria-label="Previous testimonials"
                        className="absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[var(--navy,#081B3A)] text-white shadow-lg transition-transform duration-200 hover:scale-110 md:grid lg:-left-5 xl:-left-7"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>

                    {/* next arrow */}
                    <button
                        type="button"
                        onClick={() => go(1)}
                        aria-label="Next testimonials"
                        className="absolute right-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[var(--navy,#081B3A)] text-white shadow-lg transition-transform duration-200 hover:scale-110 md:grid lg:-right-5 xl:-right-7"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>

                    {/* viewport */}
                    <div className="overflow-hidden px-1 py-2 md:px-2">
                        <div
                            className="flex transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                            style={{ transform: `translateX(-${safePage * 100}%)` }}
                        >
                            {Array.from({ length: pageCount }).map((_, pageIdx) => (
                                <div
                                    key={pageIdx}
                                    className="grid w-full shrink-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7"
                                >
                                    {TESTIMONIALS.slice(pageIdx * perView, pageIdx * perView + perView).map(
                                        (t, i) => (
                                            <TestimonialCard key={i} t={t} />
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* mobile arrows (below, inline) */}
                    <div className="mt-6 flex items-center justify-center gap-4 md:hidden">
                        <button
                            type="button"
                            onClick={() => go(-1)}
                            aria-label="Previous testimonials"
                            className="grid h-11 w-11 place-items-center rounded-full bg-[var(--navy,#081B3A)] text-white shadow-lg active:scale-95"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => go(1)}
                            aria-label="Next testimonials"
                            className="grid h-11 w-11 place-items-center rounded-full bg-[var(--navy,#081B3A)] text-white shadow-lg active:scale-95"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                </div>

                {/* ── Dots ── */}
                <div className="mt-8 flex items-center justify-center gap-2.5 sm:mt-10">
                    {Array.from({ length: pageCount }).map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setPage(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            aria-current={i === safePage}
                            className="h-2.5 rounded-full transition-all duration-300"
                            style={{
                                width: i === safePage ? "28px" : "10px",
                                background: i === safePage ? "var(--navy,#081B3A)" : "rgba(8,27,58,0.2)",
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}