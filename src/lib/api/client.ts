import { config } from "@/lib/config";
import type { ApiErrorBody } from "@/types";
import { tokenStore } from "@/lib/api/token-store";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody | string) {
    const message =
      typeof body === "string"
        ? body
        : body.message || body.error || `Request failed (${status})`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (typeof body !== "string") {
      this.code = body.code;
      this.details = body.details;
    }
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
  const refreshToken = tokenStore.get()?.refreshToken;
  if (!refreshToken) return false;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        tokenStore.clear();
        return false;
      }
      const data = (await res.json()) as {
        accessToken: string;
        refreshToken?: string;
      };
      const current = tokenStore.get();
      tokenStore.set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? current?.refreshToken ?? refreshToken,
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
    const token = tokenStore.get()?.accessToken;
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
      const token = tokenStore.get()?.accessToken;
      if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
      res = await doFetch();
    }
  }

  if (!res.ok) {
    const parsed = await parse(res);
    throw new ApiError(res.status, (parsed as ApiErrorBody | string) ?? "");
  }

  return (await parse(res)) as T;
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
