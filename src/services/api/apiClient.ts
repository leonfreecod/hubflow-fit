const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api').replace(/\/$/, '');
const tokenKey = 'hubflow.api.token';
export const apiUnauthorizedEvent = 'hubflow:api-unauthorized';

interface ApiErrorBody {
  message?: string;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiSession = {
  getToken(): string | null {
    return localStorage.getItem(tokenKey);
  },
  setToken(token: string): void {
    localStorage.setItem(tokenKey, token);
  },
  clear(): void {
    localStorage.removeItem(tokenKey);
  },
  expire(): void {
    this.clear();
    window.dispatchEvent(new Event(apiUnauthorizedEvent));
  },
};

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');

  const token = apiSession.getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiUrl}${path}`, { ...init, headers });
  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = await response.json() as ApiErrorBody;
    } catch {
      // Some infrastructure errors do not return JSON.
    }
    if (response.status === 401) apiSession.expire();
    throw new ApiError(response.status, body.message ?? `Erro HTTP ${response.status}.`, body.fieldErrors);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
