import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Intercept and protect all Next.js API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    // 1. Handle CORS preflight (OPTIONS) requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. Validate API Key if configured on backend
    const configuredKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;

    if (configuredKey) {
      const headerKey = request.headers.get("x-api-key");
      const authHeader = request.headers.get("authorization");
      const bearerKey = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;
      const queryKey = request.nextUrl.searchParams.get("apiKey");

      const clientKey = headerKey || bearerKey || queryKey;

      if (!clientKey || clientKey !== configuredKey) {
        return NextResponse.json(
          {
            error: "Unauthorized: Invalid or missing API key.",
            status: 401,
          },
          {
            status: 401,
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    // 3. Attach CORS headers to valid response
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-api-key"
    );
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};

