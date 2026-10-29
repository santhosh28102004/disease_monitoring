export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  const headers = new Headers(options.headers);
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('health-surveillance-token')?.trim();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the backend. Start the backend server and check its MongoDB connection.');
  }

  const payload = await response.json().catch(() => null) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.message ?? `Request failed (${response.status})`);
  }

  return payload as T;
}
