import PlanDetailContent, { Skeleton } from "@/components/investments/PlanDetailContent";
import { Suspense } from "react";

export default function InvestmentPlanDetailPage() {
    return (
        <Suspense fallback={<Skeleton />}>
            <PlanDetailContent />
        </Suspense>
    );
}
