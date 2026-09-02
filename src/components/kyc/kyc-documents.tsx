"use client";

import { User, CreditCard, FileText, Film, Eye, ExternalLink } from "lucide-react";
import { type KycVerification, isVideoUrl } from "@/interface/kyc";

function DocCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-[0_2px_10px_rgba(7,31,85,0.04)]">
      <div className="flex items-center gap-1.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f5ff]">
          {icon}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wide text-[#8da3c4]">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function KycDocumentsGrid({ kyc }: { kyc: KycVerification }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kyc.liveSelfie && (
        <DocCard title="Live Selfie" icon={<User className="h-3.5 w-3.5 text-[#1D4ED8]" />}>
          <div className="flex justify-center">
            <img
              src={kyc.liveSelfie}
              alt="Live selfie"
              className="h-32 w-32 rounded-full object-cover border-2 border-[#dce7f5]"
            />
          </div>
        </DocCard>
      )}

      {(kyc.governmentIdType || kyc.governmentIdNumber) && (
        <DocCard title="Government ID" icon={<CreditCard className="h-3.5 w-3.5 text-[#1D4ED8]" />}>
          <div className="space-y-2">
            {kyc.governmentIdType && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8da3c4] w-12">Type</span>
                <span className="rounded-lg bg-[#f0f5ff] px-2.5 py-1 text-xs font-bold text-[#1D4ED8]">
                  {kyc.governmentIdType}
                </span>
              </div>
            )}
            {kyc.governmentIdNumber && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8da3c4] w-12">Number</span>
                <span className="font-mono text-sm font-semibold text-[#071F55]">
                  {kyc.governmentIdNumber}
                </span>
              </div>
            )}
          </div>
        </DocCard>
      )}

      {kyc.governmentIdFront && (
        <DocCard title="ID Front" icon={<FileText className="h-3.5 w-3.5 text-[#1D4ED8]" />}>
          <div className="relative overflow-hidden rounded-xl bg-[#f8fafd]">
            <img
              src={kyc.governmentIdFront}
              alt="Government ID front"
              className="h-28 w-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <a
              href={kyc.governmentIdFront}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-[#1D4ED8] shadow-sm"
            >
              <ExternalLink className="h-2.5 w-2.5" /> View
            </a>
          </div>
        </DocCard>
      )}

      {kyc.governmentIdBack && (
        <DocCard title="ID Back" icon={<FileText className="h-3.5 w-3.5 text-[#1D4ED8]" />}>
          <div className="relative overflow-hidden rounded-xl bg-[#f8fafd]">
            <img
              src={kyc.governmentIdBack}
              alt="Government ID back"
              className="h-28 w-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <a
              href={kyc.governmentIdBack}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-[#1D4ED8] shadow-sm"
            >
              <ExternalLink className="h-2.5 w-2.5" /> View
            </a>
          </div>
        </DocCard>
      )}

      {kyc.selfDeclarationVideo && (
        <DocCard title="Declaration Video" icon={<Film className="h-3.5 w-3.5 text-[#1D4ED8]" />}>
          {isVideoUrl(kyc.selfDeclarationVideo) ? (
            <video
              src={kyc.selfDeclarationVideo}
              controls
              className="h-28 w-full rounded-xl object-cover"
              playsInline
            />
          ) : (
            <a
              href={kyc.selfDeclarationVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-[#dce7f5] bg-[#f8fafd] px-3 py-4 text-xs font-semibold text-[#1D4ED8] hover:bg-[#f0f5ff]"
            >
              <Eye className="h-4 w-4" /> View Declaration Video
            </a>
          )}
        </DocCard>
      )}
    </div>
  );
}
