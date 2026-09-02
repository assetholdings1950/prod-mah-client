import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

function errorResponse(error: unknown, fallback: string) {
    const err = error as { response?: { data?: Record<string, unknown>; status?: number } };
    return NextResponse.json(err.response?.data ?? { status: false, message: fallback }, { status: err.response?.status ?? 500 });
}

export async function GET() {
    try {
        const client = await authClient();
        const response = await client.get(BACKEND_ENDPOINTS.accountForms.me);
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) { return errorResponse(error, "Failed to fetch account form status."); }
}

export async function POST(request: NextRequest) {
    try {
        const client = await authClient();
        const response = await client.post(BACKEND_ENDPOINTS.accountForms.submit, await request.json());
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) { return errorResponse(error, "Failed to submit account opening form."); }
}
