"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { AxiosError } from "axios";
import { CheckCircle2, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import appClient from "@/lib/appClient";
import EmailOtpVerificationField from "@/components/common/EmailOtpVerificationField";
import { optimizeResume } from "@/lib/hiring/fileCompression";
import { uploadHiringAsset } from "@/lib/hiring/cloudinaryUpload";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

type Receipt = { reference: string; submittedAt: string };

const fieldClass =
    "mt-2 h-12 w-full rounded-lg border border-navy/15 bg-white px-4 text-sm text-navy outline-none transition placeholder:text-navy/35 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10";

export default function ExpressionOfInterestForm() {
    const resumeInput = useRef<HTMLInputElement>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [resume, setResume] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [emailVerified, setEmailVerified] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState("");
    const [emailVerificationToken, setEmailVerificationToken] = useState("");

    const normalizedEmail = email.trim().toLowerCase();

    const resetEmailVerification = () => {
        setEmailVerified(false);
        setVerifiedEmail("");
        setEmailVerificationToken("");
    };

    const chooseResume = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setError("");
        if (!file) return setResume(null);
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            event.target.value = "";
            return setError("Please select a PDF resume.");
        }
        if (file.size > MAX_RESUME_BYTES) {
            event.target.value = "";
            return setError("Resume must not exceed 5MB.");
        }
        setResume(file);
    };

    const clearResume = () => {
        setResume(null);
        setProgress(0);
        if (resumeInput.current) resumeInput.current.value = "";
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!emailVerified || verifiedEmail !== normalizedEmail || !emailVerificationToken) {
            return setError("Please verify your email address before submitting your interest.");
        }
        if (!resume) return setError("Please attach your PDF resume.");
        if (coverLetter.trim().length < 80) {
            return setError("Cover letter must be at least 80 characters.");
        }

        setSubmitting(true);
        setError("");
        setProgress(1);
        try {
            const optimized = await optimizeResume(resume);
            if (optimized.file.size > MAX_RESUME_BYTES) {
                throw new Error("Resume remains larger than 5MB after optimization.");
            }
            const uploaded = await uploadHiringAsset(
                "resume",
                `${firstName} ${lastName}`.trim(),
                optimized.file,
                setProgress,
            );
            const response = await appClient.post("/api/hiring/interests", {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: normalizedEmail,
                emailVerificationToken,
                coverLetter: coverLetter.trim(),
                resume: {
                    ...uploaded,
                    originalFilename: resume.name,
                    originalBytes: optimized.originalBytes,
                    optimizedBytes: optimized.optimizedBytes,
                    compressionApplied: optimized.compressed,
                },
            });
            setReceipt(response.data.data);
        } catch (requestError) {
            const apiError = requestError as AxiosError<{ message?: string }>;
            setError(
                apiError.response?.data?.message ||
                    (requestError instanceof Error ? requestError.message : "We could not submit your interest."),
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (receipt) {
        return (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-7 sm:p-9">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Interest received
                </p>
                <h2 className="mt-2 text-3xl font-normal text-navy" style={{ fontFamily: "var(--font-playfair)" }}>
                    Thank you, {firstName}.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-navy/65">
                    Our hiring team will review your profile manually. If your experience matches a current or future opportunity, we will contact you directly.
                </p>
                <div className="mt-6 inline-flex rounded-lg border border-emerald-200 bg-white px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy/45">Reference&nbsp;</span>
                    <span className="text-xs font-bold text-navy">{receipt.reference}</span>
                </div>
            </section>
        );
    }

    return (
        <form onSubmit={submit} className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(6,22,58,0.55)] sm:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy/55">First name *</span>
                    <input required maxLength={80} autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy/55">Last name *</span>
                    <input required maxLength={80} autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className={fieldClass} />
                </label>
            </div>

            <div className="mt-5">
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
                    onError={setError}
                    inputClassName={`${fieldClass} pr-24`}
                    labelClassName="text-[10px] font-bold uppercase tracking-[0.14em] text-navy/55"
                    requiredAccentClassName="text-blue-600"
                />
            </div>

            <label className="mt-5 block">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy/55">Cover letter *</span>
                <textarea required minLength={80} maxLength={10000} value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} placeholder="Tell us what you would bring to Merlion, the work that interests you, and the standards you hold yourself to." className="mt-2 min-h-44 w-full resize-y rounded-lg border border-navy/15 bg-white px-4 py-3 text-sm leading-6 text-navy outline-none transition placeholder:text-navy/35 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10" />
                <span className="mt-1.5 block text-right text-[11px] text-navy/40">{coverLetter.length} / 10,000</span>
            </label>

            <div className="mt-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy/55">Resume *</span>
                <input ref={resumeInput} type="file" accept="application/pdf,.pdf" onChange={chooseResume} className="sr-only" id="interest-resume" />
                {resume ? (
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600"><FileText className="h-5 w-5" /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-navy">{resume.name}</span><span className="mt-1 block text-xs text-navy/45">{(resume.size / 1024 / 1024).toFixed(2)} MB · PDF</span></span>
                        <label htmlFor="interest-resume" className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800">Replace</label>
                        <button type="button" onClick={clearResume} aria-label="Remove resume" className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                    </div>
                ) : (
                    <label htmlFor="interest-resume" className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-navy/20 bg-[#f8faff] px-5 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50/50">
                        <UploadCloud className="h-7 w-7 text-blue-600" />
                        <span className="mt-3 text-sm font-bold text-navy">Choose PDF resume</span>
                        <span className="mt-1 text-xs text-navy/45">The file is optimized before secure Cloudinary upload · up to 5MB</span>
                    </label>
                )}
            </div>

            {submitting && progress > 0 && (
                <div className="mt-5" aria-live="polite"><div className="flex justify-between text-xs text-navy/55"><span>Securely uploading resume</span><span>{progress}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy/8"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div></div>
            )}
            {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <button disabled={submitting || !emailVerified} className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy px-6 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {submitting ? "Submitting securely…" : "Submit your interest"}
            </button>
        </form>
    );
}
