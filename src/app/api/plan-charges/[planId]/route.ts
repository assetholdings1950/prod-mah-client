import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ planId: string }> }
) {
    try {
        const { planId } = await params;
        const client = await authClient();
        const res    = await client.get(BACKEND_ENDPOINTS.planCharges.getByPlanId(planId));
        return NextResponse.json(res.data, { status: res.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to fetch plan charges." },
            { status: err.response?.status ?? 500 }
        );
    }
}
