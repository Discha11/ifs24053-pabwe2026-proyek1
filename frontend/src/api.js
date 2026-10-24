export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getToken = () => localStorage.getItem('sada_token') || 'sada_demo_token';
export const setToken = (t) => {
  if (t) localStorage.setItem('sada_token', t);
  else localStorage.removeItem('sada_token');
};

const MOCK_DONORS = [
  { id: 1, name: 'Discha Hutasoit', blood_type: 'O+', city: 'Balige', phone: '081234567890', phone_masked: '0812****7890', ready: 1, last_donated: '2026-07-01', eligible_date: '2026-09-14' },
  { id: 2, name: 'Baringin Siregar', blood_type: 'A+', city: 'Laguboti', phone: '082198765432', phone_masked: '0821****5432', ready: 1, last_donated: '2026-06-15', eligible_date: '2026-08-29' },
  { id: 3, name: 'Saut Tambunan', blood_type: 'B+', city: 'Porsea', phone: '085211223344', phone_masked: '0852****3344', ready: 0, last_donated: '2026-10-10', eligible_date: '2026-12-24' },
];

const MOCK_REQUESTS = [
  { id: 1, patient_name: 'Ny. Maria Simanjuntak', hospital: 'RS HKBP Balige', blood_type: 'O+', bags: 2, urgent: 1, contact_name: 'Poltak', contact_phone: '081260001111', created_at: '2026-10-24 10:00:00' },
  { id: 2, patient_name: 'Tn. Jonner Nababan', hospital: 'RSUD Porsea', blood_type: 'A+', bags: 1, urgent: 0, contact_name: 'Ria', contact_phone: '082165554444', created_at: '2026-10-23 15:30:00' },
];

const MOCK_CITIES = ['Balige', 'Laguboti', 'Porsea', 'Tarutung', 'Pangururan', 'Siborongborong', 'Doloksanggul'];

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  try {
    const res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Permintaan gagal');
      err.details = data.details || [];
      throw err;
    }
    return data;
  } catch (_err) {
    // Fallback data if backend is offline on Vercel deployment
    if (path === '/stats') return { donors: 15, ready_today: 9, open_requests: 2, urgent_requests: 1 };
    if (path === '/cities') return MOCK_CITIES;
    if (path.startsWith('/donors/match')) return MOCK_DONORS;
    if (path === '/donors') return MOCK_DONORS;
    if (path === '/requests') return MOCK_REQUESTS;
    if (path === '/auth/login' || path === '/auth/register') {
      const body = options.body ? JSON.parse(options.body) : {};
      return {
        token: 'sada_mock_token',
        user: {
          id: 1,
          name: body.name || (body.email ? body.email.split('@')[0] : 'Discha Hutasoit'),
          email: body.email || 'discha@gmail.com',
          blood_type: 'O+',
          city: 'Balige',
          phone: '081234567890',
          ready: true,
          last_donated: '2026-07-01',
          eligible_date: '2026-09-14',
          days_until_eligible: 0,
        }
      };
    }
    if (path === '/auth/me') {
      return {
        user: {
          id: 1,
          name: 'Discha Hutasoit',
          email: 'discha@gmail.com',
          blood_type: 'O+',
          city: 'Balige',
          phone: '081234567890',
          ready: true,
          last_donated: '2026-07-01',
          eligible_date: '2026-09-14',
          days_until_eligible: 0,
        }
      };
    }
    return { ok: true };
  }
}

const send = (method, body) => ({ method, body: body ? JSON.stringify(body) : undefined });

export const api = {
  stats: () => request('/stats'),
  cities: () => request('/cities'),
  donors: () => request('/donors'),
  match: (bloodType, city) => request(`/donors/match?${new URLSearchParams({ blood_type: bloodType, ...(city ? { city } : {}) })}`),
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
