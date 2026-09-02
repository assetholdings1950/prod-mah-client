import apiClient from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/config/apiConfig";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const IS_PROD = process.env.NODE_ENV === "production";

export async function POST() {
    try {
        const refreshToken = (await cookies()).get("clientRefreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: "No refresh token found" }, { status: 401 });
        }

        const backendRes = await apiClient.post(API_ENDPOINTS.auth.refresh, { refreshToken });

        if (backendRes.data.status === false) {
            return NextResponse.json(
                { error: backendRes.data.message || "Refresh failed" },
                { status: backendRes.data.statusCode || 401 }
            );
        }

        const { accessToken, refreshToken: newRefreshToken } = backendRes.data;

        if (backendRes.data?.status === false || !accessToken) {
            return NextResponse.json(
                { status: false, message: backendRes.data?.message ?? "Refresh failed" },
                { status: backendRes.data?.statusCode ?? 401 }
            );
        }

        const res = NextResponse.json({ accessToken });

        res.cookies.set("clientAccessToken", accessToken, {
            httpOnly: true,
            secure: IS_PROD,
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 15,
        });

        if (newRefreshToken) {
            res.cookies.set("clientRefreshToken", newRefreshToken, {
                httpOnly: true,
                secure: IS_PROD,
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            });
        }

        return res;
    } catch {
        return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }
}
