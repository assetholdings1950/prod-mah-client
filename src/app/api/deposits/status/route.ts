import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const id = new URL(req.url).searchParams.get("id") ?? "";
        const client = await authClient();
        const backendRes = await client.get(BACKEND_ENDPOINTS.deposits.getById(id));
        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to fetch deposit status." },
            { status: err.response?.status ?? 500 }
        );
    }
}
