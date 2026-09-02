import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const from   = searchParams.get("from");
    const to     = searchParams.get("to");
    const amount = searchParams.get("amount");

    if (!from || !to) {
        return NextResponse.json({ error: "'from' and 'to' are required." }, { status: 400 });
    }

    try {
        const client = await authClient();
        const params: Record<string, string> = { from, to };
        if (amount) params.amount = amount;

        const backendRes = await client.get("/currency/convert", { params });
        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number } };
        return NextResponse.json(
            err.response?.data ?? { error: "Currency conversion failed." },
            { status: err.response?.status ?? 500 }
        );
    }
}
