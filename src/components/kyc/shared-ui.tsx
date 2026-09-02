"use client";

import { Check, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { STEP_ORDER, STEP_LABELS, type StepId } from "@/interface/kyc";

export function StepIndicator({ completed, currentStep }: { completed: Record<StepId, boolean>; currentStep: StepId }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[640px] items-start sm:min-w-0">
        {STEP_ORDER.map((step, idx) => {
          const isDone = completed[step];
          const isActive = step === currentStep;
          return (
            <div key={step} className="flex flex-1 items-start">
              <div className="flex flex-col items-center gap-2">
                <div className={[
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold transition-colors",
                  isDone ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                    : isActive ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                      : "border-[#dce7f5] bg-white text-[#8da3c4]",
                ].join(" ")}>
                  {isDone ? <Check className="h-4 w-4" /> : step}
                </div>
                <span className={`max-w-[110px] text-center text-[11.5px] font-semibold leading-tight ${isActive || isDone ? "text-[#071F55]" : "text-[#8da3c4]"}`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
              {idx < STEP_ORDER.length - 1 && (
                <div className={`mt-[18px] h-[2px] flex-1 ${isDone ? "bg-[#1D4ED8]" : "bg-[#dce7f5]"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StepCard({ number, title, description, children }: {
  number: StepId; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#dce7f5] bg-white p-5 shadow-[0_2px_12px_rgba(7,31,85,0.04)]">
      <h3 className="text-sm font-bold text-[#071F55]">{number}. {title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-[#405981]">{description}</p>
      <div className="mt-5 flex flex-1 flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 w-full space-y-2">
      {items.map(item => (
        <li key={item} className="flex items-center gap-2 text-xs text-[#405981]">
          <Check className="h-3.5 w-3.5 flex-shrink-0 rounded-full bg-[#1D4ED8] p-[2px] text-white" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(29,78,216,0.25)] transition-colors hover:bg-[#1a44c2] disabled:cursor-not-allowed disabled:opacity-50">
      {children}
    </button>
  );
}

export function OutlineButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1D4ED8] px-4 py-2.5 text-sm font-bold text-[#1D4ED8] transition-colors hover:bg-[#f0f5ff] disabled:cursor-not-allowed disabled:opacity-50">
      {children}
    </button>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
      <AlertCircle className="h-3 w-3" /> {message}
    </p>
  );
}

export function KycStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    approved:      { label: "Approved",      className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    under_review:  { label: "Under Review",  className: "bg-amber-100 text-amber-700 border-amber-200" },
    rejected:      { label: "Rejected",      className: "bg-red-100 text-red-700 border-red-200" },
    pending:       { label: "Pending",       className: "bg-[#f0f5ff] text-[#405981] border-[#dce7f5]" },
    not_submitted: { label: "Not Submitted", className: "bg-[#f0f5ff] text-[#405981] border-[#dce7f5]" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${s.className}`}>
      {status === "approved" && <CheckCircle className="h-3 w-3" />}
      {status === "under_review" && <Clock className="h-3 w-3" />}
      {status === "rejected" && <XCircle className="h-3 w-3" />}
      {s.label}
    </span>
  );
}
