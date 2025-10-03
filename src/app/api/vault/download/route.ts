// This download endpoint is disabled - using proxy endpoint instead
// The B2 library doesn't expose getDownloadAuthorization in the TypeScript types
// so we use the proxy approach in /api/vault/proxy instead

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Use /api/vault/proxy instead" }, { status: 410 });
}
