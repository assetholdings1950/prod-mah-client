"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Loader2, RefreshCw, AlertCircle, Building2, Lock, ChevronRight } from "lucide-react";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";

import {
  type StepId, type GovIdType, type UploadedFile, type ClientData,
  STEP_ORDER, KYC_SESSION_KEY, loadSession, persistSession,
} from "@/interface/kyc";
import { StepIndicator, StepCard, KycStatusBadge } from "@/components/kyc/shared-ui";
import { KycApprovedView, KycUnderReviewView, KycRejectedView } from "@/components/kyc/kyc-status-views";
import { SelfieStep } from "@/components/kyc/selfie-step";
import { GovIdStep } from "@/components/kyc/gov-id-step";
import { UploadStep } from "@/components/kyc/upload-step";
import { VideoStep } from "@/components/kyc/video-step";
import { optimizeKycImage, uploadKycAsset } from "@/lib/kycUpload";

function dataUrlToBlob(dataUrl: string): Blob {
  const [metadata, encoded] = dataUrl.split(",");
  const mime = metadata.match(/data:([^;]+)/)?.[1] || "application/octet-stream";
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function KycPage() {
  const { user, setUser } = useAuthStore();
  const [sessionLoaded, setSessionLoaded] = useState(false);

  /* ── form state ── */
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [idType, setIdType] = useState<GovIdType>("");
  const [idNumber, setIdNumber] = useState("");
  const [idConfirmed, setIdConfirmed] = useState(false);
  const [frontFile, setFrontFile] = useState<UploadedFile | null>(null);
  const [backFile, setBackFile] = useState<UploadedFile | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  /* ── submit state ── */
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "finalizing">("idle");
  const [uploadProgress, setUploadProgress] = useState({ selfie: 0, idFront: 0, idBack: 0, video: 0 });

  /* ── post-submit / status state ── */
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const kycStatus = clientData?.kycStatus ?? user?.kycStatus ?? "pending";
  const showForm = ["pending", "not_submitted"].includes(kycStatus);

  const fetchClientData = useCallback(async (showLoader = true) => {
    if (!user?._id) return;
    if (showLoader) setRefreshing(true);
    try {
      const res = await appClient.get(`/api/clients/${user._id}`);
      const data: ClientData = res.data?.data ?? res.data;
      setClientData(data);
      if (data.kycStatus) {
        setUser({
          ...user,
          kycStatus: data.kycStatus as typeof user.kycStatus,
          firstName: data.firstName ?? user.firstName,
          lastName: data.lastName ?? user.lastName,
        });
      }
    } catch {
      // fallback to auth store data
    } finally {
      setRefreshing(false);
      setDataLoading(false);
    }
  }, [user, setUser]);

  useEffect(() => {
    const s = loadSession();
    if (s.idType) setIdType(s.idType);
    if (s.idNumber) setIdNumber(s.idNumber);
    if (s.idConfirmed) setIdConfirmed(s.idConfirmed);
    setSessionLoaded(true);

    if (user?.kycStatus && !["pending", "not_submitted"].includes(user.kycStatus)) {
      setDataLoading(true);
      fetchClientData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;
    persistSession({ idType, idNumber, idConfirmed });
  }, [idType, idNumber, idConfirmed, sessionLoaded]);

  function handleResubmit() {
    setSelfieImage(null);
    setIdType("");
    setIdNumber("");
    setIdConfirmed(false);
    setFrontFile(null);
    setBackFile(null);
    setVideoUrl(null);
    setClientData(prev => prev ? { ...prev, kycStatus: "pending" } : null);
    setUser({ ...user!, kycStatus: "not_submitted" });
    localStorage.removeItem(KYC_SESSION_KEY);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    setUploadStage("uploading");
    setUploadProgress({ selfie: 0, idFront: 0, idBack: 0, video: 0 });
    try {
      const selfieBlob = dataUrlToBlob(selfieImage!);
      const videoBlob = await fetch(videoUrl!).then(r => r.blob());
      const videoFilename = videoBlob.type.includes("mp4") ? "self-declaration.mp4" : "self-declaration.webm";
      const [optimizedSelfie, optimizedFront, optimizedBack] = await Promise.all([
        optimizeKycImage(selfieBlob, "live-selfie.jpg", 1280, 0.8),
        optimizeKycImage(frontFile!.rawFile, frontFile!.name),
        optimizeKycImage(backFile!.rawFile, backFile!.name),
      ]);

      const [liveSelfie, governmentIdFront, governmentIdBack, selfDeclarationVideo] = await Promise.all([
        uploadKycAsset("selfie", optimizedSelfie.blob, optimizedSelfie.filename, value =>
          setUploadProgress(prev => ({ ...prev, selfie: value }))),
        uploadKycAsset("id_front", optimizedFront.blob, optimizedFront.filename, value =>
          setUploadProgress(prev => ({ ...prev, idFront: value }))),
        uploadKycAsset("id_back", optimizedBack.blob, optimizedBack.filename, value =>
          setUploadProgress(prev => ({ ...prev, idBack: value }))),
        uploadKycAsset("declaration_video", videoBlob, videoFilename, value =>
          setUploadProgress(prev => ({ ...prev, video: value }))),
      ]);

      setUploadStage("finalizing");

      const response = await appClient.post("/api/auth/submit-kyc", {
        governmentIdType: idType,
        governmentIdNumber: idNumber,
        liveSelfie,
        governmentIdFront,
        governmentIdBack,
        selfDeclarationVideo,
      });
      if (!response.data?.status) {
        throw new Error(response.data?.message || "KYC submission failed.");
      }

      localStorage.removeItem(KYC_SESSION_KEY);
      await fetchClientData(false);
      setUser({ ...user!, kycStatus: "under_review" });
      setClientData(prev => prev ?? {
        _id: user!._id,
        email: user!.email ?? "",
        kycStatus: "under_review",
        kycVerification: null,
        notes: null,
      });
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadStage("idle");
    }
  }

  const overallUploadProgress = Math.round(
    (uploadProgress.selfie + uploadProgress.idFront + uploadProgress.idBack + uploadProgress.video) / 4,
  );

  const completed: Record<StepId, boolean> = {
    1: !!selfieImage,
    2: idConfirmed,
    3: !!frontFile,
    4: !!backFile,
    5: !!videoUrl,
  };
  const allDone = STEP_ORDER.every(s => completed[s]);
  const currentStep = STEP_ORDER.find(s => !completed[s]) ?? 5;
  const doneCount = STEP_ORDER.filter(s => completed[s]).length;

  return (
    <div className="min-h-screen bg-[#EEF3FB] p-6 sm:p-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#071F55] sm:text-[26px]">KYC Verification</h1>
            {!showForm && <KycStatusBadge status={kycStatus} />}
          </div>
          <p className="mt-1.5 text-sm text-[#405981]">
            {showForm
              ? "Complete the steps below to verify your identity. This helps us keep your account secure."
              : "Track the status of your identity verification below."}
          </p>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border border-[#dce7f5] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(7,31,85,0.04)] sm:flex-shrink-0">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1D4ED8]" />
          <p className="text-xs leading-relaxed text-[#405981]">
            Your information is <span className="font-bold text-[#1D4ED8]">100% secure</span> and encrypted
          </p>
        </div>
      </div>

      {dataLoading ? (
        <div className="mt-16 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1D4ED8]" />
          <p className="text-sm text-[#405981]">Loading your KYC status…</p>
        </div>
      ) : !showForm ? (
        <div className="mt-8">
          {kycStatus === "approved" && clientData && (
            <KycApprovedView clientData={clientData} onRefresh={() => fetchClientData()} refreshing={refreshing} />
          )}
          {kycStatus === "under_review" && clientData && (
            <KycUnderReviewView clientData={clientData} onRefresh={() => fetchClientData()} refreshing={refreshing} />
          )}
          {kycStatus === "rejected" && clientData && (
            <KycRejectedView clientData={clientData} onRefresh={() => fetchClientData()} refreshing={refreshing} onResubmit={handleResubmit} />
          )}
          {!clientData && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-sm text-[#405981]">Could not load your KYC details.</p>
              <button
                onClick={() => fetchClientData()}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-[#dce7f5] bg-white px-4 py-2.5 text-sm font-bold text-[#1D4ED8] transition-colors hover:bg-[#f0f5ff] disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Retry
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mt-8">
            <StepIndicator completed={completed} currentStep={currentStep} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StepCard number={1} title="Live Selfie" description="Take a clear live selfie. Make sure your face is well-lit and visible.">
              <SelfieStep image={selfieImage} onCaptured={setSelfieImage} />
            </StepCard>

            <StepCard number={2} title="Government ID Number" description="Enter your government ID number exactly as it appears on your ID.">
              <GovIdStep idType={idType} value={idNumber} confirmed={idConfirmed} onIdTypeChange={setIdType} onChange={setIdNumber} onConfirm={() => setIdConfirmed(true)} />
            </StepCard>

            <StepCard number={3} title="Government ID Front" description="Upload a clear photo of the front side of your government ID.">
              <UploadStep label="Front" file={frontFile} onFileSelected={setFrontFile} />
            </StepCard>

            <StepCard number={4} title="Government ID Back" description="Upload a clear photo of the back side of your government ID.">
              <UploadStep label="Back" file={backFile} onFileSelected={setBackFile} />
            </StepCard>

            <StepCard number={5} title="Self Declaration Video" description="Record a short video of yourself reading the declaration aloud.">
              <VideoStep videoUrl={videoUrl} onRecorded={setVideoUrl} />
            </StepCard>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-[#8da3c4]">
              {doneCount} of {STEP_ORDER.length} steps completed
            </p>
            {allDone && (
              <div className="flex flex-col items-end gap-2">
                {submitError && (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" /> {submitError}
                  </p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2.5 rounded-xl bg-[#1D4ED8] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(29,78,216,0.3)] transition-colors hover:bg-[#1a44c2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {submitting ? "Uploading & Submitting…" : "Submit KYC"}
                  {!submitting && <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
          {submitting && (
            <div className="relative mt-4 overflow-hidden rounded-[22px] border border-white/70 bg-[linear-gradient(135deg,#061A43_0%,#0A3475_52%,#1264D9_100%)] p-[1px] shadow-[0_22px_55px_rgba(7,31,85,0.24)]">
              <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-blue-400/25 blur-3xl" />

              <div className="relative rounded-[21px] bg-[linear-gradient(135deg,rgba(5,22,55,0.98),rgba(8,45,101,0.95))] p-5 backdrop-blur-xl sm:p-6">
                <div className="flex items-center gap-4">
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                    <span className="absolute inset-1.5 animate-pulse rounded-xl bg-cyan-300/10" />
                    {uploadStage === "finalizing"
                      ? <ShieldCheck className="relative h-5 w-5 text-cyan-200" />
                      : <Loader2 className="relative h-5 w-5 animate-spin text-cyan-200" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-bold tracking-wide text-white">
                          {uploadStage === "finalizing" ? "Finalizing" : "Uploading"}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-blue-100/60">
                          {uploadStage === "finalizing" ? "Securing your verification submission" : "Secure identity document transfer"}
                        </p>
                      </div>
                      <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 font-mono text-[13px] font-bold tabular-nums text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                        {uploadStage === "finalizing" ? 100 : overallUploadProgress}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative mt-5 h-3 overflow-hidden rounded-full border border-white/10 bg-black/25 p-[2px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]">
                  <div
                    className="relative h-full overflow-hidden rounded-full bg-[linear-gradient(90deg,#38BDF8_0%,#60A5FA_48%,#A5F3FC_100%)] shadow-[0_0_20px_rgba(56,189,248,0.7)] transition-[width] duration-500 ease-out"
                    style={{ width: `${uploadStage === "finalizing" ? 100 : overallUploadProgress}%` }}
                  >
                    <span className="absolute inset-y-0 right-0 w-14 animate-pulse bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px]" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[
                    ["Selfie", uploadProgress.selfie],
                    ["ID Front", uploadProgress.idFront],
                    ["ID Back", uploadProgress.idBack],
                    ["Video", uploadProgress.video],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[10.5px] font-semibold text-blue-100/65">{label}</span>
                        <span className="font-mono text-[10.5px] font-bold tabular-nums text-cyan-100">{value}%</span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/25">
                        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-200 transition-[width] duration-500" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-[9.5px] font-semibold uppercase tracking-[0.14em] text-blue-100/40">
                  <span>Encrypted transfer</span>
                  <span>{uploadStage === "finalizing" ? "Verification queued" : "In progress"}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Important information banner */}
      <div className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#e3edfb] to-[#eef3fb] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/70">
            <ShieldCheck className="h-4 w-4 text-[#1D4ED8]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#071F55]">Important Information</p>
            <ul className="mt-2 space-y-1">
              {[
                "All documents must be valid and clearly visible",
                "Information must match your registered details",
                "KYC verification usually takes 1–2 business days",
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-[#405981]">
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[#8da3c4]" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-6 hidden items-end gap-1 opacity-25 sm:flex">
          <Building2 className="h-12 w-12 text-[#1D4ED8]" />
          <Building2 className="h-16 w-16 text-[#1D4ED8]" />
          <Building2 className="h-10 w-10 text-[#1D4ED8]" />
        </div>
        <div className="absolute bottom-4 right-12 hidden h-12 w-12 items-center justify-center rounded-full bg-[#1D4ED8]/15 sm:flex">
          <Lock className="h-5 w-5 text-[#1D4ED8]" />
        </div>
      </div>
    </div>
  );
}
