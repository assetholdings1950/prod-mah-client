import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const response = await apiClient.post(
            BACKEND_ENDPOINTS.hiring.applications,
            payload,
        );

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        const apiError = error as AxiosError<{ message?: string }>;

        return NextResponse.json(
            {
                success: false,
                message:
                    apiError.response?.data?.message ??
                    "Application could not be submitted.",
            },
            {
                status: apiError.response?.status ?? 500,
            },
        );
    }
}
