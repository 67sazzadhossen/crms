const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${API_ORIGIN}/api/v1`;
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error((await response.text()) || 'Request failed');
  return response.json() as Promise<T>;
}
