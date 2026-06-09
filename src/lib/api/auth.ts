import { api } from "@/lib/api/client";
import type { AuthResult } from "@/types";

export interface SignupPayload {
  email: string;
  phone: string;
  password: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  /**
   * Only shop owners self-register; the backend rejects any other role.
   * Returns { user, tokens } and is immediately authenticated (no email
   * verification step exists in the backend).
   */
  signup: (payload: SignupPayload) =>
    api.post<AuthResult>(
      "/auth/signup",
      { ...payload, role: "owner" },
      { auth: false },
    ),

  login: (payload: LoginPayload) =>
    api.post<AuthResult>("/auth/login", payload, { auth: false }),

  refresh: (refreshToken: string) =>
    api.post<AuthResult>(
      "/auth/refresh",
      { refresh_token: refreshToken },
      { auth: false, skipRefresh: true },
    ),

  logout: (refreshToken?: string) =>
    api.post<{ message: string }>("/auth/logout", {
      refresh_token: refreshToken,
    }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>(
      "/auth/forgot-password",
      { email },
      { auth: false },
    ),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>(
      "/auth/reset-password",
      { token, password },
      { auth: false },
    ),

  verifyEmail: (token: string) =>
    api.post<{ message: string }>("/auth/verify-email", { token }, { auth: false }),

  resendVerification: (email: string) =>
    api.post<{ message: string }>(
      "/auth/resend-verification",
      { email },
      { auth: false },
    ),
};
