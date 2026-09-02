"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Video, Check, X, Loader2, RotateCcw, Square, AlertCircle, FileText } from "lucide-react";
import { MAX_RECORDING_SECONDS, DECLARATION_TEXT } from "@/interface/kyc";
import { PrimaryButton, OutlineButton, Checklist } from "./shared-ui";

function VideoModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (url: string) => void }) {
  const liveRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<"loading" | "ready" | "recording" | "preview" | "error">("loading");
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280, max: 1280 },
            height: { ideal: 720, max: 720 },
            frameRate: { ideal: 24, max: 24 },
          },
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (liveRef.current) { liveRef.current.srcObject = stream; liveRef.current.muted = true; await liveRef.current.play(); }
        setState("ready");
      } catch { if (!cancelled) setState("error"); }
    }
    init();
    return () => { cancelled = true; stopStream(); };
  }, [stopStream]);

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const preferredMimeType = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ].find(type => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(streamRef.current, {
      ...(preferredMimeType ? { mimeType: preferredMimeType } : {}),
      videoBitsPerSecond: 900_000,
      audioBitsPerSecond: 64_000,
    });
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
      setPreviewUrl(URL.createObjectURL(blob));
      stopStream();
      setState("preview");
    };
    recorderRef.current = recorder;
    recorder.start();
    setSeconds(0);
    setState("recording");
    timerRef.current = setInterval(() => {
      setSeconds(s => {
        if (s + 1 >= MAX_RECORDING_SECONDS) recorderRef.current?.stop();
        return s + 1;
      });
    }, 1000);
  }

  function stopRecording() { recorderRef.current?.stop(); }

  async function rerecord() {
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    setState("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280, max: 1280 },
          height: { ideal: 720, max: 720 },
          frameRate: { ideal: 24, max: 24 },
        },
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      if (liveRef.current) { liveRef.current.srcObject = stream; liveRef.current.muted = true; await liveRef.current.play(); }
      setState("ready");
    } catch { setState("error"); }
  }

  function handleConfirm() { if (previewUrl) { onConfirm(previewUrl); onClose(); } }
  function handleClose() { stopStream(); if (previewUrl) URL.revokeObjectURL(previewUrl); onClose(); }

  const elapsed = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const remaining = MAX_RECORDING_SECONDS - seconds;
  const progress = (seconds / MAX_RECORDING_SECONDS) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#dce7f5] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f5ff]">
              <Video className="h-3.5 w-3.5 text-[#1D4ED8]" />
            </div>
            <span className="text-sm font-bold text-[#071F55]">Self Declaration Video</span>
          </div>
          <button onClick={handleClose} className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#f0f5ff]">
            <X className="h-4 w-4 text-[#405981]" />
          </button>
        </div>

        <div className="relative flex items-center justify-center bg-[#0a0f1e]" style={{ aspectRatio: "4/3" }}>
          {state === "loading" && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
              <span className="text-xs text-white/50">Starting camera…</span>
            </div>
          )}
          {state === "error" && (
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <span className="text-xs text-white/70">Camera / microphone access blocked.<br />Check your browser permissions.</span>
            </div>
          )}
          <video ref={liveRef} muted playsInline className={`h-full w-full scale-x-[-1] object-cover ${(state === "ready" || state === "recording") ? "block" : "hidden"}`} />
          {state === "preview" && previewUrl && (
            <video src={previewUrl} controls className="h-full w-full object-cover" playsInline />
          )}
          {state === "recording" && (
            <>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> REC {elapsed}
              </div>
              <span className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white/80">{remaining}s left</span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            </>
          )}
          {state === "ready" && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold text-white/80 whitespace-nowrap">
              Read the declaration below, then press Record
            </div>
          )}
        </div>

        {(state === "ready" || state === "recording") && (
          <div className="mx-5 mt-4 rounded-xl border border-[#dce7f5] bg-[#f8fafd] p-4">
            <div className="mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#1D4ED8]" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#071F55]">Declaration Script</span>
              {state === "recording" && <span className="ml-auto animate-pulse text-[10px] font-semibold text-red-500">● Read aloud</span>}
            </div>
            <p className="text-[12px] leading-relaxed text-[#405981]">&ldquo;{DECLARATION_TEXT}&rdquo;</p>
          </div>
        )}

        <div className="flex flex-col gap-3 px-5 py-4">
          {state === "loading" && (
            <div className="flex items-center justify-center py-1 text-xs text-[#8da3c4]">
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Requesting camera &amp; microphone…
            </div>
          )}
          {state === "ready" && (
            <PrimaryButton onClick={startRecording}>
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Start Recording
            </PrimaryButton>
          )}
          {state === "recording" && (
            <PrimaryButton onClick={stopRecording}><Square className="h-3.5 w-3.5 fill-white" /> Stop Recording</PrimaryButton>
          )}
          {state === "preview" && (
            <>
              <p className="text-center text-[11px] text-[#405981]">Review your recording. Happy with it? Submit or re-record.</p>
              <div className="flex gap-2">
                <OutlineButton onClick={rerecord}><RotateCcw className="h-3.5 w-3.5" /> Re-record</OutlineButton>
                <PrimaryButton onClick={handleConfirm}><Check className="h-4 w-4" /> Use Video</PrimaryButton>
              </div>
            </>
          )}
          {state === "error" && <OutlineButton onClick={handleClose}>Close</OutlineButton>}
        </div>
      </div>
    </div>
  );
}

export function VideoStep({ videoUrl, onRecorded }: { videoUrl: string | null; onRecorded: (url: string | null) => void }) {
  const [modalOpen, setModalOpen] = useState(false);

  function rerecord() {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    onRecorded(null);
  }

  return (
    <>
      {modalOpen && <VideoModal onClose={() => setModalOpen(false)} onConfirm={onRecorded} />}
      <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#f0f5ff]">
        {videoUrl ? <video src={videoUrl} className="h-full w-full object-cover" muted playsInline /> : <Video className="h-10 w-10 text-[#1D4ED8]" />}
      </div>
      {!videoUrl && <Checklist items={["Record in a quiet place", "Speak clearly and slowly", "Ensure good lighting"]} />}
      {videoUrl && (
        <button onClick={rerecord} className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8] hover:underline">
          <RotateCcw className="h-3 w-3" /> Re-record
        </button>
      )}
      <div className="mt-5 w-full">
        {videoUrl ? (
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
            <Check className="h-4 w-4" /> Video recorded
          </div>
        ) : (
          <PrimaryButton onClick={() => setModalOpen(true)}>Start Recording</PrimaryButton>
        )}
      </div>
    </>
  );
}
