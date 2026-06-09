/**
 * Lightweight token store backed by localStorage. Kept separate from the
 * Zustand auth store so the low-level api client can read tokens without a
 * React dependency (and during the 401 refresh cycle).
 */
const KEY = "bookly.tokens";

export interface StoredTokens {
  access_token: string;
  refresh_token: string;
}

let memoryCache: StoredTokens | null = null;
const listeners = new Set<(t: StoredTokens | null) => void>();

function readStorage(): StoredTokens | null {
  if (typeof window === "undefined") return memoryCache;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    return null;
  }
}

export const tokenStore = {
  get(): StoredTokens | null {
    if (memoryCache) return memoryCache;
    memoryCache = readStorage();
    return memoryCache;
  },
  set(tokens: StoredTokens) {
    memoryCache = tokens;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, JSON.stringify(tokens));
    }
    listeners.forEach((l) => l(tokens));
  },
  clear() {
    memoryCache = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(KEY);
    }
    listeners.forEach((l) => l(null));
  },
  subscribe(fn: (t: StoredTokens | null) => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
