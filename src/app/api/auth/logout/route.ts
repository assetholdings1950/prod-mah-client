import apiClient from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextRequest, NextResponse } from "next/server";

const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
    const refreshToken = req.cookies.get("clientRefreshToken")?.value;

    try {
        await apiClient.post(API_ENDPOINTS.auth.logout, { refreshToken });
    } catch {
        // Proceed with clearing cookies even if backend call fails
    }

    const res = NextResponse.json({ status: true, message: "Logged out successfully" });

    res.cookies.set("clientAccessToken", "", {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });

    res.cookies.set("clientRefreshToken", "", {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });

    return res;
}
