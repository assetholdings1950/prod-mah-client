import { authClient } from "@/lib/authClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const client = await authClient();
        const response = await client.get(BACKEND_ENDPOINTS.accountForms.pdf, { responseType: "arraybuffer" });
        return new NextResponse(response.data, {
            status: response.status,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": response.headers["content-disposition"] ?? "attachment; filename=account-opening-application.pdf",
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error: unknown) {
        const err = error as { response?: { data?: ArrayBuffer; status?: number; headers?: Record<string, string> } };
        let message = "Failed to generate the application PDF.";
        if (err.response?.data) {
            try { message = JSON.parse(Buffer.from(err.response.data).toString("utf8"))?.message ?? message; } catch { /* keep fallback */ }
        }
        return NextResponse.json({ status: false, message }, { status: err.response?.status ?? 500 });
    }
}
