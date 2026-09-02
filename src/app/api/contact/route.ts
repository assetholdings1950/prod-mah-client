import apiClient from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const backendRes = await apiClient.post(API_ENDPOINTS.contact, body);
        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Failed to submit contact form." },
            { status: err.response?.status ?? 500 }
        );
    }
}
