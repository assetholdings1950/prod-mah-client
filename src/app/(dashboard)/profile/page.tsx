"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Check, Edit2, Loader2, Mail, X, AlertCircle, BadgeCheck } from "lucide-react";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import type { ClientProfile, FormState } from "@/components/profile/types";
import { EMPTY_FORM } from "@/components/profile/types";
import { KYC, RISK } from "@/components/profile/config";
import { uploadToCloudinary } from "@/components/profile/upload";
import { initials, displayName } from "@/components/profile/helpers";
import { PersonalBlock } from "@/components/profile/PersonalBlock";
import { AddressBlock } from "@/components/profile/AddressBlock";
import { InvestmentBlock } from "@/components/profile/InvestmentBlock";
import { AccountBlock } from "@/components/profile/AccountBlock";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await appClient.get(`/api/clients/${user._id}`);
      const data: ClientProfile = res.data?.profile?.data ?? res.data?.data ?? res.data;
      setProfile(data);
    } catch {
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  function enterEdit() {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? "", lastName: profile.lastName ?? "",
      phoneNumber: profile.phoneNumber ?? "", dateOfBirth: profile.dateOfBirth ?? "",
      gender: profile.gender ?? "", nationality: profile.nationality ?? "",
      country: profile.country ?? "", countryCode: profile.countryCode ?? "", city: profile.city ?? "",
      address: profile.address ?? "", postalCode: profile.postalCode ?? "",
      preferredCurrency: profile.preferredCurrency ?? "USD",
      riskProfile: profile.riskProfile ?? "moderate",
      profileImage: profile.profileImage ?? "",
    });
    setAvatarFile(null);
    setAvatarPreview("");
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
    setAvatarFile(null);
    setAvatarPreview("");
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!profile || !user?._id) return;
    setSaving(true);
    try {
      let imageUrl = form.profileImage;
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          const name = (profile.firstName || profile.fullName || "client")
            .toLowerCase().replace(/[^a-z0-9]/g, "");
          imageUrl = await uploadToCloudinary(avatarFile, user._id, name);
        } finally { setUploadingAvatar(false); }
      }
      const payload = { _id: profile._id, ...form, profileImage: imageUrl };
      const res = await appClient.post("/api/clients/update", payload);
      const updated: ClientProfile = res.data?.client ?? { ...profile, ...payload };
      setProfile(updated);
      setUser({
        ...user,
        firstName: updated.firstName ?? undefined,
        lastName: updated.lastName ?? undefined,
        fullName: updated.fullName ?? undefined,
        profileImage: updated.profileImage ?? undefined,
        phoneNumber: updated.phoneNumber ?? undefined,
        dateOfBirth: updated.dateOfBirth ?? undefined,
        gender: updated.gender ?? undefined,
        nationality: updated.nationality ?? undefined,
        country: updated.country ?? undefined,
        countryCode: updated.countryCode ?? undefined,
        city: updated.city ?? undefined,
        address: updated.address ?? undefined,
        postalCode: updated.postalCode ?? undefined,
        preferredCurrency: updated.preferredCurrency,
        riskProfile: updated.riskProfile,
      });
      toast.success("Profile updated.");
      setEditMode(false);
      setAvatarFile(null);
      setAvatarPreview("");
    } catch {
      toast.error("Failed to save profile.");
    } finally { setSaving(false); }
  }

  // ── Loading / error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fa]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#1e3a5f]" />
          <p className="text-sm text-slate-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fa]">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-7 w-7 text-rose-400" />
          <p className="text-sm font-medium text-slate-500">Could not load profile.</p>
        </div>
      </div>
    );
  }

  const kyc = KYC[profile.kycStatus] ?? KYC.pending;
  const risk = RISK[profile.riskProfile] ?? RISK.moderate;
  const avatarSrc = avatarPreview || profile.profileImage;
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "—";

  const stats: { label: string; value: React.ReactNode }[] = [
    { label: "Client ID", value: profile.clientId || "—" },
    { label: "Member since", value: memberSince },
    { label: "Currency", value: profile.preferredCurrency || "USD" },
    { label: "Risk profile", value: risk.label },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

      {/* ══ COVER HERO ══ */}
      <div className="relative h-44 w-full overflow-hidden bg-[#0e1f3d] sm:h-52">
        <div className="pointer-events-none absolute -top-20 left-[15%] h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-[10%] h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M36 0H0V36" fill="none" stroke="#9ec5f0" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative mx-auto flex h-full max-w-5xl items-start justify-between px-5 pt-6 sm:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Private Client</p>
            <h1 className="mt-1.5 font-serif text-[26px] leading-none text-white sm:text-[30px]">My Profile</h1>
          </div>

          {!editMode ? (
            <button
              onClick={enterEdit}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/15 backdrop-blur transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/15 backdrop-blur transition-colors hover:bg-white/15 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <X className="h-3.5 w-3.5" /> Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0e1f3d] shadow-sm transition-colors hover:bg-slate-100 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {uploadingAvatar ? "Uploading…" : saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">

        {/* ── Identity strip ── */}
        <div className="-mt-14 flex flex-col items-center gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative shrink-0">
            <div className="rounded-full bg-[#f4f6fa] p-1.5">
              <div className="relative h-28 w-28 overflow-hidden rounded-full ring-1 ring-slate-200 sm:h-32 sm:w-32">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#0e1f3d]">
                    <span className="font-serif text-4xl text-white/90">{initials(profile)}</span>
                  </div>
                )}
                {editMode && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none"
                  >
                    <Camera className="h-5 w-5 text-white" />
                    <span className="mt-0.5 text-[10px] font-semibold text-white/90">Change</span>
                  </button>
                )}
              </div>
            </div>
            <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-[3px] border-[#f4f6fa] bg-teal-400" />
          </div>

          <div className="flex-1 pb-1 text-center sm:pb-2 sm:text-left">
            <h2 className="font-serif text-[24px] leading-tight text-[#0e1f3d] sm:text-[27px]">
              {displayName(profile)}
            </h2>
            <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="flex items-center gap-1.5 text-[13px] text-slate-400">
                <Mail className="h-3.5 w-3.5" /> {profile.email}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset ${kyc.bg} ${kyc.ring} ${kyc.text}`}>
                <BadgeCheck className="h-3 w-3" /> KYC · {kyc.label}
              </span>
            </div>
          </div>

          {editMode && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              <Camera className="h-3.5 w-3.5" />
              {avatarFile ? `${avatarFile.name.slice(0, 14)}…` : "Upload photo"}
            </button>
          )}
        </div>

        {/* ── Stat strip ── */}
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200/70 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-5 py-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">{s.label}</p>
              <p className="mt-1.5 text-[16px] font-semibold text-[#0e1f3d]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Detail blocks ── */}
        <div className="mt-14 space-y-14">
          <PersonalBlock profile={profile} editMode={editMode} form={form} setForm={setForm} />
          <AddressBlock profile={profile} editMode={editMode} form={form} setForm={setForm} />
          <InvestmentBlock profile={profile} editMode={editMode} form={form} setForm={setForm} />
          <AccountBlock profile={profile} memberSince={memberSince} />
        </div>
      </div>
    </div>
  );
}
