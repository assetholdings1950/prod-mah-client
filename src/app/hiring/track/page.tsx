"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Check, CheckCircle2, Circle, ClipboardCheck, ExternalLink, FileUp, KeyRound, Loader2, LogOut, Mail } from "lucide-react";
import appClient from "@/lib/appClient";
import { uploadHiringAsset } from "@/lib/hiring/cloudinaryUpload";

type Question = { _id?: string; id?: string; type: "mcq" | "explanation" | "case-study" | "practical"; title: string; prompt: string; options?: string[]; acceptedFormats?: string[]; required: boolean; marks: number };
type Assignment = { _id: string; title: string; kind: string; status: string; dueAt: string; startedAt?: string; submittedAt?: string; candidateInstructions?: string; score?: number | null; maximumScore: number; feedback?: string; template: { instructions: string; allowedResources: string; questions: Question[] } };
type Workspace = { reference: string; candidateName: string; role: string; stage: string; submittedAt: string; progress: string[]; activities: Array<{ _id: string; action: string; detail: string; at: string }>; assignments: Assignment[]; interviews: Array<{ _id: string; type: string; startAt: string; endAt: string; mode: string; locationOrLink?: string; interviewers?: string[]; status: string }> };
type Answer = { questionId: string; selectedOption?: string; textAnswer?: string; attachments?: Array<{ secureUrl: string; publicId: string; originalFilename: string; format: string | null; bytes: number }> };

const dateTime = (value: string) => new Intl.DateTimeFormat("en-SG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function CandidateTrackingPage() {
    const [email, setEmail] = useState("");
    const [access, setAccess] = useState("");
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedReference, setSelectedReference] = useState("");
    const [sent, setSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const retrieve = async (accessToken: string) => {
        setLoading(true); setError("");
        try {
            const response = await appClient.get("/api/hiring/candidate/workspace", { params: { access: accessToken } });
            const applications = response.data.data?.applications ?? [];
            setAccess(accessToken);
            setWorkspaces(applications);
            setSelectedReference(applications[0]?.reference ?? "");
            window.history.replaceState({}, "", "/hiring/track");
        }
        catch (requestError) {
            window.localStorage.removeItem("mahHiringCandidateAccess");
            setAccess("");
            setWorkspaces([]);
            setError(requestError instanceof Error ? requestError.message : "Your candidate session has expired. Verify your email again.");
        }
        finally { setLoading(false); }
    };

    const verifyOtp = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true); setError("");
        try {
            const response = await appClient.post("/api/hiring/candidate/access/verify", {
                email: email.trim(),
                otp: otp.trim(),
            });
            const accessToken = response.data.data?.accessToken;
            if (!accessToken) throw new Error("Candidate session could not be created.");
            window.localStorage.setItem("mahHiringCandidateAccess", accessToken);
            await retrieve(accessToken);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "OTP verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        window.localStorage.removeItem("mahHiringCandidateAccess");
        setAccess("");
        setWorkspaces([]);
        setSelectedReference("");
        setEmail("");
        setOtp("");
        setSent(false);
        setError("");
    };

    const requestAccess = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true); setError("");
        try {
            await appClient.post("/api/hiring/candidate/access", { email: email.trim() });
            setSent(true);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Could not send the verification OTP.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const accessToken = window.localStorage.getItem("mahHiringCandidateAccess") || "";
        if (accessToken) void retrieve(accessToken);
    }, []);

    const selectedWorkspace = workspaces.find((item) => item.reference === selectedReference) ?? workspaces[0];

    return <main className="min-h-screen bg-[#f7f9fd] pb-20 pt-20 text-navy md:pt-[108px]"><div className="mx-auto max-w-[1180px] px-5 sm:px-8 md:px-12"><div className="flex items-center justify-between"><Link href="/hiring" className="inline-flex items-center gap-2 text-sm font-semibold text-navy/60 hover:text-navy"><ArrowLeft className="h-4 w-4" /> Careers</Link>{selectedWorkspace && <button onClick={logout} className="inline-flex h-10 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 text-sm font-bold text-navy/65 hover:bg-navy hover:text-white"><LogOut className="h-4 w-4" /> Logout</button>}</div><header className="mt-7 border-b border-navy/10 pb-8"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Candidate workspace</p><h1 className="mt-2 text-4xl font-normal md:text-5xl" style={{ fontFamily: "var(--font-playfair)" }}>Track your application</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-navy/60">Enter the email address used in your application. We will send a six-digit OTP to verify your identity. Your verified session remains available when this page is refreshed.</p></header>
        {!selectedWorkspace && !loading && <form onSubmit={sent ? verifyOtp : requestAccess} className="mt-8 max-w-2xl rounded-xl border border-navy/10 bg-white p-6">{sent ? <><KeyRound className="h-9 w-9 text-blue-600" /><h2 className="mt-4 text-2xl" style={{ fontFamily: "var(--font-playfair)" }}>Enter verification OTP</h2><p className="mt-2 text-sm leading-6 text-navy/60">Enter the six-digit OTP sent to <strong>{email}</strong>. It expires after five minutes.</p><label className="mt-5 block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-navy/55">Verification OTP</span><input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" autoComplete="one-time-code" className="h-12 w-full rounded-md border border-navy/15 px-3 font-mono text-lg tracking-[0.35em] outline-none focus:border-blue-600" /></label>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}<button disabled={otp.length !== 6 || loading} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-bold text-white disabled:opacity-50"><KeyRound className="h-4 w-4" /> Verify and open workspace</button><button type="button" onClick={() => { setSent(false); setOtp(""); setError(""); }} className="ml-4 mt-5 text-sm font-bold text-blue-600">Use another email</button></> : <><label><span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-navy/55">Email address</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="h-12 w-full rounded-md border border-navy/15 px-3 text-sm outline-none focus:border-blue-600" /></label>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}<button disabled={loading} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-bold text-white disabled:opacity-50"><Mail className="h-4 w-4" /> Send verification OTP</button></>}</form>}
        {loading && <div className="flex min-h-48 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>}
        {selectedWorkspace && <><section className="mt-8 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_18px_55px_-38px_rgba(6,22,58,0.45)]"><div className="flex flex-col gap-2 border-b border-navy/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Application portfolio</p><h2 className="mt-1 text-lg font-bold text-navy">Your applications</h2></div><p className="text-xs text-navy/45">{workspaces.length} {workspaces.length === 1 ? "role" : "roles"} in progress</p></div><div className="grid gap-3 bg-[linear-gradient(135deg,rgba(247,249,253,0.95),rgba(238,244,255,0.75))] p-3 sm:p-4 lg:grid-cols-2">{workspaces.map((item) => { const active = item.reference === selectedWorkspace.reference; return <button key={item.reference} type="button" aria-pressed={active} onClick={() => setSelectedReference(item.reference)} className={`group relative min-w-0 overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${active ? "border-navy bg-[linear-gradient(135deg,#06163a,#0e2e68)] text-white shadow-[0_16px_35px_-22px_rgba(6,22,58,0.9)]" : "border-navy/10 bg-white text-navy hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_14px_30px_-24px_rgba(37,99,235,0.65)]"}`}><span className={`absolute -right-8 -top-10 h-28 w-28 rounded-full transition-transform duration-300 group-hover:scale-110 ${active ? "bg-blue-500/20" : "bg-blue-50"}`} /><div className="relative flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/10 text-blue-200 ring-1 ring-white/15" : "bg-blue-50 text-blue-600"}`}><BriefcaseBusiness className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="truncate text-sm font-bold">{item.role}</span>{active && <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500"><Check className="h-3 w-3" /></span>}</span><span className={`mt-1 block text-[10px] font-bold uppercase tracking-[0.12em] ${active ? "text-blue-200" : "text-navy/40"}`}>{item.reference}</span><span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${active ? "bg-white/10 text-white ring-1 ring-white/10" : "bg-navy/5 text-navy/60"}`}>{item.stage}</span></span></div></button>; })}</div></section><WorkspaceView workspace={selectedWorkspace} access={access} refresh={() => retrieve(access)} /></>}
    </div></main>;
}

function WorkspaceView({ workspace, access, refresh }: { workspace: Workspace; access: string; refresh: () => void }) {
    const current = workspace.progress.indexOf(workspace.stage);
    return (
        <div className="mt-8 space-y-6">
            <section className="rounded-xl border border-navy/10 bg-white p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-navy/45">
                            {workspace.reference}
                        </p>
                        <h2
                            className="mt-1 text-2xl"
                            style={{ fontFamily: "var(--font-playfair)" }}
                        >
                            {workspace.candidateName}
                        </h2>
                        <p className="mt-1 text-sm text-navy/55">
                            {workspace.role}
                        </p>
                    </div>
                    <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {workspace.stage}
                    </span>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
                    {workspace.progress.map((stage, index) => (
                        <div key={stage} className="flex items-start gap-2 sm:block">
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full ${index <= current ? "bg-blue-600 text-white" : "bg-navy/5 text-navy/30"}`}
                            >
                                {index < current ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <Circle className="h-3 w-3" />
                                )}
                            </span>
                            <p
                                className={`mt-1 text-[9px] font-bold ${index <= current ? "text-navy" : "text-navy/35"}`}
                            >
                                {stage}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-xl border border-navy/10 bg-white p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                    Assignments
                </h2>
                <div className="mt-4 space-y-4">
                    {workspace.assignments.length ? (
                        workspace.assignments.map(item => (
                            <AssignmentCard
                                key={item._id}
                                assignment={item}
                                reference={workspace.reference}
                                access={access}
                                candidateName={workspace.candidateName}
                                refresh={refresh}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-navy/45">
                            No assignments have been published for you.
                        </p>
                    )}
                </div>
            </section>

            <section className="rounded-xl border border-navy/10 bg-white p-6">
                <h2 className="text-lg font-bold">Progress history</h2>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {workspace.activities.map(item => (
                        <div
                            key={item._id}
                            className="border-l-2 border-blue-200 pl-4"
                        >
                            <p className="text-sm font-bold">{item.action}</p>
                            <p className="mt-1 text-xs leading-5 text-navy/55">
                                {item.detail}
                            </p>
                            <p className="mt-1 text-[10px] text-navy/35">
                                {dateTime(item.at)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-xl border border-navy/10 bg-white p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    Interviews
                </h2>
                <div className="mt-4 space-y-3">
                    {workspace.interviews.length ? (
                        workspace.interviews.map(item => (
                            <div
                                key={item._id}
                                className="rounded-lg border border-navy/10 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-bold">{item.type}</p>
                                    <span className="text-xs font-bold text-blue-700">
                                        {item.status}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-navy/60">
                                    {dateTime(item.startAt)} · {item.mode}
                                </p>
                                {item.locationOrLink && (
                                    <a
                                        href={item.locationOrLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600"
                                    >
                                        Open meeting details
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-navy/45">
                            No interviews are currently scheduled.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}

function AssignmentCard({ assignment, reference, access, candidateName, refresh }: { assignment: Assignment; reference: string; access: string; candidateName: string; refresh: () => void }) {
    const [answers, setAnswers] = useState<Record<string, Answer>>({}); const [notes, setNotes] = useState(""); const [busy, setBusy] = useState(""); const [error, setError] = useState("");
    const editable = ["Published", "In progress", "Revision requested"].includes(assignment.status);
    const setAnswer = (id: string, value: Partial<Answer>) => setAnswers((current) => ({ ...current, [id]: { ...(current[id] || {}), ...value, questionId: id } }));
    const start = async () => { setBusy("start"); try { await appClient.post(`/api/hiring/candidate/assignments/${assignment._id}/start`, { reference, access }); refresh(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not start assignment."); } finally { setBusy(""); } };
    const upload = async (question: Question, file?: File) => { if (!file) return; if (file.size > 25 * 1024 * 1024) { setError("Submission files must not exceed 25MB."); return; } const id = String(question._id || question.id); setBusy(id); setError(""); try { const item = await uploadHiringAsset("assessment_attachment", candidateName, file, () => {}, { applicationReference: reference, accessToken: access }); setAnswer(id, { attachments: [{ secureUrl: item.url, publicId: item.publicId, originalFilename: item.originalFilename, format: item.format, bytes: item.bytes }] }); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "File upload failed."); } finally { setBusy(""); } };
    const submit = async () => { setBusy("submit"); setError(""); try { await appClient.post(`/api/hiring/candidate/assignments/${assignment._id}/submit`, { reference, access, answers: Object.values(answers), submissionNotes: notes }); refresh(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not submit assignment."); } finally { setBusy(""); } };
    return <article className="rounded-lg border border-navy/10 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-bold">{assignment.title}</p><p className="mt-1 text-xs text-navy/50">Due {dateTime(assignment.dueAt)} · {assignment.maximumScore} marks</p></div><span className="w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">{assignment.status}</span></div>{assignment.feedback && <p className="mt-3 rounded-md bg-blue-50 p-3 text-sm text-navy/65"><strong>Hiring team feedback:</strong> {assignment.feedback}</p>}{assignment.status === "Published" && <button onClick={start} disabled={busy === "start"} className="mt-4 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white">Start assignment</button>}{editable && assignment.status !== "Published" && <div className="mt-5 space-y-5">{assignment.template.questions.map((question, index) => { const id = String(question._id || question.id); return <div key={id} className="border-t border-navy/10 pt-4"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Question {index + 1} · {question.marks} marks</p><h3 className="mt-1 font-bold">{question.title}</h3><div className="prose prose-sm mt-2 max-w-none text-navy/65" dangerouslySetInnerHTML={{ __html: question.prompt }} />{question.type === "mcq" ? <div className="mt-3 space-y-2">{question.options?.map((option) => <label key={option} className="flex gap-2 text-sm"><input type="radio" name={id} checked={answers[id]?.selectedOption === option} onChange={() => setAnswer(id, { selectedOption: option })} />{option}</label>)}</div> : question.type === "practical" ? <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-navy/20 p-3 text-sm font-semibold text-blue-600"><FileUp className="h-4 w-4" />{busy === id ? "Uploading…" : answers[id]?.attachments?.[0]?.originalFilename || `Upload ${question.acceptedFormats?.join(", ") || "file"}`}<input type="file" className="hidden" onChange={(event) => void upload(question, event.target.files?.[0])} /></label> : <textarea value={answers[id]?.textAnswer || ""} onChange={(event) => setAnswer(id, { textAnswer: event.target.value })} className="mt-3 min-h-32 w-full rounded-md border border-navy/15 p-3 text-sm outline-none focus:border-blue-600" placeholder="Write your answer…" />}</div>; })}<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Submission note (optional)" className="min-h-20 w-full rounded-md border border-navy/15 p-3 text-sm" />{error && <p className="text-sm text-red-600">{error}</p>}<button onClick={submit} disabled={busy === "submit"} className="rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy === "submit" ? "Submitting…" : "Submit assignment"}</button></div>}</article>;
}
