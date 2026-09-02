import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const client = await authClient();
        const backendRes = await client.post(BACKEND_ENDPOINTS.withdrawals.create, body);
        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to submit withdrawal request." },
            { status: err.response?.status ?? 500 }
        );
    }
}
