const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

export function getToken(): string | null {
  return localStorage.getItem("gc_token");
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return { "Content-Type": "application/json" };
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: authHeaders(),
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
