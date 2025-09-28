// lib/b2.ts
import BackblazeB2 from "backblaze-b2";

const keyId = process.env.B2_APPLICATION_KEY_ID!;
const appKey = process.env.B2_APPLICATION_KEY!;
const bucketId = process.env.B2_BUCKET_ID!;
const bucketName = process.env.B2_BUCKET_NAME!;

// Basic public URL pattern (if bucket is public)
export const b2PublicBase =
  bucketName ? `https://f001.backblazeb2.com/file/${bucketName}` : undefined;

// Singleton B2 client + lazy auth
const b2 = new BackblazeB2({
  applicationKeyId: keyId,
  applicationKey: appKey,
});

let authorized = false;
async function ensureAuth() {
  if (!authorized) {
    await b2.authorize();
    authorized = true;
  }
}

export async function listFiles(): Promise<Array<{ fileName: string; contentLength: number; contentType: string; uploadedAt: string; fileUrl?: string }>> {
  await ensureAuth();
  const res = await b2.listFileNames({
    bucketId,
    maxFileCount: 1000,
  });
  const resData = (res as unknown) as { data?: { files?: unknown } };
  const rawFiles = resData.data?.files || [];
  const files = (rawFiles as Array<Record<string, unknown>>).map((f) => {
    const fileName = String(f['fileName'] || '');
    const contentLength = Number(f['contentLength'] || 0);
    const contentType = String(f['contentType'] || '');
    const uploadTimestamp = Number(f['uploadTimestamp'] || 0);
    const uploadedAt = new Date(uploadTimestamp).toISOString();
    const fileUrl = fileName && b2PublicBase ? `${b2PublicBase}/${encodeURIComponent(fileName)}` : undefined;
    return { fileName, contentLength, contentType, uploadedAt, fileUrl };
  });
  return files;
}

export async function uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<{ fileName: string; url?: string }> {
  await ensureAuth();

  // 1) get upload url
  const up = await b2.getUploadUrl({ bucketId });

  // 2) upload
  const res = await b2.uploadFile({
    uploadUrl: up.data.uploadUrl,
    uploadAuthToken: up.data.authorizationToken,
    fileName,
    data: buffer,
    contentType,
  });

  const uploadRes = (res as unknown) as { data?: { fileName?: unknown } };
  const storedName = String(uploadRes.data?.fileName ?? fileName);
  const url = storedName && b2PublicBase ? `${b2PublicBase}/${encodeURIComponent(storedName)}` : undefined;

  return { fileName: storedName, url };
}
