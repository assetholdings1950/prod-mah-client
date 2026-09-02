import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const params: Record<string, string> = {};
        const forward = ["clientId", "page", "limit", "search", "type", "status", "currency", "startDate", "endDate", "sortBy", "sortOrder"];
        for (const key of forward) {
            const val = searchParams.get(key);
            if (val) params[key] = val;
        }

        const client = await authClient();
        const backendRes = await client.get(BACKEND_ENDPOINTS.transactions.client, { params });
        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to fetch transactions." },
            { status: err.response?.status ?? 500 }
        );
    }
}
