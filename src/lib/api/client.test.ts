import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { api, ApiError } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/token-store";

const BASE = "http://localhost:8080";

/** Backend success envelope helper. */
const data = (payload: unknown) => HttpResponse.json({ data: payload });

describe("api client", () => {
  beforeEach(() => {
    tokenStore.clear();
  });

  it("unwraps the { data } success envelope", async () => {
    server.use(http.get(`${BASE}/thing`, () => data({ hello: "world" })));
    const result = await api.get<{ hello: string }>("/thing", { auth: false });
    expect(result).toEqual({ hello: "world" });
  });

  it("attaches the bearer token to authed requests", async () => {
    tokenStore.set({ access_token: "abc", refresh_token: "r" });
    let seen: string | null = null;
    server.use(
      http.get(`${BASE}/protected`, ({ request }) => {
        seen = request.headers.get("Authorization");
        return data({ ok: true });
      }),
    );
    await api.get("/protected");
    expect(seen).toBe("Bearer abc");
  });

  it("refreshes once on 401 then retries the original request", async () => {
    tokenStore.set({ access_token: "stale", refresh_token: "good-refresh" });
    let refreshCalls = 0;

    server.use(
      http.get(`${BASE}/secure`, ({ request }) => {
        const auth = request.headers.get("Authorization");
        if (auth === "Bearer refreshed-access-token") return data({ secret: 1 });
        return HttpResponse.json({ error: "expired", code: 401 }, { status: 401 });
      }),
      http.post(`${BASE}/auth/refresh`, () => {
        refreshCalls += 1;
        // Backend returns { data: { user, tokens } }.
        return data({
          user: { id: "u", email: "e", phone: "p", role: "owner" },
          tokens: {
            access_token: "refreshed-access-token",
            refresh_token: "good-refresh",
          },
        });
      }),
    );

    const result = await api.get<{ secret: number }>("/secure");
    expect(result.secret).toBe(1);
    expect(refreshCalls).toBe(1);
    expect(tokenStore.get()?.access_token).toBe("refreshed-access-token");
  });

  it("clears tokens and throws when refresh fails", async () => {
    tokenStore.set({ access_token: "stale", refresh_token: "bad" });
    server.use(
      http.get(`${BASE}/secure`, () =>
        HttpResponse.json({ error: "expired", code: 401 }, { status: 401 }),
      ),
      http.post(`${BASE}/auth/refresh`, () =>
        HttpResponse.json({ error: "nope", code: 401 }, { status: 401 }),
      ),
    );

    await expect(api.get("/secure")).rejects.toBeInstanceOf(ApiError);
    expect(tokenStore.get()).toBeNull();
  });

  it("parses the { error, code } envelope into ApiError", async () => {
    server.use(
      http.get(`${BASE}/bad`, () =>
        HttpResponse.json({ error: "Bad thing", code: 422 }, { status: 422 }),
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
    tokenStore.set({ access_token: "stale", refresh_token: "good" });
    let refreshCalls = 0;
    const guard = (request: Request, payload: unknown) =>
      request.headers.get("Authorization") === "Bearer refreshed-access-token"
        ? data(payload)
        : HttpResponse.json({ error: "x", code: 401 }, { status: 401 });
    server.use(
      http.get(`${BASE}/a`, ({ request }) => guard(request, { ok: "a" })),
      http.get(`${BASE}/b`, ({ request }) => guard(request, { ok: "b" })),
      http.post(`${BASE}/auth/refresh`, () => {
        refreshCalls += 1;
        return data({
          user: { id: "u", email: "e", phone: "p", role: "owner" },
          tokens: { access_token: "refreshed-access-token", refresh_token: "good" },
        });
      }),
    );

    await Promise.all([api.get("/a"), api.get("/b")]);
    expect(refreshCalls).toBe(1);
  });
});
