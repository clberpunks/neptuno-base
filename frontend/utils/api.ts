export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...options
  });

  if (res.status === 401) {
    // Si detectamos 401, la sesión expiró
    window.location.href = '/auth/logout';
    throw new Error("No autorizado, redirigiendo al login...");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error en la petición");
  }

  return res.json();
}
