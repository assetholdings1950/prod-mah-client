import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const client = await authClient();
        const backendRes = await client.get(BACKEND_ENDPOINTS.clients.getById(id));
        return NextResponse.json(backendRes.data, { status: backendRes.status || 200 });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { status: false, message: "Failed to fetch client data." },
            { status: err.response?.status ?? 500 }
        );
    }
}
