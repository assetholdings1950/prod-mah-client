import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ identifier: string }> }) {
    try {
        const { identifier } = await params;
        const client = await authClient();
        const response = await client.get(`/client/bonds/${encodeURIComponent(identifier)}`);
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(err.response?.data ?? { status: false, message: "Failed to load bond." }, { status: err.response?.status ?? 500 });
    }
}
