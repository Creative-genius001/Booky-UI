"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, User } from "@/types";
import { tokenStore } from "@/lib/api/token-store";

interface AuthState {
  user: User | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  setSession: (session: AuthSession, remember: boolean) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      isAuthenticated: false,
      setSession: (session, _remember) => {
        tokenStore.set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresIn: session.expiresIn,
        });
        set({ user: session.user, isAuthenticated: true });
      },
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clear: () => {
        tokenStore.clear();
        set({ user: null, isAuthenticated: false });
      },
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "bookly.auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
