import apiClient from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const backendRes = await apiClient.post(API_ENDPOINTS.auth.verifyOtp, payload);
        return NextResponse.json(backendRes.data, { status: backendRes.status || 200 });
    } catch {
        return NextResponse.json({ error: "OTP verification failed." }, { status: 500 });
    }
}
