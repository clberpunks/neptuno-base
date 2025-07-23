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
  options: Omit<RequestInit, 'body'> & { body?: BodyInit | object } = {}
): Promise<T> {
  // Preprocesar el body si es un objeto y no string
  const finalOptions: RequestInit = {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Cookie: document.cookie,
    },
    body:
      options.body && typeof options.body === "object" && !(options.body instanceof FormData) && !(options.body instanceof Blob) && !(options.body instanceof ArrayBuffer)
        ? JSON.stringify(options.body)
        : options.body as BodyInit | undefined,
    };

  let res = await fetch(url, finalOptions);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await fetch(url, finalOptions);
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



// probar 
async function fetchWithRetry(url, options = {}, retries = 3) {
  try {
    return await fetch(url, options)
  } catch (err) {
    if (retries <= 0) throw err
    await new Promise(res => setTimeout(res, 1000))
    return fetchWithRetry(url, options, retries - 1)
  }
}