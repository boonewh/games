// lib/b2.ts
import BackblazeB2 from "backblaze-b2";

const keyId = process.env.B2_APPLICATION_KEY_ID!;
const appKey = process.env.B2_APPLICATION_KEY!;
const bucketId = process.env.B2_BUCKET_ID!;
const bucketName = process.env.B2_BUCKET_NAME!;

// We'll determine the correct download host from the B2 authorize response
// (it contains a downloadUrl like https://f001.backblazeb2.com). This avoids
// hard-coding a specific f00x host which can vary between accounts/regions.
let b2DownloadHost: string | undefined;

function getPublicBase() {
  return bucketName && b2DownloadHost ? `${b2DownloadHost}/file/${bucketName}` : undefined;
}

// Singleton B2 client + lazy auth
const b2 = new BackblazeB2({
  applicationKeyId: keyId,
  applicationKey: appKey,
});

let authorized = false;
async function ensureAuth() {
  if (!authorized) {
    // capture the authorize response so we can use the downloadUrl host
    const authRes = await b2.authorize();
    // prefer the downloadUrl provided by B2 (e.g. https://f001.backblazeb2.com)
    // authRes may not have a strict type here; safely inspect for downloadUrl
    const maybe = authRes as unknown as { data?: { downloadUrl?: string } };
    if (maybe && maybe.data && typeof maybe.data.downloadUrl === 'string') {
      b2DownloadHost = maybe.data.downloadUrl;
    } else {
      b2DownloadHost = undefined;
    }
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
    // Use encodeURI here so path separators (/) in fileName are preserved in the URL
    // encodeURIComponent would percent-encode slashes which breaks B2 file paths
    const publicBase = getPublicBase();
    const fileUrl = fileName && publicBase ? `${publicBase}/${encodeURI(fileName)}` : undefined;
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
  // Keep slashes in storedName so folder-like names remain valid paths on Backblaze
  const publicBase = getPublicBase();
  const url = storedName && publicBase ? `${publicBase}/${encodeURI(storedName)}` : undefined;

  return { fileName: storedName, url };
}


