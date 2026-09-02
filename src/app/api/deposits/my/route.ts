import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page   = searchParams.get("page")   ?? "1";
        const limit  = searchParams.get("limit")  ?? "20";
        const status = searchParams.get("status"); // "pending" | "approved" | "rejected" | null (all)

        const params: Record<string, string> = { page, limit };
        if (status) params.status = status;

        const client = await authClient();
        const backendRes = await client.get(BACKEND_ENDPOINTS.deposits.my, { params });
        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to fetch deposits." },
            { status: err.response?.status ?? 500 }
        );
    }
}
