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
    console.log("Proxy: Checking status for job:", jobId);

    // Forward to Modal API
    const response = await fetch(`${MODAL_API_URL}/api/status/${jobId}`);

    console.log("Backend status response:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend status error:", errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend status data:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Status proxy error:", error);
    return NextResponse.json(
      {
        error: `Status proxy error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
