/**
 * Backend API Key Authentication Helper
 * Validates incoming requests against process.env.API_KEY or process.env.NEXT_PUBLIC_API_KEY.
 */

export interface AuthValidationResult {
  authorized: boolean;
  status?: number;
  error?: string;
}

export function validateApiKey(request: Request): AuthValidationResult {
  const configuredKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;

  // If no API key is configured on the backend, allow access (open/development mode)
  if (!configuredKey) {
    return { authorized: true };
  }

  const headerKey = request.headers.get("x-api-key");
  const authHeader = request.headers.get("authorization");
  const bearerKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  let queryKey: string | null = null;
  try {
    const url = new URL(request.url);
    queryKey = url.searchParams.get("apiKey");
  } catch {
    // Ignore URL parse error
  }

  const clientKey = headerKey || bearerKey || queryKey;

  if (!clientKey || clientKey !== configuredKey) {
    return {
      authorized: false,
      status: 401,
      error: "Unauthorized: Invalid or missing API key.",
    };
  }

  return { authorized: true };
}

