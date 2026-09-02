import { authClient } from "@/lib/authClient";
import { API_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

// Large limit needed for base64-encoded selfie, ID images, and declaration video
export const maxDuration = 120;

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const client = await authClient();
        const backendRes = await client.post(API_ENDPOINTS.auth.submitKyc, payload, {
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });
        return NextResponse.json(backendRes.data, { status: backendRes.status || 200 });
    } catch (error: unknown) {
        const err = error as { response?: { status?: number; data?: { error?: string; message?: string } } };
        return NextResponse.json(
            { error: err.response?.data?.error || err.response?.data?.message || "KYC submission failed." },
            { status: err.response?.status || 500 },
        );
    }
}
