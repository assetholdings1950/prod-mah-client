"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import appClient from "@/lib/appClient";
import type { InvestmentPlanInterface } from "@/interface/investmentPlan";
import { parsePlan, parsePlanList } from "./planDetailConfig";
import PlanInfoPanel from "./PlanInfoPanel";
import InvestmentPanel from "./InvestmentPanel";
import FundTrustReports from "@/components/funds/FundTrustReports";

export function Skeleton() {
    return (
        <div className="min-h-screen bg-[#EEF3FB]">
            <div className="border-b border-[#E2E8F0] bg-white px-6 py-5 sm:px-8">
                <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-6">
                        <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-slate-200" />
                        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
                        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
                    </div>
                    <div className="h-[520px] animate-pulse rounded-2xl bg-slate-100" />
                </div>
            </div>
        </div>
    );
}

function PlanDetailContent() {
    const { slug } = useParams<{ slug: string }>();
    const searchParams = useSearchParams();
    const id = searchParams.get("id") ?? undefined;

    const [plan, setPlan] = useState<InvestmentPlanInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlan = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            if (id) {
                const res = await appClient.get("/api/investment-plans/get", { params: { id } });
                const p = parsePlan(res.data);
                if (p) { setPlan(p); return; }
            }
            const decoded = decodeURIComponent(slug);
            const res = await appClient.get("/api/investment-plans/get", {
                params: { page: 1, limit: 100, search: decoded, status: "active" },
            });
            const list = parsePlanList(res.data);
            const found = list.find(x => x.slug === decoded || x.slug === slug || x._id === id) ?? list[0] ?? null;
            setPlan(found);
            if (!found) setError("This investment plan could not be found.");
        } catch {
            setError("Could not load this investment plan right now.");
        } finally {
            setLoading(false);
        }
    }, [id, slug]);

    useEffect(() => { void fetchPlan(); }, [fetchPlan]);

    if (loading) return <Skeleton />;

    if (!plan) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#EEF3FB] px-4">
                <div className="max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
                    <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />
                    <h1 className="mt-5 text-xl font-bold text-[#0F172A]">Plan not found</h1>
                    <p className="mt-2 text-sm text-slate-500">{error ?? "Return to Browse Plans and choose another."}</p>
                    <Link href="/investments" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B2E84] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#082461]">
                        <ArrowLeft className="h-4 w-4" /> Browse Plans
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EEF3FB]">

            {/* Breadcrumb header */}
            <div className="border-b border-[#E2E8F0] bg-white px-6 py-4 sm:px-8">
                <div className="flex items-center gap-2 text-[13px]">
                    <Link href="/investments" className="flex items-center gap-1.5 font-semibold text-[#0B2E84] hover:underline">
                        <ArrowLeft className="h-3.5 w-3.5" /> Browse Plans
                    </Link>
                    <span className="text-[#0F172A]/30">/</span>
                    <span className="font-semibold text-[#0F172A]/60 line-clamp-1">{plan.name}</span>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
                <div className="grid gap-7 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
                    <PlanInfoPanel plan={plan} />
                    <InvestmentPanel plan={plan} />
                </div>

                <div className="mt-8">
                    <FundTrustReports fundId={plan._id} fundSlug={plan.slug} />
                </div>
            </div>
        </div>
    );
}

export default function PlanDetailContentWithSuspense() {
    return (
        <Suspense fallback={<Skeleton />}>
            <PlanDetailContent />
        </Suspense>
    );
}
