const configuredApiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(
  /\/+$/,
  '',
);
const apiUrl = configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`;
export const apiUnauthorizedEvent = 'hubflow:api-unauthorized';
let csrfToken: string | null = null;
const csrfCookieName = 'XSRF-TOKEN';

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

function getErrorMessage(status: number, body: ApiErrorBody): string {
  if (status === 400) {
    const validationMessages = Object.values(body.fieldErrors ?? {});
    if (validationMessages.length > 0) return validationMessages.join(' ');
    return body.message ?? 'Revise os dados enviados e tente novamente.';
  }

  if (status === 401) return 'Sua sessão expirou ou as credenciais são inválidas.';
  if (status === 403) return 'Você não tem permissão para executar esta operação.';
  if (status >= 500) return 'A API encontrou um erro interno. Tente novamente em instantes.';
  return body.message ?? `Erro HTTP ${status}.`;
}

export const apiSession = {
  clear(): void {
    csrfToken = null;
  },
  expire(): void {
    this.clear();
    window.dispatchEvent(new Event(apiUnauthorizedEvent));
  },
};

function isUnsafeMethod(method?: string): boolean {
  return !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes((method ?? 'GET').toUpperCase());
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(encodedName));
  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(encodedName.length));
  } catch {
    return cookie.slice(encodedName.length);
  }
}

async function requestCsrfToken(): Promise<string | null> {
  const currentCookieToken = readCookie(csrfCookieName);
  if (currentCookieToken) {
    csrfToken = currentCookieToken;
    return currentCookieToken;
  }
  if (csrfToken) return csrfToken;
  try {
    const response = await fetch(`${apiUrl}/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { token?: string };
    csrfToken = readCookie(csrfCookieName) ?? body.token ?? null;
    return csrfToken;
  } catch {
    return null;
  }
}

export async function initializeApiSession(): Promise<void> {
  await requestCsrfToken();
}

export async function endApiSession(): Promise<void> {
  try {
    await apiRequest<void>('/auth/logout', { method: 'POST' });
  } finally {
    apiSession.clear();
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');

  if (isUnsafeMethod(init.method)) {
    const token = await requestCsrfToken();
    if (token) headers.set('X-XSRF-TOKEN', token);
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API. Verifique se o backend está ativo.');
  }

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // Some infrastructure errors do not return JSON.
    }
    if (response.status === 401) apiSession.expire();
    throw new ApiError(response.status, getErrorMessage(response.status, body), body.fieldErrors);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
