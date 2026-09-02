import apiClient from "@/lib/apiClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const fundId = request.nextUrl.searchParams.get("fundId")?.trim();
    const fundSlug = request.nextUrl.searchParams.get("fundSlug")?.trim();
    const limit = request.nextUrl.searchParams.get("limit")?.trim() || "12";
    const params: Record<string, string> = { limit };
    if (fundId) params.fundId = fundId;
    if (fundSlug) params.fundSlug = fundSlug;

    try {
        const response = await apiClient.get(BACKEND_ENDPOINTS.fundTrustReports.public, { params });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to fetch published fund trust reports." },
            { status: err.response?.status ?? 500 },
        );
    }
}
