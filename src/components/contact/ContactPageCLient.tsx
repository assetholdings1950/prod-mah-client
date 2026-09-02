// src/components/contact/ContactPageClient.tsx
"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import {
    Headphones, Mail, ShieldCheck, MapPin, Clock, MessageSquare,
    Lock, Send, ArrowRight, ChevronDown, CheckCircle, AlertCircle,
} from "lucide-react";
import appClient from "@/lib/appClient";
import EmailOtpVerificationField from "@/components/common/EmailOtpVerificationField";
import { WORLD_COUNTRY_CODES } from "@/lib/countryCodes";

import heroImage from "@/assets/contact/hero_image.png";
import ctaImage from "@/assets/contact/hero_image.png";

gsap.registerPlugin(ScrollTrigger, SplitText);

// R3F needs the browser — never server-render the canvas (skill's
// non-negotiable fix #2).
const HeroParticles = dynamic(() => import("./HeroParticles"), { ssr: false });

/* ─────────────────── DATA ─────────────────── */

const contactCards = [
    {
        icon: Headphones,
        title: "Investor Support",
        desc: "Get assistance with account access, deposits, withdrawals, and platform-related inquiries.",
        contact: "support@merlionassetholdings.com",
    },
    {
        icon: Mail,
        title: "General Inquiries",
        desc: "For partnerships, media requests, and corporate information.",
        contact: "info@merlionassetholdings.com",
    },
    {
        icon: ShieldCheck,
        title: "Compliance & Verification",
        desc: "Questions related to identity verification, documentation, or regulatory requirements.",
        contact: "compliance@merlionassetholdings.com",
    },
    {
        icon: MapPin,
        title: "Office Location",
        desc: "Serving investors globally through secure digital channels.",
        contact: null,
        location: "Singapore",
    },
];

const inquiryCategories = [
    "Investment Plans",
    "Account Verification",
    "Deposits & Withdrawals",
    "Technical Support",
    "Partnerships",
    "Compliance",
    "Other",
];


/* ─────────────────── SECTION LABEL ─────────────────── */

function SectionLabel({ text }: { text: string }) {
    return (
        <div className="section-label mb-4 flex items-center gap-3">
            <div className="h-px w-8 bg-[#1a3a6e]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a3a6e]">{text}</span>
        </div>
    );
}

/* ─────────────────── MAIN PAGE ─────────────────── */

export default function ContactPageClient() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [subject, setSubject] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [phone, setPhone] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState("");
    const [emailVerificationToken, setEmailVerificationToken] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizedEmail = email.trim().toLowerCase();
    const resetEmailVerification = () => {
        setEmailVerified(false);
        setVerifiedEmail("");
        setEmailVerificationToken("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!emailVerified || verifiedEmail !== normalizedEmail || !emailVerificationToken) {
            setError("Please verify your email address before submitting your inquiry.");
            return;
        }
        setLoading(true);
        const phoneDigits = phone.replace(/\D/g, "");
        if (!countryCode) {
            setError("Please select a country code.");
            setLoading(false);
            return;
        }
        if (!/^\d{6,15}$/.test(phoneDigits)) {
            setError("Please enter a phone number containing 6 to 15 digits.");
            setLoading(false);
            return;
        }
        try {
            await appClient.post("/api/contact", {
                name,
                email: normalizedEmail,
                phone: `${countryCode} ${phoneDigits}`,
                subject,
                message,
                emailVerificationToken,
            });
            setSuccess(true);
            setName(""); setEmail(""); setCountryCode(""); setPhone(""); setSubject(""); setMessage(""); setSelectedCategory(null);
            resetEmailVerification();
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { message?: string } } };
            const msg = apiError.response?.data?.message || (err instanceof Error ? err.message : "Something went wrong. Please try again.");
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useGSAP(() => {
        // ── Hero entrance (plays once on mount, no scroll trigger) ──
        const heroSplit = new SplitText(".hero-heading", { type: "words" });

        gsap.timeline({ defaults: { ease: "power3.out" } })
            .from(".hero-label", { opacity: 0, y: 14, duration: 0.5 })
            .from(heroSplit.words, { opacity: 0, y: 28, filter: "blur(6px)", stagger: 0.07, duration: 0.6 }, "-=0.2")
            .from(".hero-copy", { opacity: 0, y: 16, duration: 0.55 }, "-=0.25")
            .from(".hero-divider", { scaleX: 0, transformOrigin: "left center", duration: 0.5 }, "-=0.5");

        // ── Contact info cards — stagger on scroll ──
        gsap.from(".contact-card", {
            opacity: 0,
            y: 32,
            filter: "blur(4px)",
            stagger: 0.12,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: ".contact-cards-row", start: "top 85%" },
        });

        // ── Form panel ──
        gsap.from(".form-panel", {
            opacity: 0,
            x: -28,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: ".form-panel", start: "top 85%" },
        });

        // ── Sidebar cards — stagger from the right ──
        gsap.from(".sidebar-card", {
            opacity: 0,
            x: 28,
            stagger: 0.15,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: { trigger: ".sidebar-stack", start: "top 85%" },
        });

        // ── CTA banner ──
        const ctaSplit = new SplitText(".cta-heading", { type: "words" });
        gsap.timeline({
            scrollTrigger: { trigger: ".cta-banner", start: "top 80%" },
            defaults: { ease: "power3.out" },
        })
            .from(ctaSplit.words, { opacity: 0, y: 24, stagger: 0.06, duration: 0.55 })
            .from(".cta-copy", { opacity: 0, y: 14, duration: 0.5 }, "-=0.25")
            .from(".cta-buttons", { opacity: 0, y: 14, duration: 0.5 }, "-=0.3");

        // ── Section labels fade in everywhere as they enter ──
        gsap.utils.toArray<HTMLElement>(".section-label").forEach(el => {
            gsap.from(el, {
                opacity: 0,
                x: -16,
                duration: 0.45,
                ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 88%" },
            });
        });

        // Recalculate trigger positions after fonts/images settle
        ScrollTrigger.refresh();
    }, { scope: rootRef });

    return (
            <main ref={rootRef} className="bg-white text-[#0a1f44] antialiased font-sans">

                {/* ══════════════════ HERO ══════════════════ */}
                <section className="relative min-h-[640px] overflow-hidden">
                    {/* Background photo */}
                    <div className="absolute inset-0">
                        <Image
                            src={heroImage}
                            alt="Merlion fountain and Singapore skyline"
                            fill
                            priority
                            className="object-cover object-center"
                            sizes="100vw"
                        />
                        {/* Soft left-side scrim so navy text reads cleanly on the sky */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/55 via-white/15 to-transparent" />
                    </div>

                    {/* Ambient mist particles (R3F, client-only) */}
                    <div className="absolute inset-0 z-[1]">
                        <HeroParticles />
                    </div>



                    {/* Hero copy */}
                    <div className="relative z-10 mx-auto flex min-h-[640px] max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
                        <div className="max-w-xl">
                            <p className="hero-label mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a3a6e]">
                                <span className="h-px w-8 bg-[#1a3a6e]" />
                                Contact Merlion Asset Holdings
                            </p>

                            <h1 className="hero-heading text-4xl font-extrabold leading-[1.12] tracking-tight text-[#0a1f44] sm:text-5xl lg:text-[3.4rem]">
                                Speak With Our Investment Team.
                            </h1>

                            <div className="hero-divider mt-5 h-[3px] w-14 bg-[#1a3a6e]" />

                            <p className="hero-copy mt-5 max-w-md text-sm leading-relaxed text-[#0a1f44]/65 sm:text-base">
                                Whether you have questions about our investment solutions, account
                                setup, or fund details, our team is available to provide timely and
                                professional assistance.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════ CONTACT INFO CARDS ══════════════════ */}
                <section className="bg-white py-14">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="contact-cards-row grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {contactCards.map(card => (
                                <div
                                    key={card.title}
                                    className="contact-card rounded-2xl border border-[#dce6f5] bg-white p-6 shadow-[0_2px_16px_rgba(10,31,68,0.05)]"
                                >
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#0a1f44]">
                                        <card.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="mb-2 text-base font-bold text-[#0a1f44]">{card.title}</h3>
                                    <p className="mb-4 text-xs leading-relaxed text-[#0a1f44]/55">{card.desc}</p>

                                    {card.contact && (
                                        <a
                                            href={`mailto:${card.contact}`}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3a6e] hover:underline"
                                        >
                                            <Mail className="h-3.5 w-3.5" />
                                            {card.contact}
                                        </a>
                                    )}
                                    {card.location && (
                                        <p className="text-xs font-bold text-[#0a1f44]">{card.location}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════ FORM + SIDEBAR ══════════════════ */}
                <section className="bg-[#f8fafd] py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">

                            {/* ── Form panel ── */}
                            <div className="form-panel rounded-2xl border border-[#dce6f5] bg-white p-6 shadow-[0_4px_24px_rgba(10,31,68,0.06)] sm:p-8">
                                <SectionLabel text="" />
                                <h2 className="-mt-2 mb-1 text-2xl font-extrabold tracking-tight text-[#0a1f44]">
                                    Send Us a Message
                                </h2>
                                <p className="mb-7 text-sm text-[#0a1f44]/55">
                                    Complete the form below and a member of our team will respond as soon as possible.
                                </p>

                                {success ? (
                                    <div className="flex flex-col items-center justify-center gap-5 py-14 text-center">
                                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5ee] border border-[#b6dfc8]">
                                            <CheckCircle className="h-8 w-8 text-[#1e7a45]" />
                                            <span className="absolute inset-0 rounded-full animate-ping bg-[#b6dfc8]/40" style={{ animationIterationCount: 1 }} />
                                        </div>
                                        <div className="max-w-sm">
                                            <p className="text-lg font-extrabold text-[#0a1f44]">Inquiry Submitted</p>
                                            <p className="mt-2 text-sm leading-relaxed text-[#0a1f44]/55">
                                                Thank you for reaching out. Our team will respond within <span className="font-semibold text-[#0a1f44]/80">24 business hours</span>. A confirmation has been sent to your email.
                                            </p>
                                        </div>
                                        <div className="mt-1 w-full max-w-xs rounded-xl border border-[#dce6f5] bg-[#f4f7fc] px-4 py-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1a3a6e]/60">What happens next?</p>
                                            <ul className="mt-2 space-y-1 text-left text-xs text-[#0a1f44]/55">
                                                <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#1e7a45]" />Confirmation sent to your inbox</li>
                                                <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#1e7a45]" />Team reviews your inquiry</li>
                                                <li className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#1e7a45]" />Personal response within 24 hrs</li>
                                            </ul>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSuccess(false)}
                                            className="mt-1 text-xs font-semibold text-[#1a3a6e] underline underline-offset-2 hover:text-[#0a1f44] transition-colors"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                required
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="h-12 w-full rounded-xl border border-[#dce6f5] bg-white px-4 text-sm text-[#0a1f44] placeholder:text-[#0a1f44]/35 focus:border-[#1a3a6e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/10 transition-all"
                                            />
                                            <EmailOtpVerificationField
                                                email={email}
                                                onEmailChange={setEmail}
                                                isVerified={emailVerified && verifiedEmail === normalizedEmail}
                                                onVerified={({ email: confirmedEmail, verificationToken }) => {
                                                    setVerifiedEmail(confirmedEmail);
                                                    setEmailVerificationToken(verificationToken);
                                                    setEmailVerified(true);
                                                }}
                                                onVerificationReset={resetEmailVerification}
                                                onError={message => setError(message || null)}
                                                inputClassName="h-12 w-full rounded-xl border border-[#dce6f5] bg-white px-4 pr-24 text-sm text-[#0a1f44] placeholder:text-[#0a1f44]/35 focus:border-[#1a3a6e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/10 transition-all"
                                                labelClassName="sr-only"
                                                requiredAccentClassName="text-[#1a3a6e]"
                                                placeholder="Email Address"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <select
                                                required
                                                aria-label="Country code"
                                                value={countryCode}
                                                onChange={e => setCountryCode(e.target.value)}
                                                className="h-12 w-24 cursor-pointer appearance-none rounded-xl border border-[#dce6f5] bg-white px-2 text-xs font-bold text-[#0a1f44] transition-all focus:border-[#1a3a6e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/10 sm:w-32 sm:px-3"
                                            >
                                                <option value="" disabled>Select</option>
                                                {WORLD_COUNTRY_CODES.map(country => (
                                                    <option key={country.code + country.country} value={country.code}>
                                                        {country.flag} {country.code}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                required
                                                placeholder="Enter your phone number"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
                                                minLength={6}
                                                maxLength={15}
                                                pattern="[0-9]{6,15}"
                                                title="Enter a phone number containing 6 to 15 digits."
                                                className="h-12 min-w-0 flex-1 rounded-xl border border-[#dce6f5] bg-white px-4 text-sm text-[#0a1f44] placeholder:text-[#0a1f44]/35 focus:border-[#1a3a6e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/10 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-[#0a1f44]/60">Subject</label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={subject}
                                                    onChange={e => setSubject(e.target.value)}
                                                    className="h-12 w-full appearance-none rounded-xl border border-[#dce6f5] bg-white px-4 pr-10 text-sm text-[#0a1f44] focus:border-[#1a3a6e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/10 transition-all"
                                                >
                                                    <option value="">Select a subject</option>
                                                    {inquiryCategories.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a1f44]/35" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-[#0a1f44]/60">Message</label>
                                            <textarea
                                                rows={5}
                                                required
                                                placeholder="Type your message here…"
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                                className="w-full resize-none rounded-xl border border-[#dce6f5] bg-white px-4 py-3 text-sm text-[#0a1f44] placeholder:text-[#0a1f44]/35 focus:border-[#1a3a6e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/10 transition-all"
                                            />
                                        </div>

                                        {error && (
                                            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                                                <p className="flex-1 text-xs leading-relaxed text-red-700">{error}</p>
                                                <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
                                                    <span className="sr-only">Dismiss</span>
                                                    <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading || !emailVerified || verifiedEmail !== normalizedEmail}
                                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a1f44] py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(10,31,68,0.3)] transition-shadow hover:shadow-[0_8px_28px_rgba(10,31,68,0.45)] disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {loading ? "Submitting…" : "Submit Inquiry"}
                                            {!loading && <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* ── Sidebar ── */}
                            <div className="sidebar-stack space-y-5">
                                {/* Response time */}
                                <div className="sidebar-card flex gap-4 rounded-2xl border border-[#dce6f5] bg-[#eef4fc] p-5">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
                                        <Clock className="h-4.5 w-4.5 text-[#1a3a6e]" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-sm font-bold text-[#0a1f44]">Response Time</h3>
                                        <p className="text-xs leading-relaxed text-[#0a1f44]/55">
                                            Our team aims to respond to all inquiries within 24 business hours.
                                        </p>
                                    </div>
                                </div>

                                {/* Inquiry categories */}
                                <div className="sidebar-card rounded-2xl border border-[#dce6f5] bg-[#eef4fc] p-5">
                                    <div className="mb-3 flex gap-4">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
                                            <MessageSquare className="h-4.5 w-4.5 text-[#1a3a6e]" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 text-sm font-bold text-[#0a1f44]">Inquiry Categories</h3>
                                            <p className="text-xs leading-relaxed text-[#0a1f44]/55">
                                                Select a category that best describes your inquiry to help us route your message to the right team.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pl-1">
                                        {inquiryCategories.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCategory(cat);
                                                    setSubject(cat);
                                                }}
                                                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-[#0a1f44]/65 transition-colors hover:bg-white/70"
                                            >
                                                <span
                                                    className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${selectedCategory === cat
                                                        ? "border-[#1a3a6e] bg-[#1a3a6e]"
                                                        : "border-[#0a1f44]/25"
                                                        }`}
                                                >
                                                    {selectedCategory === cat && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                </span>
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Security notice */}
                                <div className="sidebar-card flex gap-4 rounded-2xl border border-[#dce6f5] bg-[#eef4fc] p-5">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
                                        <Lock className="h-4.5 w-4.5 text-[#1a3a6e]" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-sm font-bold text-[#0a1f44]">Security Notice</h3>
                                        <p className="text-xs leading-relaxed text-[#0a1f44]/55">
                                            For your security, Merlion Asset Holdings will never request
                                            passwords, one-time verification codes, or private wallet keys
                                            through email or support channels.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════ CTA BANNER ══════════════════ */}
                <section className="cta-banner relative overflow-hidden bg-[#0a1f44] py-16">
                    <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
                        <Image
                            src={ctaImage}
                            alt="Merlion Asset Holdings office interior"
                            fill
                            className="object-cover object-center opacity-60"
                            sizes="50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f44] via-[#0a1f44]/40 to-transparent" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="max-w-lg">
                            <p className="cta-heading text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                                Your investment journey starts with a conversation.
                            </p>
                            <div className="mt-4 h-[3px] w-14 bg-[#90b8e8]" />
                            <p className="cta-copy mt-5 text-sm leading-relaxed text-white/65">
                                Connect with our team to explore investment opportunities designed for long-term growth.
                            </p>

                            <div className="cta-buttons mt-7 flex flex-wrap gap-3">
                                <Link
                                    href="/investments"
                                    className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0a1f44] shadow-lg transition-transform hover:scale-[1.02]"
                                >
                                    Explore Investment Plans
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    href="/support"
                                    className="group flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                                >
                                    Contact Support
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════ RISK DISCLOSURE ══════════════════ */}
                <div className="border-t border-[#dce6f5] bg-[#f4f7fc] px-4 py-4 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1a3a6e]/50" />
                        <p className="text-[11px] leading-relaxed text-[#0a1f44]/45">
                            <span className="font-bold">Risk Disclosure:</span> Investments involve risk, including the potential loss of principal.
                            Past performance does not guarantee future results.
                        </p>
                    </div>
                </div>
            </main>
    );
}
