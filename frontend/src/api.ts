/** An error response from the API, shaped by the server's ApiErrorHandler. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: 'Please check the details and try again.',
  403: 'Your session expired. Please reload the page.',
  404: 'That item no longer exists.',
  409: 'That item already exists.',
};

/** Turns any failed response body into an ApiError with a readable message. */
export function toApiError(status: number, body: string): ApiError {
  let message = '';
  let fieldErrors: Record<string, string> = {};
  try {
    const parsed = JSON.parse(body) as { message?: unknown; fieldErrors?: unknown };
    if (typeof parsed.message === 'string') message = parsed.message;
    if (parsed.fieldErrors && typeof parsed.fieldErrors === 'object') {
      fieldErrors = Object.fromEntries(
        Object.entries(parsed.fieldErrors as Record<string, unknown>).map(([key, value]) => [key, String(value)]),
      );
    }
  } catch {
    // Not JSON (e.g. a proxy error page): fall back to a generic message below.
  }
  return new ApiError(status, message || FALLBACK_MESSAGES[status] || `Something went wrong (${status}). Please try again.`, fieldErrors);
}

let csrfToken: Promise<string> | null = null;

/** Spring Security requires this token on every request that changes data. */
function loadCsrfToken(): Promise<string> {
  csrfToken ??= fetch('/api/auth/csrf', { credentials: 'same-origin' })
    .then((response) => {
      if (!response.ok) throw new ApiError(response.status, 'Could not start a secure session. Please reload the page.');
      return response.json() as Promise<{ token: string }>;
    })
    .then((body) => body.token)
    .catch((error: unknown) => {
      csrfToken = null;
      throw error;
    });
  return csrfToken;
}

function goToSignIn(): Promise<never> {
  window.location.assign('/auth.html');
  // The page is navigating away; never settle so callers don't flash an error first.
  return new Promise<never>(() => {});
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function request<T>(method: Method, path: string, body?: unknown, retried = false): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-XSRF-TOKEN'] = await loadCsrfToken();

  const response = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401) return goToSignIn();
  if (response.status === 403 && method !== 'GET' && !retried) {
    // The token rotates when the session changes (e.g. after signing in again). Fetch a fresh one once.
    csrfToken = null;
    return request<T>(method, path, body, true);
  }
  if (!response.ok) throw toApiError(response.status, await response.text());
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),

  /** Like get, but resolves to null instead of failing when the resource doesn't exist yet. */
  async getOptional<T>(path: string): Promise<T | null> {
    try {
      return await request<T>('GET', path);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async signOut(): Promise<void> {
    const token = await loadCsrfToken();
    await fetch('/logout', { method: 'POST', headers: { 'X-XSRF-TOKEN': token }, credentials: 'same-origin' });
    window.location.assign('/auth.html?logout');
  },
};
