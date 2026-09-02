import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function isExpired(token?: string): boolean {
    if (!token) return true;
    try {
        const decoded = jwt.decode(token) as { exp?: number };
        if (!decoded?.exp) return true;
        return Date.now() >= decoded.exp * 1000 - 30 * 1000;
    } catch {
        return true;
    }
}

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password"];
const PROTECTED_ROUTES = ["/dashboard", "/investments", "/wallet", "/kyc", "/profile", "/portfolio", "/transactions", "/payment-methods", "/account-opening", "/referrals", "/notifications"];

export async function middleware(req: NextRequest) {
    const accessToken = req.cookies.get("clientAccessToken")?.value;
    const refreshToken = req.cookies.get("clientRefreshToken")?.value;
    const path = req.nextUrl.pathname;
    const cookieHeader = req.headers.get("cookie") || "";

    const isPublic = PUBLIC_ROUTES.some((r) => path.startsWith(r));
    const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r));

    // Already authenticated — redirect away from login/signup
    if (isPublic && accessToken && !isExpired(accessToken)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (isProtected) {
        if (!accessToken || isExpired(accessToken)) {
            if (refreshToken) {
                try {
                    const response = await fetch(
                        `${req.nextUrl.origin}/api/auth/refresh`,
                        {
                            method: "POST",
                            credentials: "include",
                            headers: { cookie: cookieHeader },
                        }
                    );

                    if (response.status === 200) {
                        const { accessToken: newToken } = await response.json();
                        const res = NextResponse.next();
                        res.cookies.set("clientAccessToken", newToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "strict",
                            path: "/",
                            maxAge: 60 * 15,
                        });
                        return res;
                    }
                } catch {
                    // fall through to redirect
                }
            }

            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", path + req.nextUrl.search);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/signup",
        "/forgot-password",
        "/dashboard/:path*",
        "/investments/:path*",
        "/wallet/:path*",
        "/kyc/:path*",
        "/profile/:path*",
        "/portfolio/:path*",
        "/transactions/:path*",
        "/payment-methods/:path*",
        "/account-opening/:path*",
        "/referrals/:path*",
        "/notifications/:path*",
    ],
};

//