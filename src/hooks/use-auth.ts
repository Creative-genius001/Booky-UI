"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi, type LoginPayload, type SignupPayload } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { useShopStore } from "@/stores/shop-store";
import { tokenStore } from "@/lib/api/token-store";
import { ApiError } from "@/lib/api/client";

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
    onSuccess: (session) => {
      setSession(session);
      toast.success("Account created. Check your email to verify it.");
      router.push("/verify-email");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not create account")),
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (session) => {
      setSession(session);
      toast.success("Welcome back");
      router.push("/dashboard");
    },
    onError: (e) => toast.error(errorMessage(e, "Invalid email or password")),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const clearShop = useShopStore((s) => s.clear);
  const router = useRouter();
  return useMutation({
    mutationFn: () =>
      authApi.logout(tokenStore.get()?.refresh_token).catch(() => undefined),
    onSettled: () => {
      clear();
      clearShop();
      router.push("/login");
    },
  });
}

export function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.message || fallback;
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}
