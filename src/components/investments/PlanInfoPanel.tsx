"use client";

import { useState } from "react";
import Image from "next/image";
import {
    BarChart3, BookOpen, CalendarDays, ChevronDown, Clock, Download,
    FileText, Landmark, Layers, LockKeyhole, Maximize2,
    ScrollText, ShieldCheck, Wallet,
} from "lucide-react";
import type { InvestmentPlanInterface } from "@/interface/investmentPlan";
import {
    CATEGORY_CONFIG, HOW_IT_WORKS, PAYOUT_LABEL, RISK_CONFIG,
    fmt, fmtDuration, fmtFileSize, fmtROI, getFundDocuments,
} from "./planDetailConfig";

function StatChip({ label, value, className }: { label: string; value: string; className?: string }) {
    return (
        <div className={`rounded-xl p-4 ${className ?? "bg-[#F1F5F9]"}`}>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-current opacity-60">{label}</p>
            <p className="mt-1.5 text-[15px] font-bold text-current">{value}</p>
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="grid grid-cols-[22px_1fr_auto] items-center gap-3 py-3 text-[13px]">
            <span className="text-[#0B2E84]">{icon}</span>
            <span className="text-slate-600">{label}</span>
            <span className="font-semibold text-[#0F172A]">{value}</span>
        </div>
    );
}

export default function PlanInfoPanel({ plan }: { plan: InvestmentPlanInterface }) {
    const [leftTab, setLeftTab] = useState<"overview" | "how" | "details" | "documents" | "terms">("overview");
    const [termsOpen, setTermsOpen] = useState(false);

    const risk = RISK_CONFIG[plan.riskLevel] ?? RISK_CONFIG.medium;
    const category = CATEGORY_CONFIG[plan.category] ?? CATEGORY_CONFIG.lumpsum;
    const CategoryIcon = category.Icon;
    const steps = (HOW_IT_WORKS[plan.category] ?? HOW_IT_WORKS.lumpsum)(plan);
    const isMonthly = plan.category === "monthly";
    const documents = getFundDocuments(plan.slug);

    return (
        <div className="space-y-0">

            {/* Plan image */}
            <div className="overflow-hidden rounded-t-2xl border border-b-0 border-[#E2E8F0] bg-[#F1F5F9] shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
                {plan.photourl ? (
                    <div className="relative aspect-[4/3] w-full">
                        <Image src={plan.photourl} alt={plan.name} fill className="object-cover" priority />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 via-gray-100/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-navy backdrop-blur-md">
                                <CategoryIcon className="h-3 w-3" />{category.eyebrow}
                            </div>
                            <h1 className="mt-3 text-[24px] font-bold leading-tight drop-shadow-sm sm:text-[30px] text-navy">{plan.name}</h1>
                        </div>
                    </div>
                ) : (
                    <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-[#0B2E84] via-[#1a3fa8] to-[#1e40af]">
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
                            <CategoryIcon className="h-20 w-20 opacity-15" />
                            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur-md">
                                <CategoryIcon className="h-3 w-3" />{category.eyebrow}
                            </div>
                            <h1 className="mt-3 text-center text-[24px] font-bold leading-tight drop-shadow-sm sm:text-[30px]">{plan.name}</h1>
                        </div>
                    </div>
                )}
            </div>

            {/* Stat strip */}
            <div className="grid grid-cols-2 gap-px border-x border-[#E2E8F0] bg-[#E2E8F0] sm:grid-cols-4">
                <StatChip label="Expected Return" value={`${fmtROI(plan)} p.a.`} />
                <StatChip label="Minimum" value={fmt(plan.minAmount)} />
                <StatChip label="Risk" value={risk.label} className={risk.className} />
                <StatChip
                    label={isMonthly ? "Duration" : "Lock-in"}
                    value={isMonthly ? fmtDuration(plan.durationMinMonths, plan.durationMaxMonths) : `${plan.lockInMonths ?? 12} Months`}
                />
            </div>

            {/* Tab card */}
            <div className="rounded-b-2xl border border-t-0 border-[#E2E8F0] bg-white shadow-[0_8px_32px_rgba(15,23,42,0.07)]">
                <div className="flex border-b border-[#E2E8F0] px-2 pt-1">
                    {([
                        { key: "overview", label: "Overview", Icon: BookOpen },
                        { key: "how", label: "How It Works", Icon: Layers },
                        { key: "details", label: "Details", Icon: BarChart3 },
                        ...(documents.length
                            ? [{ key: "documents", label: "Documents", Icon: FileText } as const]
                            : []),
                        { key: "terms", label: "Terms", Icon: ScrollText },
                    ] as const).map(({ key, label, Icon }) => (
                        <button key={key} onClick={() => setLeftTab(key)}
                            className={`relative flex items-center gap-2 px-4 py-3.5 text-[12.5px] font-bold transition-colors focus:outline-none ${leftTab === key ? "text-[#0B2E84]" : "text-[#0F172A]/40 hover:text-[#0F172A]/65"}`}>
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">{label}</span>
                            {leftTab === key && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#0B2E84]" />}
                        </button>
                    ))}
                </div>

                <div className="p-6 sm:p-8">
                    {leftTab === "overview" && (
                        <div>
                            <h2 className="text-[17px] font-bold text-[#0B2E84]">About This Plan</h2>
                            <div className="mt-4">
                                {plan.description ? (
                                    <div className="rich-text-preview text-[13.5px] leading-7 text-slate-700" dangerouslySetInnerHTML={{ __html: plan.description }} />
                                ) : plan.shortDescription ? (
                                    <div className="rich-text-preview text-[13.5px] leading-7 text-slate-700" dangerouslySetInnerHTML={{ __html: plan.shortDescription }} />
                                ) : (
                                    <p className="text-sm italic text-slate-400">Description coming soon.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {leftTab === "how" && (
                        <div>
                            <h2 className="text-[17px] font-bold text-[#0B2E84]">How It Works</h2>
                            <p className="mt-1 text-[12.5px] text-slate-500">A simple 3-step process — no complicated paperwork.</p>
                            <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                {steps.map((s, i) => (
                                    <div key={s.title} className="rounded-xl bg-[#F8FAFC] p-5 ring-1 ring-[#E2E8F0]">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B2E84] text-[11px] font-bold text-white">{i + 1}</div>
                                        <s.icon className="mt-4 h-5 w-5 text-[#0B2E84]" />
                                        <h3 className="mt-3 text-[13px] font-bold text-[#0F172A]">{s.title}</h3>
                                        <p className="mt-1.5 text-[12px] leading-5 text-slate-600">{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {leftTab === "details" && (
                        <div>
                            <h2 className="text-[17px] font-bold text-[#0B2E84]">Plan Details</h2>
                            <div className="mt-4 divide-y divide-[#F1F5F9]">
                                <InfoRow icon={<CategoryIcon className="h-4 w-4" />} label="Plan Type" value={category.label} />
                                <InfoRow icon={<CalendarDays className="h-4 w-4" />} label={isMonthly ? "SIP Period" : "Investment Horizon"} value={fmtDuration(plan.durationMinMonths, plan.durationMaxMonths)} />
                                <InfoRow icon={<Wallet className="h-4 w-4" />} label="Base Currency" value={plan.currency ?? "USD"} />
                                <InfoRow icon={<Clock className="h-4 w-4" />} label="Payout" value={PAYOUT_LABEL[plan.payoutType] ?? "Per Terms"} />
                                <InfoRow icon={<LockKeyhole className="h-4 w-4" />} label="Lock-in Period" value={plan.lockInMonths ? `${plan.lockInMonths} Months` : "Flexible"} />
                                <InfoRow icon={<Landmark className="h-4 w-4" />} label="Fund Manager" value="Merlion Asset Management" />
                            </div>
                        </div>
                    )}

                    {leftTab === "documents" && (
                        <div>
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <h2 className="text-[17px] font-bold text-[#0B2E84]">Fund Documents</h2>
                                <span className="text-[11px] font-semibold text-slate-400">
                                    {documents.length} document{documents.length === 1 ? "" : "s"}
                                </span>
                            </div>
                            <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-6 text-slate-500">
                                Read the fact sheet before you invest - it states the contracted rate, every fee
                                that applies, and the risks you are accepting. Your plan agreement governs in the event
                                of any inconsistency.
                            </p>

                            <div className="mt-6 space-y-5">
                                {documents.map(doc => (
                                    <div
                                        key={doc.href}
                                        className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-[#C7D7FF] hover:shadow-[0_14px_40px_rgba(11,46,132,0.12)]"
                                    >
                                        <div className="flex flex-col sm:flex-row">

                                            {/* Document cover — the anchor the flat card was missing */}
                                            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0B2E84] via-[#14409f] to-[#0a2569] p-6 sm:w-[180px]">
                                                <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border border-white/10" />
                                                <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full border border-white/[0.07]" />

                                                <div className="relative flex h-full flex-row items-center gap-5 sm:flex-col sm:items-start sm:justify-between sm:gap-0">
                                                    {/* miniature fact sheet */}
                                                    <div className="flex h-[74px] w-[56px] shrink-0 flex-col gap-[5px] rounded-[5px] bg-white p-2 shadow-[0_8px_20px_rgba(0,0,0,0.3)] ring-1 ring-black/5 transition-transform duration-300 group-hover:-translate-y-1">
                                                        <div className="h-[9px] w-[18px] rounded-[2px] bg-[#0B2E84]" />
                                                        <div className="space-y-[3px]">
                                                            <div className="h-[2px] w-full rounded-full bg-slate-200" />
                                                            <div className="h-[2px] w-full rounded-full bg-slate-200" />
                                                            <div className="h-[2px] w-3/4 rounded-full bg-slate-200" />
                                                        </div>
                                                        <div className="mt-auto space-y-[3px]">
                                                            <div className="h-[2px] w-full rounded-full bg-slate-100" />
                                                            <div className="h-[2px] w-2/3 rounded-full bg-slate-100" />
                                                        </div>
                                                    </div>

                                                    <div className="sm:mt-5">
                                                        <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/45">
                                                            {doc.kind}
                                                        </p>
                                                        <p className="mt-1 text-[11px] font-semibold tabular-nums text-white/75">
                                                            PDF &middot; {doc.pages} pages
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1 p-6">
                                                <h3 className="text-[15px] font-bold leading-snug text-[#0F172A]">
                                                    {doc.title}
                                                </h3>

                                                <p className="mt-2.5 text-[12.75px] leading-6 text-slate-600">
                                                    {doc.description}
                                                </p>

                                                <dl className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-3 border-t border-[#F1F5F9] pt-4">
                                                    <div>
                                                        <dt className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">File size</dt>
                                                        <dd className="mt-1 text-[12px] font-semibold tabular-nums text-[#0F172A]">{fmtFileSize(doc.size)}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Last updated</dt>
                                                        <dd className="mt-1 text-[12px] font-semibold text-[#0F172A]">{doc.updated}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Issuer</dt>
                                                        <dd className="mt-1 text-[12px] font-semibold text-[#0F172A]">Merlion Asset Holdings</dd>
                                                    </div>
                                                </dl>

                                                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                                                    <a
                                                        href={doc.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 rounded-xl bg-[#0B2E84] px-4 py-2.5 text-[12.5px] font-bold text-white shadow-[0_6px_16px_rgba(11,46,132,0.24)] transition hover:bg-[#0a2569] hover:shadow-[0_8px_22px_rgba(11,46,132,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2E84] focus-visible:ring-offset-2"
                                                    >
                                                        <Maximize2 className="h-3.5 w-3.5" />
                                                        View document
                                                    </a>
                                                    <a
                                                        href={doc.href}
                                                        download
                                                        className="inline-flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-[12.5px] font-bold text-[#0F172A] transition hover:border-[#0B2E84] hover:bg-[#F8FAFC] hover:text-[#0B2E84] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2E84] focus-visible:ring-offset-2"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Issuer note */}
                                        <div className="flex items-start gap-2.5 border-t border-[#F1F5F9] bg-[#FAFBFD] px-6 py-3.5">
                                            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-[#0B2E84]/70" />
                                            <p className="text-[11px] leading-5 text-slate-500">
                                                For information only &mdash; not an offer to sell or a solicitation to buy
                                                any interest in the Fund. Past performance is not indicative of future
                                                results, and capital is at risk.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {leftTab === "terms" && (
                        <div>
                            <h2 className="text-[17px] font-bold text-[#0B2E84]">Terms & Conditions</h2>
                            <div className="mt-4">
                                {plan.termsAndConditions ? (
                                    <>
                                        <div
                                            className={`rich-text-preview text-[13px] leading-7 text-slate-700 overflow-hidden transition-all ${termsOpen ? "max-h-none" : "max-h-36"}`}
                                            style={!termsOpen ? { maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)" } : undefined}
                                            dangerouslySetInnerHTML={{ __html: plan.termsAndConditions }}
                                        />
                                        <button onClick={() => setTermsOpen(o => !o)}
                                            className="mt-4 flex items-center gap-1.5 text-[13px] font-bold text-[#0B2E84] hover:underline">
                                            {termsOpen ? "Show less" : "Read full terms"}
                                            <ChevronDown className={`h-4 w-4 transition-transform ${termsOpen ? "rotate-180" : ""}`} />
                                        </button>
                                    </>
                                ) : (
                                    <p className="flex items-center gap-2 text-[13px] text-slate-500">
                                        <FileText className="h-4 w-4 text-slate-400" />
                                        Terms will be shared during your investor review call.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
