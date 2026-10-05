import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ identifier: string; documentType: string }> }
) {
    try {
        const { identifier, documentType } = await params;
        const client = await authClient();
        const response = await client.get(
            `/client/bonds/${encodeURIComponent(identifier)}/documents/${encodeURIComponent(documentType)}`,
            { responseType: "arraybuffer" }
        );
        return new NextResponse(response.data, {
            status: response.status,
            headers: {
                "Content-Type": String(response.headers["content-type"] || "application/octet-stream"),
                "Content-Disposition": String(response.headers["content-disposition"] || "attachment"),
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error: unknown) {
        const err = error as { response?: { data?: ArrayBuffer; status?: number } };
        const body = err.response?.data ? Buffer.from(err.response.data).toString("utf8") : "";
        let message = "Failed to download bond document.";
        try { message = JSON.parse(body).message || message; } catch { /* keep fallback */ }
        return NextResponse.json({ status: false, message }, { status: err.response?.status ?? 500 });
    }
}
