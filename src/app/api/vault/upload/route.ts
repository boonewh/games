import { requireSignedIn } from '@/lib/require-signed-in'
// app/api/vault/upload/route.ts
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/b2";

export const runtime = "nodejs"; // ensure Node runtime for Buffer

export async function POST(request: Request) {
  const denied = await requireSignedIn()
  if (denied) return denied


  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) return new NextResponse("Missing file", { status: 400 });

    // Optional: prefix filename by user or folder
    const safeName = file.name.replace(/[^\w.\-\/]/g, "_");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { url, fileName } = await uploadFile(buffer, safeName, file.type || "application/octet-stream");

    return NextResponse.json({ ok: true, fileName, url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new NextResponse(message || "Upload failed", { status: 500 });
  }
}
