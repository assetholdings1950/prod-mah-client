export const KYC: Record<string, { label: string; dot: string; text: string; bg: string; ring: string }> = {
  approved:     { label: "Verified",     dot: "bg-teal-500",  text: "text-teal-700",  bg: "bg-teal-50",   ring: "ring-teal-200/70"  },
  under_review: { label: "Under review", dot: "bg-sky-500",   text: "text-sky-700",   bg: "bg-sky-50",    ring: "ring-sky-200/70"   },
  rejected:     { label: "Rejected",     dot: "bg-rose-500",  text: "text-rose-700",  bg: "bg-rose-50",   ring: "ring-rose-200/70"  },
  pending:      { label: "Pending",      dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200"    },
};

export const RISK: Record<string, { label: string; tint: string; bar: string; pct: string; note: string }> = {
  conservative: { label: "Conservative", tint: "text-teal-700", bar: "bg-teal-500", pct: "w-1/3",  note: "Low risk · stable returns"  },
  moderate:     { label: "Moderate",     tint: "text-sky-700",  bar: "bg-sky-500",  pct: "w-2/3",  note: "Balanced risk and reward"   },
  aggressive:   { label: "Aggressive",   tint: "text-rose-700", bar: "bg-rose-500", pct: "w-full", note: "High risk · high reward"     },
};
