"use client";

import { Calendar } from "lucide-react";
import { type ClientData, formatDate } from "@/interface/kyc";

type TimelineItem = {
  label: string;
  sublabel?: string;
  date?: string | null;
  by?: string | null;
  status: "done" | "active" | "pending" | "rejected";
};

export function buildTimeline(clientData: ClientData): TimelineItem[] {
  const kyc = clientData.kycVerification;
  const status = clientData.kycStatus;
  const items: TimelineItem[] = [];

  items.push({
    label: "KYC Application Submitted",
    sublabel: "Your documents have been received and queued for review.",
    date: kyc?.submittedAt,
    status: kyc?.submittedAt ? "done" : "pending",
  });

  if (status === "under_review" || status === "approved" || status === "rejected") {
    items.push({
      label: "Under Review",
      sublabel: "Our compliance team is verifying your documents.",
      status: status === "under_review" ? "active" : "done",
    });
  }

  if (status === "approved") {
    const adminName = kyc?.verifiedBy
      ? [kyc.verifiedBy.firstName, kyc.verifiedBy.lastName].filter(Boolean).join(" ")
      : null;
    items.push({
      label: "Identity Verified",
      sublabel: "Your KYC has been approved. You now have full access to the platform.",
      date: kyc?.verifiedAt,
      by: adminName,
      status: "done",
    });
  }

  if (status === "rejected") {
    const adminName = kyc?.verifiedBy
      ? [kyc.verifiedBy.firstName, kyc.verifiedBy.lastName].filter(Boolean).join(" ")
      : null;
    items.push({
      label: "Verification Rejected",
      sublabel: kyc?.remarks ?? "Your documents could not be verified. Please resubmit with corrected documents.",
      date: kyc?.verifiedAt,
      by: adminName,
      status: "rejected",
    });
  }

  if (clientData.notes) {
    items.push({
      label: "Admin Note",
      sublabel: clientData.notes,
      status: "done",
    });
  }

  return items;
}

export function KycTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const dotColor =
          item.status === "done" ? "bg-emerald-500 border-emerald-200"
            : item.status === "active" ? "bg-amber-400 border-amber-200"
              : item.status === "rejected" ? "bg-red-500 border-red-200"
                : "bg-[#dce7f5] border-[#dce7f5]";

        return (
          <div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 ${dotColor}`} />
              {!isLast && <div className="mt-1 w-px flex-1 bg-[#dce7f5]" style={{ minHeight: 28 }} />}
            </div>

            <div className="pb-5">
              <p className={`text-sm font-bold ${item.status === "pending" ? "text-[#8da3c4]" : "text-[#071F55]"}`}>
                {item.label}
              </p>
              {item.sublabel && (
                <p className="mt-0.5 text-xs leading-relaxed text-[#405981]">{item.sublabel}</p>
              )}
              {item.date && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-[#8da3c4]">
                  <Calendar className="h-3 w-3" /> {formatDate(item.date)}
                </p>
              )}
              {item.by && (
                <p className="mt-0.5 text-[11px] text-[#8da3c4]">by {item.by}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
