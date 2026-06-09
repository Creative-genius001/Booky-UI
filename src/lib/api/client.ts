import { config } from "@/lib/config";
import type { ApiErrorBody, AuthResult } from "@/types";
import { tokenStore } from "@/lib/api/token-store";

export class ApiError extends Error {
  status: number;
  code?: number;

  constructor(status: number, body: ApiErrorBody | string) {
    const message =
      typeof body === "string"
        ? body
        : body.error || body.message || `Request failed (${status})`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (typeof body !== "string") this.code = body.code;
  }
}

/** Any JSON-serialisable value sent as a request body. */
type Json = unknown;

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Parsed JSON body; serialised automatically. */
  body?: Json;
  /** Attach the current access token. Defaults to true. */
  auth?: boolean;
  /** Disable the automatic 401 refresh retry (used by the refresh call itself). */
  skipRefresh?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

/** Attempt to refresh the access token, deduping concurrent calls. */
async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = tokenStore.get()?.refresh_token;
  if (!refreshToken) return false;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        tokenStore.clear();
        return false;
      }
      // /auth/refresh returns { data: { user, tokens } }.
      const json = (await res.json()) as { data?: AuthResult };
      const tokens = json.data?.tokens;
      if (!tokens?.access_token) {
        tokenStore.clear();
        return false;
      }
      tokenStore.set({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? refreshToken,
      });
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function parse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Unwrap the backend's `{ data: T }` success envelope. */
function unwrap<T>(parsed: unknown): T {
  if (parsed && typeof parsed === "object" && "data" in parsed) {
    return (parsed as { data: T }).data;
  }
  return parsed as T;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, skipRefresh = false, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = tokenStore.get()?.access_token;
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const doFetch = () =>
    fetch(`${config.apiBaseUrl}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && auth && !skipRefresh) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const token = tokenStore.get()?.access_token;
      if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
      res = await doFetch();
    }
  }

  const parsed = await parse(res);

  if (!res.ok) {
    throw new ApiError(res.status, (parsed as ApiErrorBody | string) ?? "");
  }

  return unwrap<T>(parsed);
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: Json, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: Json, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body }),
  put: <T>(path: string, body?: Json, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "PUT", body }),
  del: <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};
