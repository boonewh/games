import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import BackblazeB2 from "backblaze-b2";

const keyId = process.env.B2_APPLICATION_KEY_ID!;
const appKey = process.env.B2_APPLICATION_KEY!;
const bucketName = process.env.B2_BUCKET_NAME!;

const b2 = new BackblazeB2({ applicationKeyId: keyId, applicationKey: appKey });

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // Quick runtime check for required Backblaze env vars so misconfiguration
  // (for example on Vercel) surfaces with a clear message instead of a
  // generic upstream B2 error like 'Invalid accountId or applicationKeyId'.
  if (!keyId || !appKey || !bucketName) {
    console.error('Missing Backblaze configuration:', {
      hasKeyId: Boolean(keyId),
      hasAppKey: Boolean(appKey),
      hasBucketName: Boolean(bucketName),
    });
    return new NextResponse('Server misconfiguration: missing Backblaze environment variables (B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME). Please set these in your deployment.', { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('file');
    if (!fileName) return new NextResponse('Missing file', { status: 400 });

    console.log('Proxy download request for file:', fileName);
    console.log('Using bucket name:', bucketName);

    // Ensure we're authorized with B2
    console.log('Authorizing with B2...');
    await b2.authorize();
    console.log('B2 authorization complete');

    // Check if downloadFileByName method exists
    const b2Unknown = b2 as unknown as { downloadFileByName?: (args: unknown) => Promise<unknown> };
    const b2Methods = Object.getOwnPropertyNames(Object.getPrototypeOf(b2));
    console.log('Available B2 prototype methods:', b2Methods.slice(0, 10)); // limit output
    
    if (!b2Unknown.downloadFileByName) {
      console.error('downloadFileByName method not available on B2 client');
      return new NextResponse('B2 client method not available', { status: 500 });
    }

    console.log('Calling B2 downloadFileByName with:', { bucketName, fileName });
    
    // Download file by name from B2 (this returns a stream/buffer)
    const downloadRes = await b2Unknown.downloadFileByName({ 
      bucketName, 
      fileName,
      responseType: 'arraybuffer'
    });

    console.log('Download response type:', typeof downloadRes);
    console.log('Download response keys:', downloadRes ? Object.keys(downloadRes) : 'null');

    // The SDK returns a response with data as a Buffer when responseType is arraybuffer
    const responseData = downloadRes as unknown as { 
      data?: Buffer | ArrayBuffer | unknown; 
      headers?: Record<string, string>;
      status?: number;
    };
    
    console.log('Response data type:', typeof responseData?.data);
    console.log('Response data length:', responseData?.data ? (responseData.data as ArrayBuffer).byteLength || (responseData.data as Buffer).length : 0);
    console.log('Response headers:', responseData?.headers);
    console.log('Response status:', responseData?.status);

    // Handle Axios response format - data might be a Buffer or need conversion
    let bodyBuffer: Buffer | undefined;
    if (responseData?.data) {
      if (Buffer.isBuffer(responseData.data)) {
        bodyBuffer = responseData.data;
      } else if (responseData.data instanceof ArrayBuffer) {
        bodyBuffer = Buffer.from(responseData.data);
      } else {
        // Try to convert whatever we got to a Buffer - assume it's string or array-like
        console.log('Converting unknown data type to buffer:', typeof responseData.data);
        bodyBuffer = Buffer.from(responseData.data as Uint8Array);
      }
    }

    let contentType = responseData?.headers?.['content-type'] || undefined;

    // Fallback by inferring MIME from file extension if upstream header missing
    if (!contentType) {
      const path = await import('node:path');
      const ext = path.extname(fileName).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
      };
      contentType = mimeMap[ext] || 'application/octet-stream';
    }

    if (!bodyBuffer) {
      console.error('No body buffer after conversion');
      return new NextResponse('Failed to download file - no buffer', { status: 500 });
    }

    console.log('Final buffer size:', bodyBuffer.length);
    console.log('Final content type:', contentType);

    // Use ReadableStream from buffer for Response body
    console.log('Returning ReadableStream response');
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(bodyBuffer));
        controller.close();
      }
    });
    // For types that browsers can render inline (PDFs, images), prefer inline display
    const inlineTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const disposition = inlineTypes.includes(contentType) ? `inline; filename="${fileName}"` : `attachment; filename="${fileName}"`;

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new NextResponse(message || 'Download failed', { status: 500 });
  }
}
