// app/api/vault/list/route.ts
import { NextResponse } from "next/server";
import { listFiles } from "@/lib/b2";

export async function GET(request: Request) {
  // Simple auth check - look for NextAuth session token in cookies
  const cookies = request.headers.get('cookie') || ''
  const hasSessionToken = cookies.includes('next-auth.session-token') || cookies.includes('__Secure-next-auth.session-token')
  
  if (!hasSessionToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const files = await listFiles();
    return NextResponse.json({ files });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new NextResponse(message || "Error listing files", { status: 500 });
  }
}
