"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { User, Check, X, Loader2, RotateCcw, Square, AlertCircle } from "lucide-react";
import { PrimaryButton, OutlineButton, Checklist } from "./shared-ui";

function SelfieModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (dataUrl: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<"loading" | "live" | "preview" | "error">("loading");
  const [preview, setPreview] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        setState("live");
      } catch { if (!cancelled) setState("error"); }
    }
    start();
    return () => { cancelled = true; stopStream(); };
  }, [stopStream]);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); ctx.drawImage(video, 0, 0); }
    setPreview(canvas.toDataURL("image/jpeg", 0.92));
    stopStream();
    setState("preview");
  }

  function retake() {
    setPreview(null);
    setState("loading");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then(stream => {
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setState("live");
    }).catch(() => setState("error"));
  }

  function handleClose() { stopStream(); onClose(); }
  function handleConfirm() { if (preview) { onConfirm(preview); onClose(); } }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#dce7f5] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f5ff]">
              <User className="h-3.5 w-3.5 text-[#1D4ED8]" />
            </div>
            <span className="text-sm font-bold text-[#071F55]">Take a Selfie</span>
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
              <span className="text-xs text-white/70">Camera access blocked.<br />Check your browser permissions.</span>
            </div>
          )}
          {(state === "live" || state === "loading") && (
            <video ref={videoRef} muted playsInline className={`h-full w-full scale-x-[-1] object-cover ${state === "loading" ? "opacity-0" : "opacity-100"}`} />
          )}
          {state === "preview" && preview && (
            <img src={preview} alt="Selfie preview" className="h-full w-full object-cover" />
          )}
          {state === "live" && (
            <>
              <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
              </span>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-full border-2 border-white/50" style={{ width: "48%", aspectRatio: "3/4" }} />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 px-5 py-4">
          {state === "live" && (
            <>
              <p className="text-center text-[11px] text-[#405981]">Position your face in the oval and tap capture</p>
              <PrimaryButton onClick={capture}><Square className="h-4 w-4 fill-white" /> Capture Photo</PrimaryButton>
            </>
          )}
          {state === "preview" && (
            <>
              <p className="text-center text-[11px] text-[#405981]">Looking good! Use this photo or retake.</p>
              <div className="flex gap-2">
                <OutlineButton onClick={retake}><RotateCcw className="h-3.5 w-3.5" /> Retake</OutlineButton>
                <PrimaryButton onClick={handleConfirm}><Check className="h-4 w-4" /> Use Photo</PrimaryButton>
              </div>
            </>
          )}
          {state === "error" && <OutlineButton onClick={handleClose}>Close</OutlineButton>}
          {state === "loading" && (
            <div className="flex items-center justify-center py-1 text-xs text-[#8da3c4]">
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Requesting camera access…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SelfieStep({ image, onCaptured }: { image: string | null; onCaptured: (dataUrl: string | null) => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      {modalOpen && <SelfieModal onClose={() => setModalOpen(false)} onConfirm={v => onCaptured(v)} />}
      <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#f0f5ff]">
        {image ? <img src={image} alt="Captured selfie" className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-[#1D4ED8]" />}
      </div>
      {!image && <Checklist items={["Look directly at the camera", "Ensure good lighting", "Remove glasses or hats"]} />}
      {image && (
        <button onClick={() => onCaptured(null)} className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8] hover:underline">
          <RotateCcw className="h-3 w-3" /> Retake selfie
        </button>
      )}
      <div className="mt-5 w-full">
        {image ? (
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
            <Check className="h-4 w-4" /> Selfie captured
          </div>
        ) : (
          <PrimaryButton onClick={() => setModalOpen(true)}>Start Selfie</PrimaryButton>
        )}
      </div>
    </>
  );
}
