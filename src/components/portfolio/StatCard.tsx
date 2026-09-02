"use client";

export function StatCard({ label, value, sub, accent }: {
    label: string; value: string; sub?: string; accent?: boolean;
}) {
    return (
        <div className={`rounded-2xl p-5 ${accent ? "bg-[#0B2E84] text-[#ffffff]" : "bg-white border border-[#E2E8F0]"}`}>
            <p className={`text-[10.5px] font-bold uppercase tracking-[0.09em] ${accent ? "text-[#ffffff]/50" : "text-slate-400"}`}>{label}</p>
            <p className={`mt-2 text-[22px] font-bold leading-none ${accent ? "text-[#ffffff]" : "text-[#0F172A]"}`}>{value}</p>
            {sub && <p className={`mt-1.5 text-[12px] ${accent ? "text-[#ffffff]/60" : "text-slate-500"}`}>{sub}</p>}
        </div>
    );
}

export function InfoRow({ icon, label, value }: {
    icon: React.ReactNode; label: string; value: string;
}) {
    return (
        <div className="grid grid-cols-[20px_1fr_auto] items-center gap-3 border-b border-[#F1F5F9] py-3 text-[13px] last:border-0">
            <span className="text-[#0B2E84]">{icon}</span>
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold text-[#0F172A]">{value}</span>
        </div>
    );
}
