import apiClient from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const { rememberMe, ...backendPayload } = payload;
        const backendRes = await apiClient.post(API_ENDPOINTS.auth.signin, backendPayload);

        const { accessToken, refreshToken } = backendRes.data;

        const res = NextResponse.json(backendRes.data, { status: backendRes.status || 200 });

        // No tokens on the response (e.g. an OTP-required / verification step):
        // return the payload as-is without attempting to set auth cookies.
        if (!accessToken || !refreshToken) {
            return res;
        }

        res.cookies.set("clientAccessToken", accessToken, {
            httpOnly: true,
            secure: IS_PROD,
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 15,
        });

        const refreshCookieOptions: Record<string, unknown> = {
            httpOnly: true,
            secure: IS_PROD,
            sameSite: "strict",
            path: "/",
        };

        if (rememberMe) {
            refreshCookieOptions.maxAge = 60 * 60 * 24 * 30; // 30 days
        }

        res.cookies.set("clientRefreshToken", refreshToken, refreshCookieOptions as any);

        return res;
    } catch (err: unknown) {
        const e = err as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            e.response?.data ?? { error: "Sign in failed." },
            { status: e.response?.status ?? 500 }
        );
    }
}
