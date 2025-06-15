// frontend/utils/api.ts

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  let res = await fetch(url, { credentials: 'include', ...options });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      // Vuelve a intentar la misma request original
      res = await fetch(url, { credentials: 'include', ...options });
    } else {
      const err = new Error('Unauthorized');
      (err as any).status = 401;
      throw err;
    }
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Error en la petición');
  }

  return res.json();
}
