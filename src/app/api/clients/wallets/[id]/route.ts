import { authClient } from "@/lib/authClient";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await authClient();
    const res = await client.delete(`/clients/me/wallets/${id}`);
    return NextResponse.json(res.data, { status: res.status || 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete wallet." }, { status: 500 });
  }
}
