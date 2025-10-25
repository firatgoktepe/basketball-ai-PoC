import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
).replace(/\/$/, "");

export async function POST(request: NextRequest) {
  try {
    console.log("Proxy: Forwarding upload to backend...");

    // Get the form data from the request
    const formData = await request.formData();

    // Forward to backend with very long timeout
    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData,
      redirect: "follow", // Follow redirects
      // Increase timeout to 15 minutes
      signal: AbortSignal.timeout(15 * 60 * 1000),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend response data:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        error: `Proxy error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
