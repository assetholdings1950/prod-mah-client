import { Clock, CheckCircle2, XCircle } from "lucide-react";

export function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
    const map = {
        pending:  "bg-amber-50 text-amber-700 ring-amber-200/70",
        approved: "bg-teal-50 text-teal-700 ring-teal-200/70",
        rejected: "bg-rose-50 text-rose-700 ring-rose-200/70",
    };
    const icons = {
        pending:  <Clock className="h-3 w-3" />,
        approved: <CheckCircle2 className="h-3 w-3" />,
        rejected: <XCircle className="h-3 w-3" />,
    };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${map[status]}`}>
            {icons[status]}{status}
        </span>
    );
}
