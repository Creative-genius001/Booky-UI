import { api } from "@/lib/api/client";
import type { AuthSession, AuthTokens, User } from "@/types";

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    api.post<AuthSession>("/auth/signup", payload, { auth: false }),

  login: (payload: LoginPayload) =>
    api.post<AuthSession>("/auth/login", payload, { auth: false }),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>("/auth/refresh", { refreshToken }, {
      auth: false,
      skipRefresh: true,
    }),

  logout: () => api.post<void>("/auth/logout"),

  /** Best-effort current-user fetch; backend may expose /auth/me. */
  me: () => api.get<User>("/auth/me"),

  // The following endpoints are required by the spec's auth screens but are
  // not yet wired in router.go. Paths are inferred; adjust if the API differs.
  verifyEmail: (token: string) =>
    api.post<void>("/auth/verify-email", { token }, { auth: false }),
  resendVerification: (email: string) =>
    api.post<void>("/auth/resend-verification", { email }, { auth: false }),
  forgotPassword: (email: string) =>
    api.post<void>("/auth/forgot-password", { email }, { auth: false }),
  resetPassword: (token: string, password: string) =>
    api.post<void>("/auth/reset-password", { token, password }, { auth: false }),
};
