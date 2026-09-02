import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client  = await authClient();
        const res     = await client.get(`/portfolio/${id}`);
        return NextResponse.json(res.data, { status: res.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to fetch portfolio." },
            { status: err.response?.status ?? 500 }
        );
    }
}
