import apiClient from "@/lib/apiClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword")?.trim();
    const location = searchParams.get("location")?.trim();
    const type = searchParams.get("type")?.trim();

    const params: Record<string, string> = {};
    if (keyword) params.keyword = keyword;
    if (location) params.location = location;
    if (type) params.type = type;

    try {
        const backendRes = await apiClient.get(BACKEND_ENDPOINTS.jobs.list, {
            params,
        });
        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to fetch jobs." },
            { status: err.response?.status ?? 500 }
        );
    }
}
