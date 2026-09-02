"use client";

import { Coins } from "lucide-react";
import type { ClientProfile, FormState } from "./types";
import { Cell, Block, inputCls, Field } from "./ui";
import { RISK } from "./config";

interface Props {
  profile: ClientProfile;
  editMode: boolean;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

const CURRENCIES = ["USD", "EUR", "GBP", "SGD", "AED", "INR", "AUD", "CAD", "JPY"];

export function InvestmentBlock({ profile, editMode, form, setForm }: Props) {
  const risk = RISK[profile.riskProfile] ?? RISK.moderate;
  return (
    <Block index="03" title="Investment preferences" hint="How your portfolio is shaped.">
      {editMode ? (
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
          <Field label="Preferred currency">
            <select
              className={inputCls()} value={form.preferredCurrency}
              onChange={e => setForm(p => ({ ...p, preferredCurrency: e.target.value }))}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Risk profile">
            <select
              className={inputCls()} value={form.riskProfile}
              onChange={e => setForm(p => ({ ...p, riskProfile: e.target.value }))}
            >
              <option value="conservative">Conservative — low risk, stable returns</option>
              <option value="moderate">Moderate — balanced risk/reward</option>
              <option value="aggressive">Aggressive — high risk, high reward</option>
            </select>
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
          <Cell
            label="Preferred currency"
            icon={<Coins className="h-3 w-3 text-slate-300" />}
            value={profile.preferredCurrency || "USD"}
          />
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Risk profile</p>
              <span className={`text-[13px] font-semibold ${risk.tint}`}>{risk.label}</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
              <div className={`h-full rounded-full ${risk.bar} ${risk.pct}`} />
            </div>
            <p className="mt-2 text-[12px] text-slate-400">{risk.note}</p>
          </div>
        </div>
      )}
    </Block>
  );
}
