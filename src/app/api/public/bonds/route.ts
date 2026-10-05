import { NextRequest, NextResponse } from "next/server";
import { BASE_API_URL } from "@/lib/config/apiConfig";

export async function GET(req: NextRequest) {
    try {
        if (!BASE_API_URL) throw new Error("Backend URL is not configured.");
        const { searchParams } = new URL(req.url);
        const params = new URLSearchParams();
        for (const key of ["page", "limit", "search", "riskLevel", "couponFrequency", "term"]) {
            const value = searchParams.get(key);
            if (value) params.set(key, value);
        }
        const response = await fetch(`${BASE_API_URL.replace(/\/$/, "")}/public/bonds?${params.toString()}`, { cache: "no-store" });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json({ status: false, message: error instanceof Error ? error.message : "Failed to load bond offerings." }, { status: 500 });
    }
}
