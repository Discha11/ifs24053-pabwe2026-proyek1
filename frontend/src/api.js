import { tokenStorage, getToken, setToken } from './services/tokenStorage.js';

export { getToken, setToken, tokenStorage };

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Utilitas pemanggilan API HTTP terpusat dengan penanganan autentikasi dan error transparan.
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
    res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  } catch (_netErr) {
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

const send = (method, body) => ({ method, body: body ? JSON.stringify(body) : undefined });

export const api = {
  stats: () => request('/stats'),
  cities: () => request('/cities'),
  donors: () => request('/donors'),
  match: (bloodType, city) =>
    request(`/donors/match?${new URLSearchParams({ blood_type: bloodType, ...(city ? { city } : {}) })}`),
  createDonor: (b) => request('/donors', send('POST', b)),
  markDonated: (id) => request(`/donors/${id}/donated`, send('PATCH')),
  deleteDonor: (id) => request(`/donors/${id}`, send('DELETE')),
  requests: () => request('/requests'),
  createRequest: (b) => request('/requests', send('POST', b)),
  closeRequest: (id) => request(`/requests/${id}/close`, send('PATCH')),
  deleteRequest: (id) => request(`/requests/${id}`, send('DELETE')),
  // Auth
  register: (b) => request('/auth/register', send('POST', b)),
  login: (b) => request('/auth/login', send('POST', b)),
  me: () => request('/auth/me'),
  updateProfile: (b) => request('/auth/profile', send('PATCH', b)),
  recordUserDonated: () => request('/auth/donated', send('POST')),
};
