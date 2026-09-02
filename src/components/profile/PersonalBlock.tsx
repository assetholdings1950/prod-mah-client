"use client";

import { Phone } from "lucide-react";
import type { ClientProfile, FormState } from "./types";
import { Cell, Block, inputCls, Field } from "./ui";
import { fmt, fmtDate, cap } from "./helpers";

interface Props {
  profile: ClientProfile;
  editMode: boolean;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

export function PersonalBlock({ profile, editMode, form, setForm }: Props) {
  return (
    <Block index="01" title="Personal information" hint="Your identity details on file.">
      {editMode ? (
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="First name">
            <input
              className={inputCls()} value={form.firstName} placeholder="First name"
              onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
            />
          </Field>
          <Field label="Last name">
            <input
              className={inputCls()} value={form.lastName} placeholder="Last name"
              onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date" className={inputCls()} value={form.dateOfBirth}
              onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))}
            />
          </Field>
          <Field label="Gender">
            <select
              className={inputCls()} value={form.gender}
              onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Prefer not to say</option>
            </select>
          </Field>
          <Field label="Nationality">
            <input
              className={inputCls()} value={form.nationality} placeholder="e.g. Singaporean"
              onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))}
            />
          </Field>
          <Field label="Phone number">
            <input
              type="tel" className={inputCls()} value={form.phoneNumber} placeholder="10-digit phone number"
              maxLength={10}
              onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
            />
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          <Cell label="First name" value={fmt(profile.firstName)} />
          <Cell label="Last name" value={fmt(profile.lastName)} />
          <Cell label="Date of birth" value={fmtDate(profile.dateOfBirth)} />
          <Cell label="Gender" value={fmt(cap(profile.gender))} />
          <Cell label="Nationality" value={fmt(profile.nationality)} />
          <Cell label="Phone" icon={<Phone className="h-3 w-3 text-slate-300" />} value={fmt(profile.phoneNumber)} />
        </div>
      )}
    </Block>
  );
}
