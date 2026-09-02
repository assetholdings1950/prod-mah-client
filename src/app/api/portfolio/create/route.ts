import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body   = await req.json();
        const client = await authClient();
        const res    = await client.post("/portfolio/create", body);
        return NextResponse.json(res.data, { status: res.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to create portfolio." },
            { status: err.response?.status ?? 500 }
        );
    }
}
