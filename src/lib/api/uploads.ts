import { config } from "@/lib/config";
import { tokenStore } from "@/lib/api/token-store";
import { ApiError } from "@/lib/api/client";
import type { ApiErrorBody } from "@/types";

/** Uploads an image to the backend (POST /uploads, multipart) → public URL. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const token = tokenStore.get()?.access_token;
  const res = await fetch(`${config.apiBaseUrl}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, (json as ApiErrorBody | string) ?? "");
  }
  return (json?.data?.url ?? json?.url) as string;
}
