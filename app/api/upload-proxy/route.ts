import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
).replace(/\/$/, "");

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log("Proxy: Forwarding upload to backend...");
    console.log("Backend URL:", BACKEND_URL);
    console.log("Request method:", request.method);

    // Get the form data from the request
    const formData = await request.formData();

    // Forward to backend with very long timeout
    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData,
      redirect: "follow", // Follow redirects
      // Increase timeout to 30 minutes
      signal: AbortSignal.timeout(30 * 60 * 1000),
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

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        error: `Proxy error: ${error instanceof Error ? error.message : String(error)
          }`,
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}
