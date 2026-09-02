import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const params: Record<string, string> = {};
        ["status", "category", "investmentMode", "page", "limit"].forEach(k => {
            const v = searchParams.get(k);
            if (v) params[k] = v;
        });
        const client = await authClient();
        const res    = await client.get("/portfolio/my", { params });
        return NextResponse.json(res.data, { status: res.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to fetch portfolios." },
            { status: err.response?.status ?? 500 }
        );
    }
}
