/**
 * Central fetch wrapper for Ecolution.
 *
 * - Attaches `Authorization: Bearer <accessToken>` automatically.
 * - Access token lives only in memory (never localStorage) — safer against XSS.
 *   It is synced with AuthProvider via the subscribe/notify pair below.
 * - On 401/419 (expired/invalid token) it silently calls /api/auth/refresh
 *   (refresh token is an HttpOnly cookie, sent automatically) and retries
 *   the original request ONCE.
 * - Normalizes both JSON and multipart/form-data bodies.
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type TokenListener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<TokenListener>();

export function setAccessToken(token: string | null) {
  accessToken = token;
  listeners.forEach((listener) => listener(token));
}

export function getAccessToken() {
  return accessToken;
}

export function onAccessTokenChange(listener: TokenListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export interface RefreshedSession<U = unknown> {
  accessToken: string;
  /** Present when the refresh endpoint also returns the user (session restore). */
  user?: U | null;
}

/**
 * Calls /api/auth/refresh using the HttpOnly refresh_token cookie.
 * Returns the new access token + user, or null if the session is no longer valid.
 *
 * Returning the user here lets callers restore the whole session in a single
 * round trip instead of following up with a separate /api/auth/me request.
 */
export async function refreshSession<U = unknown>(): Promise<RefreshedSession<U> | null> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      setAccessToken(null);
      return null;
    }

    const json = (await res.json()) as ApiSuccess<{ accessToken: string; user?: U | null }>;
    setAccessToken(json.data.accessToken);
    return { accessToken: json.data.accessToken, user: json.data.user ?? null };
  } catch {
    setAccessToken(null);
    return null;
  }
}

/**
 * Convenience wrapper used by the fetch retry path — only needs the token.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const session = await refreshSession();
  return session?.accessToken ?? null;
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | Record<string, any> | null;
  /** internal flag to prevent infinite refresh loops */
  _isRetry?: boolean;
}

function isPlainObjectBody(body: unknown): body is Record<string, any> {
  return (
    typeof body === "object" &&
    body !== null &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)
  );
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<ApiSuccess<T>> {
  const { body, headers, _isRetry, ...rest } = options;
  const finalHeaders = new Headers(headers);

  let finalBody: BodyInit | undefined;
  if (isPlainObjectBody(body)) {
    finalHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  } else if (body != null) {
    finalBody = body as BodyInit;
    // Don't set Content-Type for FormData — the browser needs to add its own boundary.
  }

  if (accessToken) {
    finalHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(path, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
    credentials: "include",
  });

  // Access token missing/expired — try refreshing once, then retry the request.
  if ((res.status === 401 || res.status === 419) && !_isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, _isRetry: true });
    }
  }

  let json: ApiSuccess<T> | ApiErrorBody | null = null;
  try {
    json = await res.json();
  } catch {
    // no body (e.g. some 500s) — fall through to generic error below
  }

  if (!res.ok || !json || json.success === false) {
    const errorBody = json as ApiErrorBody | null;
    throw new ApiError(
      res.status,
      errorBody?.error?.code ?? "UNKNOWN_ERROR",
      errorBody?.error?.message ?? "Terjadi kesalahan yang tidak terduga. Coba lagi.",
      errorBody?.error?.details
    );
  }

  return json as ApiSuccess<T>;
}
