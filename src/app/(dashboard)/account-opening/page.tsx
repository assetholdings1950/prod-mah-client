"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    BadgeCheck, BriefcaseBusiness, Check, CheckCircle2, ChevronDown, ChevronRight, CircleAlert,
    Download, Eraser, FileCheck2, FileSignature, Landmark, Loader2, MapPin, PenLine,
    RefreshCw, ShieldCheck, UserRound,
} from "lucide-react";
import { toast } from "sonner";
import appClient from "@/lib/appClient";
import { SearchableSelect } from "@/components/UI/SearchableSelect";
import { useAuthStore, type AuthUser } from "@/store/authStore";
import {
    ACCOUNT_OPENING_VERSION, fetchAccountOpeningRecord, getMissingProfileRequirements,
    type AccountOpeningRecord,
} from "@/lib/accountOpening";

type DeclarationForm = AccountOpeningRecord["declaration"];
type CountryData = { name: string; code: string; dialCode: string; cities: string[] };

const EMPTY_DECLARATION: DeclarationForm = {
    employmentStatus: "", occupation: "", employerName: "", annualIncome: "",
    sourceOfFunds: "", estimatedNetWorth: "", investmentObjective: "",
    investmentExperience: "", taxResidency: "", taxIdentificationNumber: "",
    politicallyExposed: "", usPerson: "", beneficialOwner: "",
};

const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-[#CBD8EA] bg-white px-3.5 text-[13px] font-medium text-[#0F2748] outline-none transition placeholder:text-slate-300 focus:border-[#1D4ED8] focus:ring-4 focus:ring-[#1D4ED8]/10";
const selectOptions = (...labels: string[]): SelectOption[] => labels.map((label) => ({ value: label, label }));
const YES_NO_OPTIONS: SelectOption[] = [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }];

function Field({ label, required = true, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return <div className="block"><span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5B7193]">{label}{required && <span className="ml-1 text-rose-500">*</span>}</span>{children}</div>;
}

type SelectOption = { value: string; label: string };

function CustomSelect({ value, placeholder, options, onChange }: { value: string; placeholder: string; options: SelectOption[]; onChange: (value: string) => void }) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const selectedIndex = options.findIndex((option) => option.value === value);
    const [highlighted, setHighlighted] = useState(Math.max(0, selectedIndex));

    useEffect(() => {
        const close = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", close);
        return () => document.removeEventListener("pointerdown", close);
    }, []);

    useEffect(() => {
        if (open) setHighlighted(Math.max(0, selectedIndex));
    }, [open, selectedIndex]);

    const choose = (option: SelectOption) => {
        onChange(option.value);
        setOpen(false);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Escape") { setOpen(false); return; }
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (open) choose(options[highlighted]); else setOpen(true);
            return;
        }
        if (["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            if (!open) { setOpen(true); return; }
            setHighlighted((current) => event.key === "ArrowDown" ? (current + 1) % options.length : (current - 1 + options.length) % options.length);
        }
    };

    const selected = options[selectedIndex];
    return (
        <div ref={rootRef} className="relative mt-1.5">
            <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} onKeyDown={onKeyDown} className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 text-left text-[13px] font-medium outline-none transition ${open ? "border-[#1D4ED8] ring-4 ring-[#1D4ED8]/10" : "border-[#CBD8EA] hover:border-[#9EB2CF]"}`}>
                <span className={selected ? "truncate text-[#0F2748]" : "truncate text-slate-300"}>{selected?.label ?? placeholder}</span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${open ? "bg-[#EAF1FF] text-[#1D4ED8]" : "bg-[#F4F7FB] text-[#6B83A8]"}`}><ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} /></span>
            </button>
            {open && (
                <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-64 overflow-y-auto rounded-2xl border border-[#D8E2F0] bg-white p-1.5 shadow-[0_20px_50px_rgba(15,39,72,0.18)]">
                    {options.map((option, index) => {
                        const active = option.value === value;
                        return <button key={option.value} type="button" role="option" aria-selected={active} onMouseEnter={() => setHighlighted(index)} onClick={() => choose(option)} className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${highlighted === index ? "bg-[#EEF4FF] text-[#1746A2]" : "text-[#38506F] hover:bg-[#F5F8FC]"}`}><span>{option.label}</span>{active && <Check className="h-4 w-4 shrink-0 text-[#1D4ED8]" />}</button>;
                    })}
                </div>
            )}
        </div>
    );
}

function ReadOnlyItem({ label, value }: { label: string; value?: string | null }) {
    return <div className="rounded-xl border border-[#E3EAF4] bg-[#F8FAFD] px-3.5 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7D90AC]">{label}</p><p className="mt-1 truncate text-[13px] font-semibold text-[#0F2748]">{value || "—"}</p></div>;
}

function SectionCard({ icon, eyebrow, title, children }: { icon: React.ReactNode; eyebrow: string; title: string; children: React.ReactNode }) {
    return (
        <section className="relative rounded-[22px] border border-[#DCE5F2] bg-white shadow-[0_18px_50px_rgba(15,39,72,0.06)]">
            <div className="flex items-center gap-3 border-b border-[#E8EEF6] px-5 py-4 sm:px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#1D4ED8]">{icon}</div>
                <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6B83A8]">{eyebrow}</p><h2 className="mt-0.5 text-[17px] font-bold text-[#0F2748]">{title}</h2></div>
            </div>
            <div className="p-5 sm:p-6">{children}</div>
        </section>
    );
}

function SignaturePad({ onChange }: { onChange: (value: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const lastPoint = useRef({ x: 0, y: 0 });
    const [hasSignature, setHasSignature] = useState(false);

    const prepareCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(rect.width * ratio));
        canvas.height = Math.max(1, Math.round(rect.height * ratio));
        const context = canvas.getContext("2d");
        if (!context) return;
        context.scale(ratio, ratio);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = 2.1;
        context.strokeStyle = "#0F2748";
    }, []);

    useEffect(() => {
        prepareCanvas();
        window.addEventListener("resize", prepareCanvas);
        return () => window.removeEventListener("resize", prepareCanvas);
    }, [prepareCanvas]);

    const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
        drawing.current = true;
        lastPoint.current = point(event);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawing.current) return;
        const next = point(event);
        const context = event.currentTarget.getContext("2d");
        if (!context) return;
        context.beginPath();
        context.moveTo(lastPoint.current.x, lastPoint.current.y);
        context.lineTo(next.x, next.y);
        context.stroke();
        lastPoint.current = next;
        if (!hasSignature) setHasSignature(true);
    };

    const finish = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawing.current) return;
        drawing.current = false;
        onChange(event.currentTarget.toDataURL("image/png"));
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        onChange("");
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-[#CBD8EA] bg-[#FBFCFE]">
            <div className="flex items-center justify-between border-b border-[#E3EAF4] px-4 py-2.5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#5B7193]"><PenLine className="h-3.5 w-3.5" /> Draw signature</div>
                <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#5B7193] hover:bg-[#EEF3FA] hover:text-[#0F2748]"><Eraser className="h-3.5 w-3.5" /> Clear</button>
            </div>
            <div className="relative">
                <canvas ref={canvasRef} onPointerDown={start} onPointerMove={draw} onPointerUp={finish} onPointerCancel={finish} className="block h-40 w-full touch-none cursor-crosshair" aria-label="Signature pad" />
                {!hasSignature && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><p className="text-sm font-medium text-slate-300">Sign inside this box</p></div>}
                <div className="pointer-events-none absolute inset-x-8 bottom-9 border-b border-dashed border-[#C9D5E6]" />
            </div>
        </div>
    );
}

export default function AccountOpeningPage() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<DeclarationForm>(EMPTY_DECLARATION);
    const [legalName, setLegalName] = useState("");
    const [signature, setSignature] = useState("");
    const [truthConfirmed, setTruthConfirmed] = useState(false);
    const [termsConfirmed, setTermsConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [record, setRecord] = useState<AccountOpeningRecord | null>(null);
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [countriesLoading, setCountriesLoading] = useState(true);

    const refreshStatus = useCallback(async (notify = true) => {
        setRefreshing(true);
        try {
            const latest = await fetchAccountOpeningRecord();
            setRecord(latest);
            if (notify) toast.success("Account form status refreshed.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not refresh account form status.");
        } finally { setRefreshing(false); }
    }, []);

    useEffect(() => {
        if (!user?._id) return;
        const load = async () => {
            try {
                const response = await appClient.get(`/api/clients/${user._id}`);
                const remote = response.data?.profile?.data ?? response.data?.data ?? response.data;
                setProfile({ ...user, ...remote });
            } catch {
                setProfile(user);
            } finally { await refreshStatus(false); setLoading(false); }
        };
        void load();
    }, [user, refreshStatus]);

    useEffect(() => {
        let active = true;
        setCountriesLoading(true);
        appClient.get("/api/countries")
            .then((response) => {
                const data: CountryData[] = response.data?.data ?? response.data ?? [];
                if (active) setCountries(Array.isArray(data) ? data : []);
            })
            .catch(() => { if (active) setCountries([]); })
            .finally(() => { if (active) setCountriesLoading(false); });
        return () => { active = false; };
    }, []);

    const missing = useMemo(() => getMissingProfileRequirements(profile), [profile]);
    const expectedName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() || profile?.fullName?.trim() || "";
    const update = (key: keyof DeclarationForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
    const requiredFormComplete = Object.entries(form).every(([key, value]) => key === "employerName" || value.trim().length > 0);
    const signatureNameMatches = Boolean(expectedName) && legalName.trim().toLocaleLowerCase() === expectedName.toLocaleLowerCase();
    const canSubmit = requiredFormComplete && signatureNameMatches && Boolean(signature) && truthConfirmed && termsConfirmed && !submitting;

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user?._id || !canSubmit) {
            toast.error("Complete every required field, declaration and signature before submitting.");
            return;
        }
        setSubmitting(true);
        const submission = {
            version: ACCOUNT_OPENING_VERSION,
            legalName: legalName.trim(),
            signatureDataUrl: signature,
            declaration: form,
        };
        console.log("[Account Opening Form] Submitted declaration:", submission);
        try {
            const response = await appClient.post("/api/account-forms", submission);
            setRecord(response.data?.data ?? null);
            toast.success("Form submitted. Administrator approval is now pending.");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message ?? "Could not submit the account opening form.");
        } finally { setSubmitting(false); }
    };

    const downloadPdf = async () => {
        setDownloading(true);
        try {
            const response = await appClient.get("/api/account-forms/pdf", { responseType: "blob" });
            const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `account-opening-${profile?.clientId || "application"}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
            toast.success("Approved application downloaded.");
        } catch (error: unknown) {
            const err = error as { response?: { data?: Blob } };
            let message = "Could not download the approved application.";
            if (err.response?.data instanceof Blob) {
                try { message = JSON.parse(await err.response.data.text())?.message ?? message; } catch { /* keep fallback */ }
            }
            toast.error(message);
        } finally { setDownloading(false); }
    };

    if (loading) return <div className="flex min-h-full items-center justify-center bg-[#F4F7FB]"><div className="flex items-center gap-3 text-sm font-semibold text-[#5B7193]"><Loader2 className="h-5 w-5 animate-spin text-[#1D4ED8]" /> Loading account details…</div></div>;

    if (record && record.status !== "rejected") {
        const approved = record.status === "approved";
        return (
            <div className="min-h-full bg-[#F4F7FB] px-4 py-8 sm:px-6 lg:px-8">
                <div className={`mx-auto max-w-4xl overflow-hidden rounded-[28px] border bg-white shadow-[0_25px_80px_rgba(15,39,72,0.08)] ${approved ? "border-emerald-200" : "border-amber-200"}`}>
                    <div className="bg-[linear-gradient(125deg,#0B1F3A,#123D70)] px-6 py-10 text-center text-white sm:px-10">
                        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${approved ? "bg-emerald-400/15 ring-emerald-300/25" : "bg-amber-400/15 ring-amber-300/25"}`}><FileCheck2 className={`h-8 w-8 ${approved ? "text-emerald-300" : "text-amber-300"}`} /></div>
                        <p className={`mt-5 text-[10px] font-bold uppercase tracking-[0.24em] ${approved ? "text-emerald-200" : "text-amber-200"}`}>{approved ? "Approved" : "Under review"}</p>
                        <h1 className="mt-2 text-3xl font-bold">{approved ? "Account opening form approved" : "Approval is pending"}</h1>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/65">{approved ? "Your declaration was approved. You are eligible to submit withdrawal and portfolio payout requests." : "Your signed declaration is with the administration team. Withdrawals remain locked until approval."}</p>
                    </div>
                    <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
                        <ReadOnlyItem label="Signed by" value={record.legalName} />
                        <ReadOnlyItem label="Submitted on" value={new Date(record.submittedAt).toLocaleString("en-SG", { dateStyle: "medium", timeStyle: "short" })} />
                        <ReadOnlyItem label="Document version" value={record.version} />
                    </div>
                    <div className="flex flex-col gap-3 border-t border-[#E8EEF6] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <p className={`flex items-center gap-2 text-xs font-semibold ${approved ? "text-emerald-700" : "text-amber-700"}`}><BadgeCheck className="h-4 w-4" /> {approved ? "Eligible to submit withdrawal requests" : "Not eligible for withdrawals yet"}</p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button type="button" onClick={() => void refreshStatus()} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#CBD8EA] px-5 py-3 text-sm font-bold text-[#0F2748] hover:bg-[#F4F7FB] disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh status</button>
                            {approved && <button type="button" onClick={() => void downloadPdf()} disabled={downloading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(29,78,216,0.2)] hover:bg-[#1842B8] disabled:opacity-60">{downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download PDF</button>}
                            {approved && <Link href="/wallet" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2748] px-5 py-3 text-sm font-bold text-white hover:bg-[#173A66]">Go to wallet <ChevronRight className="h-4 w-4" /></Link>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (missing.length > 0) {
        return (
            <div className="min-h-full bg-[#F4F7FB] px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-amber-200 bg-white shadow-[0_25px_80px_rgba(15,39,72,0.08)]">
                    <div className="bg-[linear-gradient(125deg,#0B1F3A,#123D70)] px-6 py-9 text-white sm:px-10">
                        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-300/25"><CircleAlert className="h-6 w-6 text-amber-300" /></div>
                        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200">Profile action required</p>
                        <h1 className="mt-2 text-3xl font-bold">Complete your profile first</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">We can only generate your account-opening declaration after the required contact and residential information is available.</p>
                    </div>
                    <div className="p-6 sm:p-8">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5B7193]">Missing information</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {missing.map((item) => <div key={item.key} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"><span className="h-2 w-2 rounded-full bg-amber-500" />{item.label}</div>)}
                        </div>
                        <div className="mt-6 rounded-xl bg-[#F4F7FB] px-4 py-3 text-xs leading-5 text-[#5B7193]">Open your profile, select <strong className="text-[#0F2748]">Edit profile</strong>, complete the fields above, and save your changes before returning here.</div>
                        <Link href="/profile" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(29,78,216,0.22)] hover:bg-[#1842B8]">Complete profile <ChevronRight className="h-4 w-4" /></Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#F4F7FB] pb-16">
            <div className="bg-[linear-gradient(120deg,#0B1F3A_0%,#123D70_58%,#1D4ED8_130%)] px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-200">Private client onboarding</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Account Opening Declaration</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Review your profile, provide your financial suitability details, and sign the declaration. All information must be complete and accurate.</p></div>
                        <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Document</p><p className="mt-1 text-sm font-bold">AOF · {ACCOUNT_OPENING_VERSION}</p></div>
                    </div>
                    <div className="mt-7 grid grid-cols-3 gap-2 sm:max-w-lg">
                        {["Profile verified", "Declaration", "Signature"].map((label, index) => <div key={label} className="flex items-center gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${index === 0 ? "bg-emerald-400 text-[#0B1F3A]" : "bg-white/12 text-white"}`}>{index === 0 ? <Check className="h-4 w-4" /> : index + 1}</span><span className="hidden text-[11px] font-semibold text-white/65 sm:block">{label}</span></div>)}
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="mx-auto mt-6 max-w-5xl space-y-5 px-4 sm:px-6 lg:px-0">
                {record?.status === "rejected" && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold">Your previous form requires correction</p><p className="mt-1 text-xs leading-5 text-rose-700">{record.adminRemarks || "Please review your information, sign again, and resubmit."}</p></div><button type="button" onClick={() => void refreshStatus()} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold"><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh</button></div></div>}
                <SectionCard icon={<UserRound className="h-5 w-5" />} eyebrow="Section 01" title="Client identity">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><ReadOnlyItem label="Full legal name" value={expectedName} /><ReadOnlyItem label="Email address" value={profile?.email} /><ReadOnlyItem label="Phone number" value={`${profile?.countryCode || ""} ${profile?.phoneNumber || ""}`.trim()} /><ReadOnlyItem label="Date of birth" value={profile?.dateOfBirth} /><ReadOnlyItem label="Nationality" value={profile?.nationality} /><ReadOnlyItem label="Client ID" value={profile?.clientId || profile?._id} /></div>
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Identity information is sourced from your client profile. Update your profile before signing if anything is incorrect.</div>
                </SectionCard>

                <SectionCard icon={<MapPin className="h-5 w-5" />} eyebrow="Section 02" title="Residential address">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><ReadOnlyItem label="Country" value={profile?.country} /><ReadOnlyItem label="City" value={profile?.city} /><ReadOnlyItem label="Country code" value={profile?.countryCode} /><ReadOnlyItem label="Postal code" value={profile?.postalCode} /><div className="sm:col-span-2"><ReadOnlyItem label="Street address" value={profile?.address} /></div></div>
                </SectionCard>

                <SectionCard icon={<BriefcaseBusiness className="h-5 w-5" />} eyebrow="Section 03" title="Employment and financial profile">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Employment status"><CustomSelect value={form.employmentStatus} onChange={(value) => update("employmentStatus", value)} placeholder="Select status" options={selectOptions("Employed", "Self-employed", "Business owner", "Retired", "Student", "Not employed")} /></Field>
                        <Field label="Occupation"><input className={inputClass} value={form.occupation} onChange={(e) => update("occupation", e.target.value)} placeholder="Your occupation or profession" /></Field>
                        <Field label="Employer / business name" required={false}><input className={inputClass} value={form.employerName} onChange={(e) => update("employerName", e.target.value)} placeholder="Optional where not applicable" /></Field>
                        <Field label="Annual income"><CustomSelect value={form.annualIncome} onChange={(value) => update("annualIncome", value)} placeholder="Select income range" options={selectOptions("Below USD 25,000", "USD 25,000 – 50,000", "USD 50,001 – 100,000", "USD 100,001 – 250,000", "Above USD 250,000")} /></Field>
                        <Field label="Primary source of funds"><CustomSelect value={form.sourceOfFunds} onChange={(value) => update("sourceOfFunds", value)} placeholder="Select source" options={selectOptions("Employment income", "Business income", "Savings", "Investment proceeds", "Inheritance", "Sale of assets", "Other legitimate source")} /></Field>
                        <Field label="Estimated net worth"><CustomSelect value={form.estimatedNetWorth} onChange={(value) => update("estimatedNetWorth", value)} placeholder="Select range" options={selectOptions("Below USD 50,000", "USD 50,000 – 250,000", "USD 250,001 – 1,000,000", "USD 1,000,001 – 5,000,000", "Above USD 5,000,000")} /></Field>
                    </div>
                </SectionCard>

                <SectionCard icon={<Landmark className="h-5 w-5" />} eyebrow="Section 04" title="Investment and regulatory declaration">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Primary investment objective"><CustomSelect value={form.investmentObjective} onChange={(value) => update("investmentObjective", value)} placeholder="Select objective" options={selectOptions("Capital preservation", "Income generation", "Balanced growth", "Long-term capital growth", "Speculative growth")} /></Field>
                        <Field label="Investment experience"><CustomSelect value={form.investmentExperience} onChange={(value) => update("investmentExperience", value)} placeholder="Select experience" options={selectOptions("None", "Less than 2 years", "2 – 5 years", "More than 5 years")} /></Field>
                        <Field label="Country of tax residence"><SearchableSelect className="mt-1.5" value={form.taxResidency} onChange={(value) => update("taxResidency", value)} options={countries.map((country) => country.name)} placeholder={countriesLoading ? "Loading countries…" : "Select country"} searchPlaceholder="Search country…" emptyMessage="No countries found." disabled={countriesLoading} /></Field>
                        <Field label="Tax identification number"><input className={inputClass} value={form.taxIdentificationNumber} onChange={(e) => update("taxIdentificationNumber", e.target.value)} placeholder="TIN / tax reference" /></Field>
                        <Field label="Politically exposed person"><CustomSelect value={form.politicallyExposed} onChange={(value) => update("politicallyExposed", value)} placeholder="Select answer" options={YES_NO_OPTIONS} /></Field>
                        <Field label="US citizen or tax resident"><CustomSelect value={form.usPerson} onChange={(value) => update("usPerson", value)} placeholder="Select answer" options={YES_NO_OPTIONS} /></Field>
                        <div className="sm:col-span-2"><Field label="Acting as beneficial owner"><CustomSelect value={form.beneficialOwner} onChange={(value) => update("beneficialOwner", value)} placeholder="Select answer" options={[{ value: "yes", label: "Yes, I am investing for my own account" }, { value: "no", label: "No, I am acting for another beneficial owner" }]} /></Field></div>
                    </div>
                </SectionCard>

                <SectionCard icon={<FileSignature className="h-5 w-5" />} eyebrow="Section 05" title="Self-declaration and signature">
                    <div className="rounded-2xl border border-[#DCE5F2] bg-[#F8FAFD] p-4 sm:p-5">
                        <p className="text-sm font-bold text-[#0F2748]">Client declaration</p>
                        <div className="mt-3 space-y-2 text-xs leading-5 text-[#5B7193]"><p>I declare that all information provided in this form and in my client profile is complete, true, and accurate.</p><p>I confirm that the funds used for investment originate from legitimate sources and are not connected to unlawful activity.</p><p>I understand that investments involve risk, returns are not guaranteed, and Merlion Asset Holdings may rely on this declaration for compliance and account servicing.</p><p>I agree to notify Merlion Asset Holdings promptly if any information in this declaration changes.</p></div>
                    </div>
                    <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                        <div className="space-y-4">
                            <Field label="Type your full legal name"><input className={inputClass} value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder={expectedName || "Full legal name"} /></Field>
                            {legalName && !signatureNameMatches && <p className="flex items-center gap-2 text-xs font-semibold text-rose-600"><CircleAlert className="h-4 w-4" /> Name must exactly match “{expectedName}”.</p>}
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#DCE5F2] p-3.5"><input type="checkbox" checked={truthConfirmed} onChange={(e) => setTruthConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1D4ED8]" /><span className="text-xs leading-5 text-[#4E6485]">I certify that every answer and profile detail is true and correct.</span></label>
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#DCE5F2] p-3.5"><input type="checkbox" checked={termsConfirmed} onChange={(e) => setTermsConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1D4ED8]" /><span className="text-xs leading-5 text-[#4E6485]">I consent to electronic execution and understand this signature has the same effect as signing a paper declaration.</span></label>
                        </div>
                        <SignaturePad onChange={setSignature} />
                    </div>
                    <div className="mt-6 flex flex-col gap-3 border-t border-[#E8EEF6] pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-xl text-[11px] leading-5 text-[#7D90AC]">Submitting sends this declaration for administrator review. Withdrawals, maturity claims, monthly claims, and early exits unlock only after approval.</p>
                        <button type="submit" disabled={!canSubmit} className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(29,78,216,0.25)] transition hover:bg-[#1842B8] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Sign and submit</button>
                    </div>
                </SectionCard>
            </form>
        </div>
    );
}
