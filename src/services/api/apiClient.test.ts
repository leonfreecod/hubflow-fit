import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, apiSession, apiUnauthorizedEvent } from './apiClient';

describe('apiRequest', () => {
  beforeEach(() => {
    apiSession.clear();
  });

  it('adds credentials and a CSRF token to unsafe cookie requests', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'csrf-123' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'student-1' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest<{ id: string }>('/students', {
      method: 'POST',
      body: JSON.stringify({ name: 'Mariana' }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const mutationInit = fetchMock.mock.calls[1][1];
    const headers = new Headers(mutationInit?.headers);
    expect(mutationInit?.credentials).toBe('include');
    expect(headers.get('X-XSRF-TOKEN')).toBe('csrf-123');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('uses the latest CSRF cookie after the backend rotates the token', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-current; path=/';
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: 'student-2' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify({ name: 'Carlos' }),
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('X-XSRF-TOKEN')).toBe('csrf-current');
  });

  it('maps validation errors and emits an event when the session expires', async () => {
    const listener = vi.fn();
    window.addEventListener(apiUnauthorizedEvent, listener);
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ fieldErrors: { email: 'E-mail inválido.' } }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(apiRequest('/auth/me')).rejects.toMatchObject({
      status: 401,
      message: 'Sua sessão expirou ou as credenciais são inválidas.',
    });
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(apiUnauthorizedEvent, listener);
  });

  it('returns a clear connection error when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline')));

    await expect(apiRequest('/students')).rejects.toMatchObject({
      status: 0,
      message: 'Não foi possível conectar à API. Verifique se o backend está ativo.',
    });
  });
});
