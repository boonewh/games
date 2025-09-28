// app/api/vault/list/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listFiles } from "@/lib/b2";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const files = await listFiles();
    return NextResponse.json({ files });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new NextResponse(message || "Error listing files", { status: 500 });
  }
}
