import { Timer } from "lucide-react";
import { padTime } from "@/utils/walletHelpers";

export const TIMER_TOTAL = 12 * 60; // 720 seconds

export function DepositTimer({ seconds }: { seconds: number }) {
    const pct = (seconds / TIMER_TOTAL) * 100;
    const urgent   = seconds < 120;
    const critical = seconds < 60;
    const color = critical ? "text-rose-600" : urgent ? "text-amber-600" : "text-slate-500";
    const bar   = critical ? "bg-rose-500"   : urgent ? "bg-amber-500"   : "bg-[#1e3a5f]";

    return (
        <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3 py-1.5">
            <Timer className={`h-3.5 w-3.5 ${color}`} />
            <span className={`text-[13px] font-semibold tabular-nums ${color}`}>
                {padTime(Math.floor(seconds / 60))}:{padTime(seconds % 60)}
            </span>
            <span className="h-1 w-14 overflow-hidden rounded-full bg-slate-100">
                <span className={`block h-full rounded-full transition-all duration-1000 ${bar}`} style={{ width: `${pct}%` }} />
            </span>
        </div>
    );
}
