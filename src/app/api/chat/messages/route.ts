import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const client = await authClient();
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get("clientId") || "";
        const agentId = searchParams.get("agentId") || "";
        const backendRes = await client.get(`/chat/messages`, {
            params: { clientId, agentId },
        });
        return NextResponse.json(backendRes.data, { status: backendRes.status || 200 });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { status: false, message: "Failed to fetch chat messages." },
            { status: err.response?.status ?? 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const client = await authClient();
        const body = await req.json();
        const backendRes = await client.post(`/chat/messages`, body);
        return NextResponse.json(backendRes.data, { status: backendRes.status || 200 });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { status: false, message: "Failed to post chat message." },
            { status: err.response?.status ?? 500 }
        );
    }
}
