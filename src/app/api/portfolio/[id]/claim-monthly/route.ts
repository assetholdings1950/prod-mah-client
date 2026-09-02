import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body   = await req.json();
        const client = await authClient();
        const res    = await client.post(BACKEND_ENDPOINTS.portfolio.claimMonthly(id), body);
        return NextResponse.json(res.data, { status: res.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to claim monthly interest." },
            { status: err.response?.status ?? 500 }
        );
    }
}
