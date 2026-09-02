import type { ReactNode } from "react";

export function Cell({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="py-1">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
        {icon}{label}
      </p>
      <p className="mt-1.5 text-[15px] font-medium text-[#0e1f3d] leading-snug">{value}</p>
    </div>
  );
}

export function Block({
  index, title, hint, children,
}: {
  index: string; title: string; hint?: string; children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex items-baseline gap-3 border-t border-slate-200 pt-5">
        <span className="font-mono text-[12px] font-semibold text-slate-300">{index}</span>
        <div>
          <h3 className="font-serif text-[19px] text-[#0e1f3d]">{title}</h3>
          {hint && <p className="mt-0.5 text-[12.5px] text-slate-400">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function inputCls() {
  return "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-[#0e1f3d] placeholder:text-slate-300 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/10 transition-colors";
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}
