import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: RouteContext) {
    try {
        const { path } = await context.params;
        const endpoint = `/hiring/${path.join("/")}${request.nextUrl.search}`;
        const method = request.method.toLowerCase();
        let body: unknown;
        if (["post", "put", "patch"].includes(method)) {
            const rawBody = await request.text();
            body = rawBody ? JSON.parse(rawBody) : undefined;
        }
        const response = await apiClient.request({ method, url: endpoint, data: body });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        const apiError = error as AxiosError<{ message?: string }>;
        return NextResponse.json(
            apiError.response?.data ?? {
                success: false,
                message: "Hiring request failed.",
            },
            { status: apiError.response?.status ?? 500 },
        );
    }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
