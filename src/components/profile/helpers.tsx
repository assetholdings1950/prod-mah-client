import type { ClientProfile } from "./types";

export function initials(p: ClientProfile | null) {
  if (!p) return "?";
  const f = p.firstName?.[0] ?? "";
  const l = p.lastName?.[0] ?? "";
  if (f || l) return (f + l).toUpperCase();
  return p.email[0].toUpperCase();
}

export function displayName(p: ClientProfile | null) {
  if (!p) return "—";
  return p.fullName || [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email;
}

export const NotProvided = () => (
  <span className="text-slate-300 italic font-normal">Not provided</span>
);

export function fmt(val: string | null | undefined) {
  return val || <NotProvided />;
}

export function fmtDate(val: string | null | undefined) {
  if (!val) return <NotProvided />;
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return val;
  }
}

export function cap(s: string | null | undefined) {
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
