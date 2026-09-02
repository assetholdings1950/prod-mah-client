import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const client = await authClient();
        const backendRes = await client.post(BACKEND_ENDPOINTS.clients.update, payload);
        return NextResponse.json(backendRes.data, { status: backendRes.status || 200 });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to update profile." },
            { status: err.response?.status ?? 500 }
        );
    }
}
