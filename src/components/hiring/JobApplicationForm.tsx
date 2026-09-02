"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    FileText,
    Loader2,
    Pencil,
    ShieldCheck,
    Trash2,
    UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import appClient from "@/lib/appClient";
import { SearchableSelect } from "@/components/UI/SearchableSelect";
import EmailOtpVerificationField from "@/components/common/EmailOtpVerificationField";
import { uploadHiringAsset } from "@/lib/hiring/cloudinaryUpload";
import { WORLD_COUNTRY_CODES } from "@/lib/countryCodes";
import {
    optimizeResume,
    optimizeVideo,
} from "@/lib/hiring/fileCompression";

type JobApplicationFormProps = {
    jobId: string;
    jobTitle: string;
};

type CountryData = {
    name: string;
    code: string;
    dialCode: string;
    cities: string[];
};

type UploadProgress = {
    resume: number;
    introductionVideo: number;
};

type ProcessingStage = "idle" | "optimizing" | "uploading";

type ApplicationReceipt = {
    reference: string;
    trackingToken: string;
    stage: string;
    submittedAt: string;
};

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const RESUME_TYPES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);

const formatFileSize = (bytes: number) => {
    const megabytes = bytes / (1024 * 1024);
    return megabytes >= 1
        ? `${megabytes.toFixed(1)} MB`
        : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const inputClass =
    "h-12 w-full rounded-md border border-navy/15 bg-white px-3.5 text-sm text-navy outline-none transition placeholder:text-navy/35 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15";

const labelClass =
    "mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-navy/58";

export default function JobApplicationForm({
    jobId,
    jobTitle,
}: JobApplicationFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [receipt, setReceipt] = useState<ApplicationReceipt | null>(null);
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [countriesFailed, setCountriesFailed] = useState(false);
    const [email, setEmail] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState("");
    const [emailVerificationToken, setEmailVerificationToken] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        resume: 0,
        introductionVideo: 0,
    });
    const [processingStage, setProcessingStage] =
        useState<ProcessingStage>("idle");
    const [videoOptimizationProgress, setVideoOptimizationProgress] = useState(0);
    const resumeInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const normalizedEmail = email.trim().toLowerCase();

    const resetEmailVerification = () => {
        setEmailVerified(false);
        setVerifiedEmail("");
        setEmailVerificationToken("");
    };

    useEffect(() => {
        let active = true;

        appClient
            .get("/api/countries")
            .then((response) => {
                if (!active) return;
                const data: CountryData[] =
                    response.data?.data ?? response.data ?? [];
                setCountries(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (!active) return;
                setCountriesFailed(true);
                toast.error("Country and city options could not be loaded.");
            })
            .finally(() => {
                if (active) setLoadingCountries(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const countryNames = useMemo(
        () => countries.map((item) => item.name),
        [countries],
    );

    const dialCodeMap = useMemo(
        () =>
            Object.fromEntries(
                countries.map((item) => [item.name, item.dialCode]),
            ),
        [countries],
    );

    const cityOptions = useMemo(
        () => countries.find((item) => item.name === country)?.cities ?? [],
        [countries, country],
    );

    const changeCountry = (value: string) => {
        setCountry(value);
        setCity("");
    };

    const selectResume = (file: File | undefined) => {
        if (!file) {
            setResumeFile(null);
            return false;
        }
        if (!RESUME_TYPES.has(file.type) || file.size > MAX_RESUME_BYTES) {
            setResumeFile(null);
            toast.error("Resume must be a PDF, DOC, or DOCX file up to 5MB.");
            return false;
        }
        setResumeFile(file);
        return true;
    };

    const selectVideo = (file: File | undefined) => {
        if (!file) {
            setVideoFile(null);
            return false;
        }
        if (!VIDEO_TYPES.has(file.type) || file.size > MAX_VIDEO_BYTES) {
            setVideoFile(null);
            toast.error("Introduction video must be an MP4 or MOV file up to 25MB.");
            return false;
        }
        setVideoFile(file);
        return true;
    };

    const removeResume = () => {
        setResumeFile(null);
        if (resumeInputRef.current) resumeInputRef.current.value = "";
    };

    const removeVideo = () => {
        setVideoFile(null);
        if (videoInputRef.current) videoInputRef.current.value = "";
    };

    const openResumePicker = () => {
        if (!resumeInputRef.current) return;
        resumeInputRef.current.value = "";
        resumeInputRef.current.click();
    };

    const openVideoPicker = () => {
        if (!videoInputRef.current) return;
        videoInputRef.current.value = "";
        videoInputRef.current.click();
    };

    const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (!emailVerified || verifiedEmail !== normalizedEmail || !emailVerificationToken) {
            toast.error("Please verify your email address before submitting your application.");
            return;
        }
        const formValues = new FormData(form);
        const phoneCountryCode = String(formValues.get("phoneCountryCode") || "");
        const phoneNationalNumber = String(formValues.get("phoneNationalNumber") || "");
        if (!phoneCountryCode) {
            toast.error("Please select a country code.");
            return;
        }
        if (!/^\d{6,15}$/.test(phoneNationalNumber)) {
            toast.error("Please enter a phone number containing 6 to 15 digits.");
            return;
        }
        if (!country || !city) {
            toast.error("Please select your country and city.");
            return;
        }

        if (!resumeFile) {
            toast.error("Please attach your resume or CV.");
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        setSubmitting(true);
        setProcessingStage("optimizing");
        setVideoOptimizationProgress(0);
        setUploadProgress({ resume: 0, introductionVideo: 0 });
        try {
            const candidateName = [
                formValues.get("firstName"),
                formValues.get("lastName"),
            ]
                .filter(Boolean)
                .join(" ");

            const [optimizedResume, optimizedVideo] = await Promise.all([
                optimizeResume(resumeFile),
                videoFile
                    ? optimizeVideo(videoFile, setVideoOptimizationProgress)
                    : Promise.resolve(null),
            ]);

            if (optimizedResume.file.size > MAX_RESUME_BYTES) {
                throw new Error(
                    "The resume is still larger than 5MB after optimization.",
                );
            }
            if (optimizedVideo && optimizedVideo.file.size > MAX_VIDEO_BYTES) {
                throw new Error(
                    "The introduction video is still larger than 25MB after compression.",
                );
            }

            setProcessingStage("uploading");
            const [resume, introductionVideo] = await Promise.all([
                uploadHiringAsset(
                    "resume",
                    candidateName,
                    optimizedResume.file,
                    (value) =>
                        setUploadProgress((current) => ({
                            ...current,
                            resume: value,
                        })),
                ),
                videoFile
                    ? uploadHiringAsset(
                        "introduction_video",
                        candidateName,
                        optimizedVideo!.file,
                        (value) =>
                            setUploadProgress((current) => ({
                                ...current,
                                introductionVideo: value,
                            })),
                    )
                    : Promise.resolve(null),
            ]);

            const payload = {
                jobId,
                firstName: formValues.get("firstName"),
                lastName: formValues.get("lastName"),
                email: normalizedEmail,
                emailVerificationToken,
                phoneNumber: `${phoneCountryCode} ${phoneNationalNumber}`,
                country,
                countryCode: dialCodeMap[country] ?? "",
                city,
                highestQualification: formValues.get("highestQualification"),
                yearsOfExperience: Number(formValues.get("yearsOfExperience")),
                currentRole: formValues.get("currentRole"),
                motivation: formValues.get("motivation"),
                consent: formValues.get("consent") === "accepted",
                resume: {
                    ...resume,
                    originalFilename: resumeFile.name,
                    originalBytes: optimizedResume.originalBytes,
                    optimizedBytes: optimizedResume.optimizedBytes,
                    compressionApplied: optimizedResume.compressed,
                },
                introductionVideo:
                    introductionVideo && optimizedVideo
                        ? {
                            ...introductionVideo,
                            originalFilename: videoFile!.name,
                            originalBytes: optimizedVideo.originalBytes,
                            optimizedBytes: optimizedVideo.optimizedBytes,
                            compressionApplied: optimizedVideo.compressed,
                        }
                        : null,
            };

            const response = await appClient.post(
                "/api/hiring/applications",
                payload,
            );
            if (!response.data?.success) {
                throw new Error(response.data?.message ?? "Application could not be submitted.");
            }

            form.reset();
            setEmail("");
            resetEmailVerification();
            setResumeFile(null);
            setVideoFile(null);
            setCountry("");
            setCity("");
            const applicationReceipt = response.data.data as ApplicationReceipt;
            setReceipt(applicationReceipt);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Application could not be submitted. Please try again.",
            );
        } finally {
            setSubmitting(false);
            setProcessingStage("idle");
        }
    };

    if (receipt) {
        return (
            <section className="rounded-xl border border-blue-100 bg-[#f7f9fd] p-7 sm:p-10">
                <CheckCircle2 className="h-10 w-10 text-blue-600" />
                <h2
                    className="mt-5 text-3xl text-navy"
                    style={{ fontFamily: "var(--font-playfair)" }}
                >
                    Application received
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-navy/65">
                    Thank you for applying for {jobTitle}. The Merlion hiring team
                    will review your application manually and contact you if your
                    experience matches the role.
                </p>
                <div className="mt-6 rounded-lg border border-navy/10 bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy/50">Application reference</p>
                    <p className="mt-1 font-mono text-lg font-bold text-navy">{receipt.reference}</p>
                    <p className="mt-2 text-xs leading-5 text-navy/55">Keep this reference for your records. To track your application, enter your application email and use the secure link we send you.</p>
                </div>
                <Link href="/hiring/track" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-bold text-white transition hover:bg-navy/90">
                    Track application <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        );
    }

    return (
        <form onSubmit={submitApplication} className="space-y-10">
            <section>
                <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                        1
                    </span>
                    <div>
                        <h2 className="text-base font-bold text-navy">Personal details</h2>
                        <p className="text-sm text-navy/50">
                            Tell the hiring team how to contact you.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <label>
                        <span className={labelClass}>First name *</span>
                        <input name="firstName" required autoComplete="given-name" className={inputClass} />
                    </label>
                    <label>
                        <span className={labelClass}>Last name *</span>
                        <input name="lastName" required autoComplete="family-name" className={inputClass} />
                    </label>
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
                        onError={message => { if (message) toast.error(message); }}
                        inputClassName={`${inputClass} pr-24`}
                        labelClassName={labelClass}
                        requiredAccentClassName="text-blue-600"
                    />
                    <label>
                        <span className={labelClass}>Phone number *</span>
                        <div className="flex gap-2">
                            <select
                                name="phoneCountryCode"
                                required
                                defaultValue=""
                                aria-label="Country code"
                                className="w-28 rounded-xl border border-slate-200 bg-white px-2.5 py-3 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none cursor-pointer"
                            >
                                <option value="" disabled>Select</option>
                                {WORLD_COUNTRY_CODES.map((c) => (
                                    <option key={c.code + c.country} value={c.code}>
                                        {c.flag} {c.code}
                                    </option>
                                ))}
                            </select>
                            <input
                                name="phoneNationalNumber"
                                type="tel"
                                required
                                autoComplete="tel"
                                inputMode="numeric"
                                minLength={6}
                                maxLength={15}
                                pattern="[0-9]{6,15}"
                                title="Enter a phone number containing 6 to 15 digits."
                                placeholder="Enter your phone number"
                                onInput={event => {
                                    event.currentTarget.value = event.currentTarget.value
                                        .replace(/\D/g, "")
                                        .slice(0, 15);
                                }}
                                className={`flex-1 ${inputClass}`}
                            />
                        </div>
                    </label>
                    <label>
                        <span className={labelClass}>Country *</span>
                        <input type="hidden" name="country" value={country} />
                        <SearchableSelect
                            value={country}
                            onChange={changeCountry}
                            options={countryNames}
                            optionMeta={dialCodeMap}
                            placeholder={
                                loadingCountries
                                    ? "Loading countries…"
                                    : countriesFailed
                                        ? "Countries unavailable"
                                        : "Select country"
                            }
                            searchPlaceholder="Search country…"
                            disabled={loadingCountries || countriesFailed}
                            emptyMessage="No countries found."
                        />
                    </label>
                    <label>
                        <span className={labelClass}>City *</span>
                        <input type="hidden" name="city" value={city} />
                        <SearchableSelect
                            value={city}
                            onChange={setCity}
                            options={cityOptions}
                            placeholder={
                                loadingCountries
                                    ? "Loading cities…"
                                    : !country
                                        ? "Select country first"
                                        : "Select city"
                            }
                            searchPlaceholder="Search city…"
                            disabled={loadingCountries || countriesFailed || !country}
                            emptyMessage="No cities found."
                        />
                    </label>
                </div>
            </section>

            <section className="border-t border-navy/10 pt-9">
                <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                        2
                    </span>
                    <div>
                        <h2 className="text-base font-bold text-navy">Professional background</h2>
                        <p className="text-sm text-navy/50">
                            Summarise the experience most relevant to this vacancy.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <label>
                        <span className={labelClass}>Highest qualification *</span>
                        <input
                            name="highestQualification"
                            required
                            placeholder="e.g. Bachelor of Finance"
                            className={inputClass}
                        />
                    </label>
                    <label>
                        <span className={labelClass}>Years of experience *</span>
                        <input
                            name="yearsOfExperience"
                            type="number"
                            required
                            min="0"
                            max="60"
                            placeholder="0"
                            className={inputClass}
                        />
                    </label>
                    <label className="sm:col-span-2">
                        <span className={labelClass}>Current or most recent role</span>
                        <input
                            name="currentRole"
                            placeholder="Role and organisation"
                            className={inputClass}
                        />
                    </label>
                </div>
            </section>

            <section className="border-t border-navy/10 pt-9">
                <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                        3
                    </span>
                    <div>
                        <h2 className="text-base font-bold text-navy">Documents and motivation</h2>
                        <p className="text-sm text-navy/50">
                            Attach your CV and tell us why you want to represent Merlion.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="rounded-lg border border-dashed border-navy/20 p-5 transition hover:border-blue-500">
                        <span className="flex items-center gap-2 text-sm font-semibold text-navy">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Resume or CV *
                        </span>
                        <span className="mt-1 block text-xs text-navy/45">PDF or DOC, up to 5MB</span>
                        <input
                            ref={resumeInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            aria-label="Choose resume or CV"
                            onChange={(event) => {
                                if (!selectResume(event.target.files?.[0])) {
                                    event.currentTarget.value = "";
                                }
                            }}
                            disabled={submitting}
                            className="sr-only"
                        />
                        {resumeFile ? (
                            <div className="mt-4 rounded-md bg-[#f5f8ff] p-3">
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-navy">
                                        {resumeFile.name}
                                    </p>
                                    <p className="mt-1 text-[11px] text-navy/45">
                                        {processingStage === "optimizing"
                                            ? "Optimizing document…"
                                            : processingStage === "uploading"
                                              ? `Uploading ${uploadProgress.resume}%`
                                              : formatFileSize(resumeFile.size)}
                                    </p>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={openResumePicker}
                                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 text-[11px] font-semibold text-blue-700 transition hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Pencil className="h-3 w-3" />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={removeResume}
                                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-red-100 bg-white px-3 text-[11px] font-semibold text-red-600 transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={openResumePicker}
                                className="mt-4 inline-flex h-9 items-center rounded-full bg-blue-50 px-4 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Choose file
                            </button>
                        )}
                    </div>

                    <div className="rounded-lg border border-dashed border-navy/20 p-5 transition hover:border-blue-500">
                        <span className="flex items-center gap-2 text-sm font-semibold text-navy">
                            <UploadCloud className="h-4 w-4 text-blue-600" />
                            Introduction video
                        </span>
                        <span className="mt-1 block text-xs text-navy/45">MP4 or MOV, up to 25MB</span>
                        <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/mp4,video/quicktime"
                            aria-label="Choose introduction video"
                            onChange={(event) => {
                                if (!selectVideo(event.target.files?.[0])) {
                                    event.currentTarget.value = "";
                                }
                            }}
                            disabled={submitting}
                            className="sr-only"
                        />
                        {videoFile ? (
                            <div className="mt-4 rounded-md bg-[#f5f8ff] p-3">
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-navy">
                                        {videoFile.name}
                                    </p>
                                    <p className="mt-1 text-[11px] text-navy/45">
                                        {processingStage === "optimizing"
                                            ? `Compressing video ${videoOptimizationProgress}%`
                                            : processingStage === "uploading"
                                              ? `Uploading ${uploadProgress.introductionVideo}%`
                                              : formatFileSize(videoFile.size)}
                                    </p>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={openVideoPicker}
                                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 text-[11px] font-semibold text-blue-700 transition hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Pencil className="h-3 w-3" />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={removeVideo}
                                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-red-100 bg-white px-3 text-[11px] font-semibold text-red-600 transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={openVideoPicker}
                                className="mt-4 inline-flex h-9 items-center rounded-full bg-blue-50 px-4 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Choose file
                            </button>
                        )}
                    </div>

                    <label className="sm:col-span-2">
                        <span className={labelClass}>Why Merlion? *</span>
                        <textarea
                            name="motivation"
                            required
                            minLength={80}
                            rows={6}
                            placeholder="Describe your motivation, relevant strengths, and the standard of service you would bring to Merlion clients."
                            className="w-full resize-y rounded-md border border-navy/15 bg-white px-3.5 py-3 text-sm leading-6 text-navy outline-none transition placeholder:text-navy/35 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                        />
                        <span className="mt-1 block text-xs text-navy/42">Minimum 80 characters</span>
                    </label>
                </div>
            </section>

            <label className="flex items-start gap-3 rounded-lg bg-[#f6f8fc] p-5">
                <input
                    name="consent"
                    type="checkbox"
                    required
                    value="accepted"
                    className="mt-0.5 h-4 w-4 rounded border-navy/25 accent-blue-600"
                />
                <span className="text-xs leading-5 text-navy/62">
                    I confirm that the information provided is accurate and consent to
                    Merlion Asset Holdings reviewing my application and supporting
                    documents for hiring purposes.
                </span>
            </label>

            <div className="flex flex-col gap-4 border-t border-navy/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-2 text-xs text-navy/50">
                    <ShieldCheck className="h-4 w-4" />
                    Every application is reviewed manually.
                </span>
                <button
                    type="submit"
                    disabled={submitting || !emailVerified}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-navy px-6 text-sm font-semibold text-white transition hover:bg-[#102c5c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <ArrowRight className="h-4 w-4" />
                    )}
                    {processingStage === "optimizing"
                        ? "Optimizing files…"
                        : processingStage === "uploading"
                            ? "Uploading & submitting…"
                            : "Submit application"}
                </button>
            </div>
        </form>
    );
}
