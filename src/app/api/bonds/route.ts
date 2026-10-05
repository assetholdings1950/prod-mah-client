import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const params: Record<string, string> = {};
        for (const key of ["page", "limit", "search", "riskLevel", "couponFrequency", "term"]) {
            const value = searchParams.get(key);
            if (value) params[key] = value;
        }
        const client = await authClient();
        const response = await client.get("/client/bonds", { params });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(err.response?.data ?? { status: false, message: "Failed to load bonds." }, { status: err.response?.status ?? 500 });
    }
}
