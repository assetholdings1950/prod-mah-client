"use client";

import { useState } from "react";
import { CreditCard, Check } from "lucide-react";
import { GOV_ID_TYPES, type GovIdType } from "@/interface/kyc";
import { ErrorNote, OutlineButton } from "./shared-ui";

export function GovIdStep({ idType, value, confirmed, onIdTypeChange, onChange, onConfirm }: {
  idType: GovIdType;
  value: string;
  confirmed: boolean;
  onIdTypeChange: (t: GovIdType) => void;
  onChange: (v: string) => void;
  onConfirm: () => void;
}) {
  console.log({ idType, value })
  const [errors, setErrors] = useState<{ idType?: string; value?: string }>({});

  function handleContinue() {
    const errs: { idType?: string; value?: string } = {};
    if (!idType) errs.idType = "Please select an ID type.";
    if (value.trim().length < 4) errs.value = "Enter a valid ID number (at least 4 characters).";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onConfirm();
  }

  return (
    <>
      <div className="w-full">
        <label className="mb-1.5 block text-xs font-semibold text-[#071F55]">
          ID Type<span className="ml-0.5 text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {GOV_ID_TYPES.map(type => (
            <button
              key={type}
              type="button"
              disabled={confirmed}
              onClick={() => { onIdTypeChange(type); setErrors(p => ({ ...p, idType: "" })); }}
              className={[
                "rounded-lg border px-2.5 py-1.5 text-left text-[11.5px] font-semibold transition-colors disabled:cursor-not-allowed",
                idType === type
                  ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                  : confirmed
                    ? "border-[#dce7f5] bg-[#f8fafd] text-[#8da3c4]"
                    : "border-[#dce7f5] bg-white text-[#405981] hover:border-[#1D4ED8]/50 hover:bg-[#f0f5ff]",
              ].join(" ")}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.idType && <ErrorNote message={errors.idType} />}
      </div>

      <div className="mt-3 w-full">
        <label className="mb-1.5 block text-xs font-semibold text-[#071F55]">
          ID Number<span className="ml-0.5 text-red-500">*</span>
        </label>
        <div className={`flex h-11 items-center rounded-xl border bg-white px-3.5 ${confirmed ? "border-emerald-300" : errors.value ? "border-red-300 bg-red-50/40" : "border-[#dce7f5]"}`}>
          <CreditCard className="h-4 w-4 flex-shrink-0 text-[#8da3c4]" />
          <input
            type="text"
            value={value}
            disabled={confirmed}
            onChange={e => { onChange(e.target.value); setErrors(p => ({ ...p, value: "" })); }}
            placeholder={idType ? `Enter ${idType} number` : "Select ID type first"}
            className="ml-2.5 w-full bg-transparent text-sm text-[#071F55] placeholder:text-[#9aacc9] focus:outline-none disabled:text-[#405981]"
          />
          {confirmed && <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" />}
        </div>
        {errors.value && <ErrorNote message={errors.value} />}
      </div>

      <div className="mt-5 w-full">
        {confirmed ? (
          <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 px-4 py-2.5 text-center">
            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
              <Check className="h-4 w-4" /> ID details saved
            </div>
            <p className="text-[11px] text-emerald-600">{idType} · {value}</p>
          </div>
        ) : (
          <OutlineButton onClick={handleContinue}>Continue</OutlineButton>
        )}
      </div>
    </>
  );
}
