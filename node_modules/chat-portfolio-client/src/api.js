const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path) {
  return `${apiOrigin}${path}`;
}
