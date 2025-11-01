import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Optional: Add auth check here
        // if (!user) throw new Error('Unauthorized');

        return {
          allowedContentTypes: [
            "video/mp4",
            "video/quicktime",
            "video/webm",
            "video/avi",
            "video/x-msvideo",
            "video/mkv",
            "video/x-matroska",
            "video/x-ms-wmv",
            "video/x-flv",
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB max
          addRandomSuffix: true, // Add random suffix to avoid duplicate filename errors
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("✅ Blob upload complete:", blob.url);

        // Optional: Save blob URL to database
        // await db.videos.create({ url: blob.url, ... });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

