"use client";

import { CheckCircle, Clock, XCircle, RefreshCw, RotateCcw } from "lucide-react";
import { type ClientData, formatDate } from "@/interface/kyc";
import { KycDocumentsGrid } from "./kyc-documents";
import { KycTimeline, buildTimeline } from "./kyc-timeline";

export function KycApprovedView({ clientData, onRefresh, refreshing }: {
  clientData: ClientData;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const kyc = clientData.kycVerification;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-[#f0fff8] p-5">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-emerald-800">Identity Verified</h2>
          <p className="mt-0.5 text-sm text-emerald-700">
            Your KYC has been approved. You have full access to the platform.
          </p>
          {kyc?.verifiedAt && (
            <p className="mt-1 text-[11px] text-emerald-600">
              Approved on {formatDate(kyc.verifiedAt)}
            </p>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-[#dce7f5] bg-white p-6">
        <h3 className="mb-5 text-sm font-bold text-[#071F55]">Verification Timeline</h3>
        <KycTimeline items={buildTimeline(clientData)} />
      </div>

      {kyc && (
        <div>
          <h3 className="mb-4 text-sm font-bold text-[#071F55]">Submitted Documents</h3>
          <KycDocumentsGrid kyc={kyc} />
        </div>
      )}
    </div>
  );
}

export function KycUnderReviewView({ clientData, onRefresh, refreshing }: {
  clientData: ClientData;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const kyc = clientData.kycVerification;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-[#fffbeb] p-5">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-7 w-7 text-amber-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-amber-800">Under Review</h2>
          <p className="mt-0.5 text-sm text-amber-700">
            Your documents are being verified. This usually takes 1–2 business days.
          </p>
          {kyc?.submittedAt && (
            <p className="mt-1 text-[11px] text-amber-600">
              Submitted on {formatDate(kyc.submittedAt)}
            </p>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Check Status
        </button>
      </div>

      <div className="rounded-2xl border border-[#dce7f5] bg-white p-6">
        <h3 className="mb-5 text-sm font-bold text-[#071F55]">Verification Timeline</h3>
        <KycTimeline items={buildTimeline(clientData)} />
      </div>

      {kyc && (
        <div>
          <h3 className="mb-4 text-sm font-bold text-[#071F55]">Submitted Documents</h3>
          <KycDocumentsGrid kyc={kyc} />
        </div>
      )}
    </div>
  );
}

export function KycRejectedView({ clientData, onRefresh, refreshing, onResubmit }: {
  clientData: ClientData;
  onRefresh: () => void;
  refreshing: boolean;
  onResubmit: () => void;
}) {
  const kyc = clientData.kycVerification;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-[#fff5f5] p-5">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-7 w-7 text-red-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-red-800">Verification Rejected</h2>
          {kyc?.remarks ? (
            <p className="mt-1 text-sm text-red-700">{kyc.remarks}</p>
          ) : (
            <p className="mt-0.5 text-sm text-red-700">
              Your documents could not be verified. Please resubmit with corrected documents.
            </p>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-[#dce7f5] bg-white p-5">
        <div>
          <p className="text-sm font-bold text-[#071F55]">Ready to resubmit?</p>
          <p className="mt-0.5 text-xs text-[#405981]">Address the rejection reason and upload fresh documents.</p>
        </div>
        <button
          onClick={onResubmit}
          className="flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(29,78,216,0.25)] transition-colors hover:bg-[#1a44c2]"
        >
          <RotateCcw className="h-4 w-4" /> Resubmit KYC
        </button>
      </div>

      <div className="rounded-2xl border border-[#dce7f5] bg-white p-6">
        <h3 className="mb-5 text-sm font-bold text-[#071F55]">Verification Timeline</h3>
        <KycTimeline items={buildTimeline(clientData)} />
      </div>

      {kyc && (
        <div>
          <h3 className="mb-4 text-sm font-bold text-[#071F55]">Previously Submitted Documents</h3>
          <KycDocumentsGrid kyc={kyc} />
        </div>
      )}
    </div>
  );
}
