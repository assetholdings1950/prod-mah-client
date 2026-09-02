// src/components/consultation/ConsultWithUsPageClient.tsx
"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import {
    Headphones, ShieldCheck, MapPin, Clock, MessageSquare,
    Lock, Send, ChevronDown, CheckCircle, AlertCircle,
    Building2, Layers, Zap, UserCheck, CalendarCheck, FileCheck2, Globe2
} from "lucide-react";
import appClient from "@/lib/appClient";
import { WORLD_COUNTRY_CODES } from "@/lib/countryCodes";
import EmailOtpVerificationField from "@/components/common/EmailOtpVerificationField";

import heroImage from "@/assets/hero_sections_visulas.png";

gsap.registerPlugin(ScrollTrigger, SplitText);

// R3F Browser particle canvas matching Contact Page
const HeroParticles = dynamic(() => import("../contact/HeroParticles"), { ssr: false });

/* ─────────────────── BRAND ───────────────────
   navy      #081B3A   (primary)
   navy-2    #102C5C
   accent    #2563EB
   accent-lt #60A5FA
   border    #dbe4ff
*/

const serif = { fontFamily: "var(--font-playfair)" };

/* ─────────────────── DATA ─────────────────── */

const advisoryCards = [
    {
        icon: Headphones,
        title: "Senior Wealth Advisory",
        desc: "Direct guidance on capital placement, yield optimization, and long-term portfolio structuring.",
    },
    {
        icon: Layers,
        title: "Portfolio Audit & Restructuring",
        desc: "Comprehensive risk profiling, liquidity analysis, and restructuring for optimal risk-adjusted returns.",
    },
    {
        icon: Building2,
        title: "HNWI & Corporate Advisory",
        desc: "Tailored wealth preservation and growth strategies designed for accredited and corporate investors.",
    },
    {
        icon: MapPin,
        title: "Singapore Advisory Hub",
        desc: "Serving high-net-worth investors globally through accredited and secure digital channels.",
        location: "Singapore Headquarters",
    },
];

const inquiryCategories = [
    "Funds & Investment Plans",
    "Portfolio Management & Audit",
    "General Investment Advisory",
    "Account & Onboarding Support",
    "Other General Inquiry",
];

const capitalRanges = [
    "$10,000 - $50,000",
    "$50,000 - $250,000",
    "$250,000 - $1,000,000",
    "$1,000,000+",
];

const riskProfiles = ["Conservative", "Balanced", "Growth", "Aggressive"];

const timeHorizons = [
    "Short Term (< 1 Year)",
    "Medium Term (1 - 3 Years)",
    "Long Term (3+ Years)",
];

const contactMethods = ["Email", "Phone", "WhatsApp", "Video Call"];

const timeSlots = [
    "Morning (09:00 AM - 12:00 PM EST)",
    "Afternoon (12:00 PM - 05:00 PM EST)",
    "Evening (05:00 PM - 08:00 PM EST)",
    "Flexible / Any Time",
];

const processSteps = [
    {
        icon: FileCheck2,
        step: "01",
        title: "Request Review",
        desc: "Your inquiry is reviewed discretely by our Senior Wealth Management desk in Singapore, and routed to the specialist team best aligned with your objectives.",
    },
    {
        icon: UserCheck,
        step: "02",
        title: "Dedicated Director Assigned",
        desc: "A dedicated Senior Wealth Director is personally assigned to your profile and reaches out via your preferred channel within 24 business hours.",
    },
    {
        icon: CalendarCheck,
        step: "03",
        title: "Private 1-on-1 Session",
        desc: "You receive a bespoke consultation covering asset allocation, portfolio structuring, and a tailored strategy roadmap — with no obligation to invest.",
    },
];

/* ─────────────────── SECTION LABEL ─────────────────── */

function SectionLabel({ text }: { text: string }) {
    return (
        <div className="section-label mb-4 flex items-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">{text}</span>
        </div>
    );
}

/* ─────────────────── FIELD LABEL ─────────────────── */

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
    return (
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#081B3A]/60">
            {text} {required && <span className="text-[#2563EB]">*</span>}
        </label>
    );
}

const inputClass =
    "h-12 w-full rounded-xl border border-[#dbe4ff] bg-[#fbfcff] px-4 text-sm text-[#081B3A] placeholder:text-[#081B3A]/35 focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 transition-all";

/* ─────────────────── MAIN PAGE ─────────────────── */

export default function ConsultWithUsPageClient() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [topic, setTopic] = useState(inquiryCategories[0]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [phoneNum, setPhoneNum] = useState("");
    const [investmentRange, setInvestmentRange] = useState(capitalRanges[1]);
    const [riskTolerance, setRiskTolerance] = useState("Balanced");
    const [investmentHorizon, setInvestmentHorizon] = useState(timeHorizons[1]);
    const [preferredContactMethod, setPreferredContactMethod] = useState("Email");
    const [preferredTime, setPreferredTime] = useState("Flexible / Any Time");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requestId, setRequestId] = useState("");
    const [submittedName, setSubmittedName] = useState("");
    const [submittedTopic, setSubmittedTopic] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState("");
    const [emailVerificationToken, setEmailVerificationToken] = useState("");

    const normalizedEmail = email.trim().toLowerCase();

    const resetEmailVerification = () => {
        setEmailVerified(false);
        setVerifiedEmail("");
        setEmailVerificationToken("");
    };

    const resetConsultationForm = () => {
        setSelectedCategory(null);
        setTopic(inquiryCategories[0]);
        setName("");
        setEmail("");
        setCountryCode("");
        setPhoneNum("");
        setInvestmentRange(capitalRanges[1]);
        setRiskTolerance("Balanced");
        setInvestmentHorizon(timeHorizons[1]);
        setPreferredContactMethod("Email");
        setPreferredTime("Flexible / Any Time");
        setMessage("");
        setError(null);
        resetEmailVerification();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!name.trim()) {
            setError("Please enter your full name.");
            setLoading(false);
            return;
        }
        if (!email.trim() || !email.includes("@")) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }
        if (!emailVerified || verifiedEmail !== normalizedEmail || !emailVerificationToken) {
            setError("Please verify your email address before scheduling a consultation.");
            setLoading(false);
            return;
        }
        if (!countryCode) {
            setError("Please select a country code.");
            setLoading(false);
            return;
        }
        if (!phoneNum.trim() || phoneNum.trim().length < 5) {
            setError("Please enter a valid phone number.");
            setLoading(false);
            return;
        }
        if (!message.trim()) {
            setError("Please share details about your inquiry.");
            setLoading(false);
            return;
        }

        const fullPhone = `${countryCode} ${phoneNum}`.trim();

        try {
            const payload = {
                name,
                email: normalizedEmail,
                emailVerificationToken,
                phone: fullPhone,
                preferredContactMethod,
                preferredTime,
                topic: topic || selectedCategory || inquiryCategories[0],
                investmentRange,
                riskTolerance,
                investmentHorizon,
                query: message,
            };

            const res = await appClient.post("/api/consultant", payload);

            if (res.data?.status) {
                setSubmittedName(name);
                setSubmittedTopic(topic);
                setSuccess(true);
                setRequestId(res.data.data?._id || "MAH-REQ-" + Math.floor(100000 + Math.random() * 900000));
                resetConsultationForm();
            } else {
                setError(res.data?.message || "Something went wrong. Please try again.");
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useGSAP(() => {
        // ── Hero entrance ──
        const heroSplit = new SplitText(".hero-heading", { type: "words" });

        gsap.timeline({ defaults: { ease: "power3.out" } })
            .from(".hero-label", { opacity: 0, y: 14, duration: 0.5 })
            .from(heroSplit.words, { opacity: 0, y: 28, filter: "blur(6px)", stagger: 0.07, duration: 0.6 }, "-=0.2")
            .from(".hero-copy", { opacity: 0, y: 16, duration: 0.55 }, "-=0.25")
            .from(".hero-divider", { scaleX: 0, transformOrigin: "left center", duration: 0.5 }, "-=0.5")
            .from(".hero-chip", { opacity: 0, y: 12, stagger: 0.08, duration: 0.45 }, "-=0.3");

        // Scroll reveals use fromTo + immediateRender:false so content is
        // visible by default — if a trigger ever misfires, cards simply
        // appear without animation instead of staying hidden.

        // ── Advisory info cards ──
        gsap.fromTo(".contact-card",
            { opacity: 0, y: 32 },
            {
                opacity: 1,
                y: 0,
                stagger: 0.12,
                duration: 0.6,
                ease: "power3.out",
                immediateRender: false,
                scrollTrigger: { trigger: ".contact-cards-row", start: "top 90%", once: true },
            });

        // ── Form panel ──
        gsap.fromTo(".form-panel",
            { opacity: 0, x: -28 },
            {
                opacity: 1,
                x: 0,
                duration: 0.7,
                ease: "power3.out",
                immediateRender: false,
                scrollTrigger: { trigger: ".form-panel", start: "top 90%", once: true },
            });

        // ── Sidebar cards ──
        gsap.fromTo(".sidebar-card",
            { opacity: 0, x: 28 },
            {
                opacity: 1,
                x: 0,
                stagger: 0.15,
                duration: 0.65,
                ease: "power3.out",
                immediateRender: false,
                scrollTrigger: { trigger: ".sidebar-stack", start: "top 90%", once: true },
            });

        // ── Process steps below form ──
        gsap.fromTo(".process-step",
            { opacity: 0, y: 28 },
            {
                opacity: 1,
                y: 0,
                stagger: 0.14,
                duration: 0.6,
                ease: "power3.out",
                immediateRender: false,
                scrollTrigger: { trigger: ".form-description", start: "top 90%", once: true },
            });

        // Recalculate trigger positions once layout settles (hero image load,
        // Lenis init) so below-fold sections can never stay stuck hidden.
        ScrollTrigger.refresh();
        gsap.delayedCall(0.8, () => ScrollTrigger.refresh());
    }, { scope: rootRef });

    return (
        <main ref={rootRef} className="bg-white text-[#081B3A] antialiased font-sans">

                {/* ══════════════════ HERO ══════════════════ */}
                <section className="relative min-h-[520px] sm:min-h-[600px] lg:min-h-[680px] overflow-hidden">
                    {/* Background photo */}
                    <div className="absolute inset-0">
                        <Image
                            src={heroImage}
                            alt="Merlion Asset Holdings office interior"
                            fill
                            priority
                            className="object-cover object-top"
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/35 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    </div>

                    {/* Ambient mist particles */}
                    <div className="absolute inset-0 z-[1]">
                        <HeroParticles />
                    </div>

                    {/* Hero copy */}
                    <div className="relative z-10 mx-auto flex min-h-[520px] sm:min-h-[600px] lg:min-h-[640px] max-w-7xl flex-col justify-center px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
                        <div className="max-w-2xl">
                            <p className="hero-label mb-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB] sm:gap-3 sm:text-[11px] sm:tracking-[0.24em]">
                                <span className="h-px w-6 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] sm:w-10" />
                                MERLION ASSET HOLDINGS • PRIVATE WEALTH
                            </p>

                            <h1
                                className="hero-heading text-4xl leading-[1.14] tracking-tight text-[#081B3A] sm:text-5xl lg:text-[3.6rem]"
                                style={serif}
                            >
                                Consult <em className="not-italic text-[#2563EB]">With Us</em>.
                            </h1>

                            <div className="hero-divider mt-6 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#081B3A] via-[#2563EB] to-[#60A5FA]" />

                            <p className="hero-copy mt-6 max-w-lg text-sm leading-relaxed text-[#081B3A]/65 sm:text-base">
                                Private, one-on-one consultations with our Senior Wealth Directors covering asset allocation, portfolio structuring, and risk management with private-bank discretion.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#081B3A]">
                                <div className="hero-chip flex items-center gap-2 rounded-full border border-[#dbe4ff] bg-white/85 px-4 py-2 shadow-[0_2px_12px_rgba(8,27,58,0.08)] backdrop-blur-md">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                    <span>Strict Confidentiality</span>
                                </div>
                                <div className="hero-chip flex items-center gap-2 rounded-full border border-[#dbe4ff] bg-white/85 px-4 py-2 shadow-[0_2px_12px_rgba(8,27,58,0.08)] backdrop-blur-md">
                                    <Zap className="h-4 w-4 text-[#2563EB]" />
                                    <span>Direct Advisor Support</span>
                                </div>
                                <div className="hero-chip flex items-center gap-2 rounded-full border border-[#dbe4ff] bg-white/85 px-4 py-2 shadow-[0_2px_12px_rgba(8,27,58,0.08)] backdrop-blur-md">
                                    <Clock className="h-4 w-4 text-[#2563EB]" />
                                    <span>&lt; 24h SLA Response</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════ ADVISORY INFO CARDS ══════════════════ */}
                <section className="relative bg-white py-12 sm:py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="contact-cards-row grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {advisoryCards.map(card => (
                                <div
                                    key={card.title}
                                    className="contact-card group relative overflow-hidden rounded-2xl border border-[#dbe4ff] bg-white p-6 shadow-[0_2px_16px_rgba(8,27,58,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/35 hover:shadow-[0_12px_36px_rgba(37,99,235,0.14)]"
                                >
                                    {/* accent hairline on hover */}
                                    <span className="absolute inset-x-0 top-0 h-[3px] scale-x-0 bg-gradient-to-r from-[#081B3A] via-[#2563EB] to-[#60A5FA] transition-transform duration-500 group-hover:scale-x-100" />

                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#081B3A] to-[#102C5C] shadow-[0_4px_14px_rgba(8,27,58,0.28)] ring-1 ring-[#2563EB]/25 transition-transform duration-300 group-hover:scale-105">
                                        <card.icon className="h-5 w-5 text-[#60A5FA]" />
                                    </div>
                                    <h3 className="mb-2 text-base font-bold text-[#081B3A]">{card.title}</h3>
                                    <p className="mb-4 text-xs leading-relaxed text-[#081B3A]/55">{card.desc}</p>

                                    {card.location && (
                                        <p className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                                            <Globe2 className="h-3.5 w-3.5" />
                                            {card.location}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════ FORM + SIDEBAR ══════════════════ */}
                <section className="dot-grid relative bg-[#f6f9ff] py-12 sm:py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">

                            {/* ── Form panel ── */}
                            <div className="form-panel relative overflow-hidden rounded-2xl border border-[#dbe4ff] bg-white p-5 shadow-[0_8px_40px_rgba(8,27,58,0.08)] sm:rounded-3xl sm:p-9">
                                {/* top brand hairline */}
                                <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#081B3A] via-[#2563EB] to-[#60A5FA]" />

                                <SectionLabel text="ADVISORY DESK" />
                                <h2 className="-mt-1 mb-2 text-2xl tracking-tight text-[#081B3A] sm:text-3xl" style={serif}>
                                    Schedule an Advisory Session
                                </h2>
                                <p className="mb-8 text-sm text-[#081B3A]/55">
                                    Fill in your details below and a Senior Wealth Specialist will get in touch within 24 hours.
                                </p>

                                {success ? (
                                    <div className="flex flex-col items-center justify-center gap-5 py-14 text-center">
                                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#b6dfc8] bg-[#e8f5ee]">
                                            <CheckCircle className="h-8 w-8 text-[#1e7a45]" />
                                        </div>
                                        <div className="max-w-sm">
                                            <p className="text-xl text-[#081B3A]" style={serif}>Consultation Request Submitted</p>
                                            <p className="mt-2 text-sm leading-relaxed text-[#081B3A]/55">
                                                Thank you, <strong className="text-[#081B3A]">{submittedName}</strong>. Our Senior Wealth Director has received your request regarding <strong className="text-[#2563EB]">{submittedTopic}</strong> and will reach out to you within 24 hours.
                                            </p>
                                        </div>
                                        <div className="mt-1 w-full max-w-xs rounded-xl border border-[#dbe4ff] bg-[#f6f9ff] px-4 py-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563EB]/70">Inquiry Reference</p>
                                            <p className="mt-1 font-mono text-sm font-bold text-[#102C5C]">{requestId}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSuccess(false);
                                                setRequestId("");
                                                setSubmittedName("");
                                                setSubmittedTopic("");
                                            }}
                                            className="mt-1 text-xs font-semibold text-[#2563EB] underline underline-offset-2 transition-colors hover:text-[#081B3A]"
                                        >
                                            Submit another request
                                        </button>
                                    </div>
                                ) : (
                                    <form className="space-y-5" onSubmit={handleSubmit}>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div>
                                                <FieldLabel text="Full Name" required />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Jonathan Tan"
                                                    required
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    className={inputClass}
                                                />
                                            </div>
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
                                                inputClassName={`${inputClass} pr-24`}
                                                labelClassName="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#081B3A]/60"
                                                requiredAccentClassName="text-[#2563EB]"
                                            />
                                        </div>

                                        {/* Phone with World Country Code Selector */}
                                        <div>
                                            <FieldLabel text="Phone Number" required />
                                            <div className="flex gap-2">
                                                <select
                                                    required
                                                    aria-label="Country code"
                                                    value={countryCode}
                                                    onChange={e => setCountryCode(e.target.value)}
                                                    className="h-12 w-24 cursor-pointer appearance-none rounded-xl border border-[#dbe4ff] bg-[#fbfcff] px-2 text-xs font-bold text-[#081B3A] transition-all focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 sm:w-32 sm:px-3"
                                                >
                                                    <option value="" disabled>Select</option>
                                                    {WORLD_COUNTRY_CODES.map((c) => (
                                                        <option key={c.code + c.country} value={c.code}>
                                                            {c.flag} {c.code}
                                                        </option>
                                                    ))}
                                                </select>

                                                <input
                                                    type="tel"
                                                    placeholder="Enter your phone number"
                                                    required
                                                    value={phoneNum}
                                                    onChange={e => setPhoneNum(e.target.value)}
                                                    className={`${inputClass} flex-1`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <FieldLabel text="Inquiry Topic" required />
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={topic}
                                                    onChange={e => setTopic(e.target.value)}
                                                    className={`${inputClass} cursor-pointer appearance-none pr-10`}
                                                >
                                                    {inquiryCategories.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#081B3A]/35" />
                                            </div>
                                        </div>

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div>
                                                <FieldLabel text="Target Capital Deployment" />
                                                <div className="relative">
                                                    <select
                                                        value={investmentRange}
                                                        onChange={e => setInvestmentRange(e.target.value)}
                                                        className={`${inputClass} cursor-pointer appearance-none pr-10`}
                                                    >
                                                        {capitalRanges.map(r => (
                                                            <option key={r} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#081B3A]/35" />
                                                </div>
                                            </div>
                                            <div>
                                                <FieldLabel text="Risk Profile Tolerance" />
                                                <div className="relative">
                                                    <select
                                                        value={riskTolerance}
                                                        onChange={e => setRiskTolerance(e.target.value)}
                                                        className={`${inputClass} cursor-pointer appearance-none pr-10`}
                                                    >
                                                        {riskProfiles.map(r => (
                                                            <option key={r} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#081B3A]/35" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div>
                                                <FieldLabel text="Investment Horizon" />
                                                <div className="relative">
                                                    <select
                                                        value={investmentHorizon}
                                                        onChange={e => setInvestmentHorizon(e.target.value)}
                                                        className={`${inputClass} cursor-pointer appearance-none pr-10`}
                                                    >
                                                        {timeHorizons.map(h => (
                                                            <option key={h} value={h}>{h}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#081B3A]/35" />
                                                </div>
                                            </div>
                                            <div>
                                                <FieldLabel text="Preferred Contact Method" />
                                                <div className="relative">
                                                    <select
                                                        value={preferredContactMethod}
                                                        onChange={e => setPreferredContactMethod(e.target.value)}
                                                        className={`${inputClass} cursor-pointer appearance-none pr-10`}
                                                    >
                                                        {contactMethods.map(m => (
                                                            <option key={m} value={m}>{m}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#081B3A]/35" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <FieldLabel text="Best Time to Reach You" />
                                            <div className="relative">
                                                <select
                                                    value={preferredTime}
                                                    onChange={e => setPreferredTime(e.target.value)}
                                                    className={`${inputClass} cursor-pointer appearance-none pr-10`}
                                                >
                                                    {timeSlots.map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#081B3A]/35" />
                                            </div>
                                        </div>

                                        <div>
                                            <FieldLabel text="Inquiry Message" required />
                                            <textarea
                                                rows={5}
                                                required
                                                placeholder="Share your questions, portfolio details, or investment objectives…"
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                                className="w-full resize-none rounded-xl border border-[#dbe4ff] bg-[#fbfcff] px-4 py-3 text-sm text-[#081B3A] transition-all placeholder:text-[#081B3A]/35 focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10"
                                            />
                                        </div>

                                        {error && (
                                            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                                                <p className="flex-1 text-xs leading-relaxed text-red-700">{error}</p>
                                                <button type="button" onClick={() => setError(null)} className="text-red-400 transition-colors hover:text-red-600">
                                                    <span className="sr-only">Dismiss</span>
                                                    <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading || !emailVerified}
                                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#081B3A] via-[#102C5C] to-[#081B3A] py-4 text-sm font-bold text-white shadow-[0_6px_20px_rgba(8,27,58,0.32)] transition-all hover:shadow-[0_10px_32px_rgba(37,99,235,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {loading ? "Submitting…" : "Schedule Consultation"}
                                            {!loading && <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                                        </button>

                                        {/* Assurance strip below submit */}
                                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-center text-[11px] font-medium text-[#081B3A]/45">
                                            <Lock className="h-3.5 w-3.5 flex-shrink-0 text-[#2563EB]/60" />
                                            <span>Encrypted submission · No obligation · Reviewed by a Senior Wealth Director</span>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* ── Sidebar ── */}
                            <div className="sidebar-stack space-y-5">
                                {/* Response time — dark premium card */}
                                <div className="sidebar-card relative flex gap-4 overflow-hidden rounded-2xl border border-[#102C5C] bg-gradient-to-br from-[#081B3A] to-[#102C5C] p-5 shadow-[0_8px_28px_rgba(8,27,58,0.3)]">
                                    <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#2563EB]/20 blur-2xl" />
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-[#60A5FA]/30">
                                        <Clock className="h-4.5 w-4.5 text-[#60A5FA]" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-sm font-bold text-white">Response Time</h3>
                                        <p className="text-xs leading-relaxed text-white/60">
                                            Our wealth advisory desk operates under a strict &lt;24-hour SLA response guarantee.
                                        </p>
                                    </div>
                                </div>

                                {/* Inquiry categories */}
                                <div className="sidebar-card rounded-2xl border border-[#dbe4ff] bg-white p-5 shadow-[0_2px_16px_rgba(8,27,58,0.05)]">
                                    <div className="mb-3 flex gap-4">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#eef2ff]">
                                            <MessageSquare className="h-4.5 w-4.5 text-[#2563EB]" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 text-sm font-bold text-[#081B3A]">Advisory Focus Scope</h3>
                                            <p className="text-xs leading-relaxed text-[#081B3A]/55">
                                                Select a topic below to route your request to the specialized wealth advisory desk.
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
                                                    setTopic(cat);
                                                }}
                                                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors ${selectedCategory === cat || topic === cat
                                                    ? "bg-[#eef2ff] text-[#102C5C]"
                                                    : "text-[#081B3A]/65 hover:bg-[#f6f9ff]"
                                                    }`}
                                            >
                                                <span
                                                    className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${selectedCategory === cat || topic === cat
                                                        ? "border-[#2563EB] bg-[#2563EB]"
                                                        : "border-[#081B3A]/25"
                                                        }`}
                                                >
                                                    {(selectedCategory === cat || topic === cat) && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                </span>
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Security notice */}
                                <div className="sidebar-card flex gap-4 rounded-2xl border border-[#dbe4ff] bg-white p-5 shadow-[0_2px_16px_rgba(8,27,58,0.05)]">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#eef2ff]">
                                        <Lock className="h-4.5 w-4.5 text-[#2563EB]" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-sm font-bold text-[#081B3A]">Confidentiality Notice</h3>
                                        <p className="text-xs leading-relaxed text-[#081B3A]/55">
                                            All advisory sessions and portfolio discussions are strictly confidential, protected by institutional NDA practices and encrypted channels.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ══════════ DESCRIPTION BELOW FORM ══════════ */}
                        <div className="form-description mt-10 sm:mt-14">
                            <div className="mx-auto max-w-2xl text-center">
                                <div className="mb-4 flex items-center justify-center gap-3">
                                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#2563EB]" />
                                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">What Happens Next</span>
                                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#2563EB]" />
                                </div>
                                <h2 className="text-2xl tracking-tight text-[#081B3A] sm:text-3xl" style={serif}>
                                    A Discreet, Structured Advisory Process
                                </h2>
                                <p className="mt-4 text-sm leading-relaxed text-[#081B3A]/60">
                                    Every consultation request is handled personally — never by an automated queue. From the moment you submit this form, your inquiry follows a private, three-step advisory process designed for high-net-worth individuals, family offices, and corporate investors.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {processSteps.map(step => (
                                    <div
                                        key={step.step}
                                        className="process-step group relative overflow-hidden rounded-2xl border border-[#dbe4ff] bg-white p-6 shadow-[0_2px_16px_rgba(8,27,58,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/35 hover:shadow-[0_12px_36px_rgba(37,99,235,0.12)]"
                                    >
                                        <span className="absolute right-5 top-4 text-4xl font-extrabold text-[#eef2ff] transition-colors group-hover:text-[#dbe4ff]" style={serif}>
                                            {step.step}
                                        </span>
                                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#081B3A] to-[#102C5C] shadow-[0_4px_14px_rgba(8,27,58,0.28)] ring-1 ring-[#2563EB]/25">
                                            <step.icon className="h-5 w-5 text-[#60A5FA]" />
                                        </div>
                                        <h3 className="mb-2 text-sm font-bold text-[#081B3A]">{step.title}</h3>
                                        <p className="text-xs leading-relaxed text-[#081B3A]/55">{step.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Commitment + compliance note */}
                            <div className="mt-8 rounded-2xl border border-[#dbe4ff] bg-white p-6 shadow-[0_2px_16px_rgba(8,27,58,0.05)] sm:p-7">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#e8f5ee] ring-1 ring-[#b6dfc8]">
                                        <ShieldCheck className="h-5 w-5 text-[#1e7a45]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#081B3A]">Institutional Advisory Commitment</h3>
                                        <p className="mt-2 text-xs leading-relaxed text-[#081B3A]/60">
                                            All consultation requests are reviewed discretely by our Senior Wealth Management team in Singapore. Your information is transmitted over encrypted channels, protected under institutional confidentiality standards, and never shared with third parties or used for unsolicited marketing. Consultations are complimentary and carry no obligation to invest.
                                        </p>
                                        <p className="mt-3 border-t border-[#eef2ff] pt-3 text-[11px] leading-relaxed text-[#081B3A]/40">
                                            Advisory sessions are informational in nature and tailored to your stated objectives. Investment products involve risk, and past performance is not indicative of future results. Please review all fund documentation before making investment decisions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

        </main>
    );
}
