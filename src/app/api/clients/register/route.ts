import apiClient from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const backendRes = await apiClient.post("/clients", payload);
        return NextResponse.json(backendRes.data, { status: backendRes.status || 200 });
    } catch {
        return NextResponse.json({ error: "Registration failed." }, { status: 500 });
    }
}
