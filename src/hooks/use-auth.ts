"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi, type LoginPayload, type SignupPayload } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/lib/api/client";

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
    onSuccess: (session) => {
      setSession(session, true);
      toast.success("Account created. Let's verify your email.");
      router.push("/verify-email");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not create account")),
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: ({ remember, ...payload }: LoginPayload & { remember: boolean }) =>
      authApi.login(payload).then((s) => ({ session: s, remember })),
    onSuccess: ({ session, remember }) => {
      setSession(session, remember);
      toast.success(`Welcome back, ${session.user.fullName.split(" ")[0]}`);
      router.push("/dashboard");
    },
    onError: (e) => toast.error(errorMessage(e, "Invalid email or password")),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();
  return useMutation({
    mutationFn: () => authApi.logout().catch(() => undefined),
    onSettled: () => {
      clear();
      router.push("/login");
    },
  });
}

export function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.message || fallback;
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}
