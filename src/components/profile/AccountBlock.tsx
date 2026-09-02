"use client";

import { BadgeCheck, Calendar, Hash, Mail, UserCircle } from "lucide-react";
import type { ClientProfile } from "./types";
import { Cell, Block } from "./ui";
import { KYC } from "./config";
import { cap } from "./helpers";

interface Props {
  profile: ClientProfile;
  memberSince: string;
}

export function AccountBlock({ profile, memberSince }: Props) {
  const kyc = KYC[profile.kycStatus] ?? KYC.pending;
  return (
    <Block index="04" title="Account & advisory" hint="Read-only records and your manager.">
      <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        <Cell
          label="Email"
          icon={<Mail className="h-3 w-3 text-slate-300" />}
          value={
            <span className="inline-flex items-center gap-2">
              {profile.email}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                Locked
              </span>
            </span>
          }
        />
        {profile.clientId && (
          <Cell
            label="Client ID"
            icon={<Hash className="h-3 w-3 text-slate-300" />}
            value={<span className="font-mono text-[14px]">{profile.clientId}</span>}
          />
        )}
        <Cell
          label="KYC status"
          value={
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ring-1 ring-inset ${kyc.bg} ${kyc.ring} ${kyc.text}`}>
              <BadgeCheck className="h-3 w-3" />{kyc.label}
            </span>
          }
        />
        <Cell label="Member since" icon={<Calendar className="h-3 w-3 text-slate-300" />} value={memberSince} />
        <Cell
          label="Account status"
          value={
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ring-1 ring-inset ${
              profile.status === "active"
                ? "bg-teal-50 text-teal-700 ring-teal-200/70"
                : "bg-slate-100 text-slate-600 ring-slate-200"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${profile.status === "active" ? "bg-teal-500" : "bg-slate-400"}`} />
              {cap(profile.status)}
            </span>
          }
        />
      </div>

      {profile.agent && (
        <div className="mt-9 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_16px_-10px_rgba(14,31,61,0.25)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0e1f3d]">
            <UserCircle className="h-6 w-6 text-white/85" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Relationship manager</p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#0e1f3d]">
              {[profile.agent.firstName, profile.agent.lastName].filter(Boolean).join(" ") || "—"}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="flex items-center gap-1 text-[12.5px] text-slate-400">
                <Mail className="h-3 w-3" />{profile.agent.email}
              </span>
              {profile.agent.agentId && (
                <span className="font-mono text-[11px] text-slate-300">{profile.agent.agentId}</span>
              )}
            </div>
          </div>
          <span className="hidden shrink-0 rounded-full bg-[#1e3a5f]/8 px-3 py-1 text-[11px] font-semibold text-[#1e3a5f] sm:inline">
            Assigned
          </span>
        </div>
      )}
    </Block>
  );
}
