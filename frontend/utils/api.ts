// frontend/utils/api.ts

import { useError } from "../contexts/ErrorContext";

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let res = await fetch(url, { credentials: "include", ...options });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await fetch(url, { credentials: "include", ...options });
    } else {
      throw new Error("Unauthorized");
    }
  }

  if (res.status === 403) {
    throw new Error("Forbidden");
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Error en la petición");
  }

  return res.json();
}
