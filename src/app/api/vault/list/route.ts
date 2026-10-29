import { requireSignedIn } from '@/lib/require-signed-in'
// app/api/vault/list/route.ts
import { NextResponse } from "next/server";
import { listFiles } from "@/lib/b2";

export async function GET() {
  const denied = await requireSignedIn()
  if (denied) return denied


  try {
    const files = await listFiles();
    return NextResponse.json({ files });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new NextResponse(message || "Error listing files", { status: 500 });
  }
}
