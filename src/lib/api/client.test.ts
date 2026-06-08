import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { api, ApiError } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/token-store";

const BASE = "http://localhost:8080";

describe("api client", () => {
  beforeEach(() => {
    tokenStore.clear();
  });

  it("attaches the bearer token to authed requests", async () => {
    tokenStore.set({ accessToken: "abc", refreshToken: "r" });
    let seen: string | null = null;
    server.use(
      http.get(`${BASE}/protected`, ({ request }) => {
        seen = request.headers.get("Authorization");
        return HttpResponse.json({ ok: true });
      }),
    );
    await api.get("/protected");
    expect(seen).toBe("Bearer abc");
  });

  it("refreshes once on 401 then retries the original request", async () => {
    tokenStore.set({ accessToken: "stale", refreshToken: "good-refresh" });
    let refreshCalls = 0;

    server.use(
      http.get(`${BASE}/secure`, ({ request }) => {
        const auth = request.headers.get("Authorization");
        // Old token → 401; refreshed token → 200.
        if (auth === "Bearer refreshed-access-token") {
          return HttpResponse.json({ data: "secret" });
        }
        return HttpResponse.json({ message: "expired" }, { status: 401 });
      }),
      http.post(`${BASE}/auth/refresh`, () => {
        refreshCalls += 1;
        return HttpResponse.json({
          accessToken: "refreshed-access-token",
          refreshToken: "good-refresh",
        });
      }),
    );

    const result = await api.get<{ data: string }>("/secure");
    expect(result.data).toBe("secret");
    expect(refreshCalls).toBe(1);
    expect(tokenStore.get()?.accessToken).toBe("refreshed-access-token");
  });

  it("clears tokens and throws when refresh fails", async () => {
    tokenStore.set({ accessToken: "stale", refreshToken: "bad" });
    server.use(
      http.get(`${BASE}/secure`, () =>
        HttpResponse.json({ message: "expired" }, { status: 401 }),
      ),
      http.post(`${BASE}/auth/refresh`, () =>
        HttpResponse.json({ message: "nope" }, { status: 401 }),
      ),
    );

    await expect(api.get("/secure")).rejects.toBeInstanceOf(ApiError);
    expect(tokenStore.get()).toBeNull();
  });

  it("parses error envelopes into ApiError with status and message", async () => {
    server.use(
      http.get(`${BASE}/bad`, () =>
        HttpResponse.json({ message: "Bad thing" }, { status: 422 }),
      ),
    );
    try {
      await api.get("/bad", { auth: false });
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(422);
      expect((e as ApiError).message).toBe("Bad thing");
    }
  });

  it("dedupes concurrent refreshes into a single call", async () => {
    tokenStore.set({ accessToken: "stale", refreshToken: "good" });
    let refreshCalls = 0;
    server.use(
      http.get(`${BASE}/a`, ({ request }) =>
        request.headers.get("Authorization") === "Bearer refreshed-access-token"
          ? HttpResponse.json({ ok: "a" })
          : HttpResponse.json({ message: "x" }, { status: 401 }),
      ),
      http.get(`${BASE}/b`, ({ request }) =>
        request.headers.get("Authorization") === "Bearer refreshed-access-token"
          ? HttpResponse.json({ ok: "b" })
          : HttpResponse.json({ message: "x" }, { status: 401 }),
      ),
      http.post(`${BASE}/auth/refresh`, async () => {
        refreshCalls += 1;
        return HttpResponse.json({
          accessToken: "refreshed-access-token",
          refreshToken: "good",
        });
      }),
    );

    await Promise.all([api.get("/a"), api.get("/b")]);
    expect(refreshCalls).toBe(1);
  });
});
