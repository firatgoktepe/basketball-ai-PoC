import { NextRequest, NextResponse } from "next/server";

const MODAL_API_URL =
  process.env.NEXT_PUBLIC_MODAL_API_URL ||
  "https://feanor77ist--basketball-gpu-final-fastapi-app.modal.run";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;
        console.log("Proxy: Forwarding download request for job:", jobId);

        // Forward to Modal API
        const response = await fetch(`${MODAL_API_URL}/api/download/${jobId}`, {
            method: "GET",
            // Add timeout for large video downloads
            signal: AbortSignal.timeout(30 * 60 * 1000), // 30 minutes timeout
        });

        console.log("Backend download response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend download error:", errorText);
            return NextResponse.json(
                { error: `Backend download error: ${response.statusText} - ${errorText}` },
                { status: response.status }
            );
        }

        // Get the video blob
        const videoBlob = await response.blob();
        console.log("Downloaded video size:", videoBlob.size, "bytes");

        // Return the video blob
        return new NextResponse(videoBlob, {
            status: 200,
            headers: {
                "Content-Type": "video/mp4",
                "Content-Length": videoBlob.size.toString(),
                "Content-Disposition": `attachment; filename="processed_video_${jobId}.mp4"`,
            },
        });
    } catch (error) {
        console.error("Proxy download error:", error);
        return NextResponse.json(
            {
                error: `Proxy download error: ${error instanceof Error ? error.message : String(error)
                    }`,
            },
            { status: 500 }
        );
    }
}
