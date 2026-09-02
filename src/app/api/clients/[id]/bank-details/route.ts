import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await authClient();
    const res = await client.get(`/clients/${id}/bank-details`);
    return NextResponse.json(res.data, { status: res.status || 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bank details." }, { status: 500 });
  }
}
