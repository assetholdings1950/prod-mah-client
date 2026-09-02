import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const response = await apiClient.post("/cloudionary/hiring", payload);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        const apiError = error as AxiosError<{ error?: string; message?: string }>;

        return NextResponse.json(
            {
                error:
                    apiError.response?.data?.error ??
                    apiError.response?.data?.message ??
                    "Failed to prepare the hiring upload.",
            },
            {
                status: apiError.response?.status ?? 500,
            },
        );
    }
}
