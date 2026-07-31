const configuredApiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080')
  .replace(/\/+$/, '');
const apiUrl = configuredApiUrl.endsWith('/api')
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;
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

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API. Verifique se o backend está ativo.');
  }

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = await response.json() as ApiErrorBody;
    } catch {
      // Some infrastructure errors do not return JSON.
    }
    if (response.status === 401) apiSession.expire();
    throw new ApiError(
      response.status,
      getErrorMessage(response.status, body),
      body.fieldErrors,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
