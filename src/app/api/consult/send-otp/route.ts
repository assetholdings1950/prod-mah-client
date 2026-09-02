import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const client = await authClient();
        const body = await req.json();
        const backendRes = await client.post(BACKEND_ENDPOINTS.consult.sendOtp, body);

        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { status: false, message: "Failed to send the verification code." },
            { status: err.response?.status ?? 500 }
        );
    }
}
