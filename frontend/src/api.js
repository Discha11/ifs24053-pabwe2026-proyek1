export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getToken = () => localStorage.getItem('sada_token') || '';
export const setToken = (t) => {
  if (t) localStorage.setItem('sada_token', t);
  else localStorage.removeItem('sada_token');
};

const MOCK_DONORS = [
  { id: 1, name: 'Rina S.', blood_type: 'A+', city: 'Balige', phone: '628120000318', phone_masked: '62812****318', ready: 1, last_donated: '2026-06-25', eligible_date: '2026-09-08', days_until_eligible: 0 },
  { id: 2, name: 'Doni P.', blood_type: 'O+', city: 'Balige', phone: '628120001502', phone_masked: '62812****502', ready: 0, last_donated: '2026-09-24', eligible_date: '2026-12-08', days_until_eligible: 45 },
  { id: 3, name: 'Mawar T.', blood_type: 'A-', city: 'Laguboti', phone: '628120002276', phone_masked: '62812****276', ready: 1, last_donated: '2026-07-25', eligible_date: '2026-10-08', days_until_eligible: 0 },
  { id: 4, name: 'Johannes L.', blood_type: 'O-', city: 'Parapat', phone: '628120003945', phone_masked: '62812****945', ready: 1, last_donated: '2026-04-06', eligible_date: '2026-06-20', days_until_eligible: 0 },
  { id: 5, name: 'Sari N.', blood_type: 'B+', city: 'Balige', phone: '628120004160', phone_masked: '62812****160', ready: 1, last_donated: '2026-08-04', eligible_date: '2026-10-18', days_until_eligible: 0 },
  { id: 6, name: 'Bona H.', blood_type: 'AB+', city: 'Pangururan', phone: '628120005739', phone_masked: '62812****739', ready: 0, last_donated: '2026-10-14', eligible_date: '2026-12-28', days_until_eligible: 65 },
];

const MOCK_REQUESTS = [
  { id: 1, blood_type: 'A+', hospital: 'RS Balige', city: 'Balige', units: 2, urgency: 'darurat', contact_phone: '628120000000', needed_date: null, status: 'open', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 2, blood_type: 'O-', hospital: 'Puskesmas Parapat', city: 'Parapat', units: 1, urgency: 'segera', contact_phone: '628120000000', needed_date: null, status: 'open', created_at: new Date(Date.now() - 26 * 3600000).toISOString() },
  { id: 3, blood_type: 'B+', hospital: 'RS Laguboti', city: 'Laguboti', units: 3, urgency: 'terjadwal', contact_phone: '628120000000', needed_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), status: 'open', created_at: new Date(Date.now() - 30 * 3600000).toISOString() },
  { id: 4, blood_type: 'AB+', hospital: 'RS Pangururan', city: 'Pangururan', units: 1, urgency: 'darurat', contact_phone: '628120000000', needed_date: null, status: 'open', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
];

const MOCK_STATS = {
  donors: 12,
  ready_today: 8,
  open_requests: 4,
  urgent_requests: 2,
  cities: 4,
};

const MOCK_CITIES = ['Balige', 'Laguboti', 'Parapat', 'Pangururan', 'Medan', 'Tarutung', 'Porsea'];

function getFallbackData(path, options = {}, token = '') {
  if (path === '/stats') return MOCK_STATS;
  if (path === '/cities') return MOCK_CITIES;
  if (path.startsWith('/donors/match')) {
    const results = MOCK_DONORS.map((d) => ({
      ...d,
      same_type: true,
      wa_url: `https://wa.me/${d.phone}`,
    }));
    return {
      blood_type: 'A+',
      total: results.length,
      ready_count: results.filter((d) => d.ready).length,
      compatible_types: ['A+', 'A-', 'O+', 'O-'],
      results,
    };
  }
  if (path === '/donors') return MOCK_DONORS;
  if (path === '/requests') return MOCK_REQUESTS;

  if (path === '/auth/me') {
    // If not authenticated, do not forge a logged in user!
    if (!token) return { user: null };
    const savedUser = localStorage.getItem('sada_user');
    return {
      user: savedUser
        ? JSON.parse(savedUser)
        : {
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
          },
    };
  }

  if (path === '/auth/login' || path === '/auth/register') {
    const body = options.body ? JSON.parse(options.body) : {};
    return {
      token: 'sada_demo_token',
      user: {
        id: 1,
        name: body.name || (body.email ? body.email.split('@')[0] : 'Discha Hutasoit'),
        email: body.email || 'discha@gmail.com',
        blood_type: body.blood_type || 'O+',
        city: body.city || 'Balige',
        phone: body.phone || '081234567890',
        ready: true,
        last_donated: '2026-07-01',
        eligible_date: '2026-09-14',
        days_until_eligible: 0,
      },
    };
  }

  return null;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const isBrowser = typeof window !== 'undefined';
  const isProduction = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const isLocalApi = API_URL.includes('localhost') || API_URL.includes('127.0.0.1');

  // Static preview on Vercel without separate backend container
  if (isProduction && isLocalApi) {
    const fallback = getFallbackData(path, options, token);
    if (fallback !== null) return fallback;
  }

  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  } catch (_netErr) {
    // Terbuka dan transparan: lemparkan error jaringan agar UI dapat menampilkan status error server dengan jelas
    throw new Error('Tidak dapat terhubung ke server back-end. Pastikan server aktif lalu muat ulang.');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Propagate backend errors clearly without masking
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
