import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ identifier: string }> }) {
    try {
        const { identifier } = await params;
        const body = await req.json();
        const client = await authClient();
        const response = await client.post(`/client/bonds/${encodeURIComponent(identifier)}/invest`, body);
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(err.response?.data ?? { status: false, message: "Failed to create bond investment." }, { status: err.response?.status ?? 500 });
    }
}
