// Keep browser requests same-origin in development so Vite can proxy them to
// the backend. This avoids local CORS failures when the frontend port changes.
export const host = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:8080');
export const api_version = 'api/v1';

export const baseUrl = `${host}/${api_version}`;
