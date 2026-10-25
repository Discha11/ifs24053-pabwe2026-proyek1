import { tokenStorage, getToken, setToken, clearToken } from './services/tokenStorage.js';

export { getToken, setToken, clearToken, tokenStorage };

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Utilitas pemanggilan API HTTP terpusat dengan penanganan autentikasi, credentials cookie, dan error transparan.
 * Mendukung abort signal dan transfer cookie HttpOnly dengan kredensial include.
 *
 * @param {string} path
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
  const token = tokenStorage.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      credentials: 'include', // Dukungan transmisi HttpOnly cookie aman
      ...options,
      headers,
    });
  } catch (netErr) {
    if (netErr.name === 'AbortError') {
      throw netErr;
    }
    throw new Error('Tidak dapat terhubung ke server back-end. Pastikan server aktif lalu muat ulang.');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `Permintaan gagal (status ${res.status})`);
    err.status = res.status;
    err.details = data.details || [];
    throw err;
  }

  return data;
}

const send = (method, body, options = {}) => ({
  method,
  body: body ? JSON.stringify(body) : undefined,
  ...options,
});

export const api = {
  stats: (opts) => request('/stats', opts),
  cities: (opts) => request('/cities', opts),
  donors: (opts) => request('/donors', opts),
  match: (bloodType, city, opts) =>
    request(`/donors/match?${new URLSearchParams({ blood_type: bloodType, ...(city ? { city } : {}) })}`, opts),
  createDonor: (b, opts) => request('/donors', send('POST', b, opts)),
  markDonated: (id, opts) => request(`/donors/${id}/donated`, send('PATCH', undefined, opts)),
  deleteDonor: (id, opts) => request(`/donors/${id}`, send('DELETE', undefined, opts)),
  requests: (opts) => request('/requests', opts),
  createRequest: (b, opts) => request('/requests', send('POST', b, opts)),
  closeRequest: (id, opts) => request(`/requests/${id}/close`, send('PATCH', undefined, opts)),
  deleteRequest: (id, opts) => request(`/requests/${id}`, send('DELETE', undefined, opts)),
  // Auth
  register: (b, opts) => request('/auth/register', send('POST', b, opts)),
  login: (b, opts) => request('/auth/login', send('POST', b, opts)),
  me: (opts) => request('/auth/me', opts),
  updateProfile: (b, opts) => request('/auth/profile', send('PATCH', b, opts)),
  recordUserDonated: (opts) => request('/auth/donated', send('POST', undefined, opts)),
};
