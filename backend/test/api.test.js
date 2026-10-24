const { test, before, after } = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');

process.env.DB_PATH = path.join(os.tmpdir(), `sada-test-${Date.now()}.db`);
const db = require('../src/db');
require('../src/seed')(db);
const app = require('../src/app');

let server, base;
before(async () => { await new Promise((r) => { server = app.listen(0, r); }); base = `http://localhost:${server.address().port}`; });
after(() => server.close());
const j = (p, o = {}) => fetch(base + p, { headers: { 'Content-Type': 'application/json' }, ...o });
const post = (p, body) => j(p, { method: 'POST', body: JSON.stringify(body) });

test('match A+ hanya berisi golongan kompatibel (A+, A-, O+, O-)', async () => {
  const d = await (await j('/api/donors/match?blood_type=A%2B')).json();
  assert.ok(d.results.length > 0);
  assert.ok(d.results.every((r) => ['A+', 'A-', 'O+', 'O-'].includes(r.blood_type)));
  assert.ok(!d.results.some((r) => r.blood_type === 'B+'));
});

test('match O- hanya menerima O-', async () => {
  const d = await (await j('/api/donors/match?blood_type=O-')).json();
  assert.ok(d.results.every((r) => r.blood_type === 'O-'));
});

test('"+" yang terbaca spasi di query string tetap dikenali', async () => {
  const d = await (await j('/api/donors/match?blood_type=A+')).json();
  assert.strictEqual(d.blood_type, 'A+');
});

test('tanda minus Unicode (O−) diterima', async () => {
  const d = await (await j('/api/donors/match?blood_type=' + encodeURIComponent('O−'))).json();
  assert.strictEqual(d.blood_type, 'O-');
});

test('golongan tidak valid ditolak 400', async () => {
  assert.strictEqual((await j('/api/donors/match?blood_type=Z%2B')).status, 400);
});

test('batas jeda 75 hari: 76 hari siap, 60 hari belum', async () => {
  const d = await (await j('/api/donors/match?blood_type=AB%2B')).json();
  const by = Object.fromEntries(d.results.map((r) => [r.name, r]));
  assert.strictEqual(by['Lestari M.'].ready, true);   // 76 hari
  assert.strictEqual(by['Nia W.'].ready, false);      // 60 hari
  assert.strictEqual(by['Nia W.'].days_until_eligible, 15);
});

test('yang siap diurutkan lebih dulu; wa_url hanya untuk yang siap', async () => {
  const d = await (await j('/api/donors/match?blood_type=AB%2B')).json();
  const firstNotReady = d.results.findIndex((r) => !r.ready);
  assert.ok(d.results.slice(firstNotReady).every((r) => !r.ready));
  assert.ok(d.results.every((r) => (r.ready ? !!r.wa_url : r.wa_url === null)));
});

test('filter kota bekerja', async () => {
  const d = await (await j('/api/donors/match?blood_type=A%2B&city=Balige')).json();
  assert.ok(d.results.every((r) => r.city === 'Balige'));
});

test('respons tidak membocorkan nomor telepon penuh', async () => {
  const d = await (await j('/api/donors')).json();
  assert.ok(d.every((r) => !('phone' in r) && /^\d{4}\*{4}\d{3}$/.test(r.phone_masked)));
});

test('daftar pendonor: valid 201, nomor ganda 409, tidak valid 400', async () => {
  const body = { name: 'Budi Test', blood_type: 'B+', city: 'Balige', phone: '081377770001' };
  assert.strictEqual((await post('/api/donors', body)).status, 201);
  assert.strictEqual((await post('/api/donors', body)).status, 409);
  assert.strictEqual((await post('/api/donors', { ...body, phone: '12345' })).status, 400);
  assert.strictEqual((await post('/api/donors', { ...body, phone: '081377770002', city: 'Jakarta' })).status, 400);
  assert.strictEqual((await post('/api/donors', { ...body, phone: '081377770003', last_donated: '2999-01-01' })).status, 400);
});

test('catat donor hari ini membuat pendonor belum boleh donor', async () => {
  const id = (await (await j('/api/donors')).json()).find((x) => x.name === 'Rina S.').id;
  const r = await (await j(`/api/donors/${id}/donated`, { method: 'PATCH' })).json();
  assert.strictEqual(r.ready, false);
  assert.strictEqual(r.days_until_eligible, 75);
});

test('permintaan: urutan darurat dulu, buat, tutup', async () => {
  const list = await (await j('/api/requests')).json();
  assert.strictEqual(list[0].urgency, 'darurat');
  const c = await post('/api/requests', { blood_type: 'B-', hospital: 'RS Contoh', city: 'Medan', units: 2, urgency: 'segera', contact_phone: '081200001111' });
  assert.strictEqual(c.status, 201);
  const made = await c.json();
  assert.strictEqual((await j(`/api/requests/${made.id}/close`, { method: 'PATCH' })).status, 200);
  const open = await (await j('/api/requests')).json();
  assert.ok(!open.some((r) => r.id === made.id));
});

test('permintaan terjadwal wajib tanggal; jumlah kantong dibatasi', async () => {
  const base = { blood_type: 'A+', hospital: 'RS Contoh', city: 'Medan', units: 2, urgency: 'terjadwal', contact_phone: '081200001111' };
  assert.strictEqual((await post('/api/requests', base)).status, 400);
  assert.strictEqual((await post('/api/requests', { ...base, urgency: 'segera', units: 0 })).status, 400);
  assert.strictEqual((await post('/api/requests', { ...base, urgency: 'segera', units: 99 })).status, 400);
});

test('stats konsisten dengan data', async () => {
  const s = await (await j('/api/stats')).json();
  assert.ok(s.donors >= 12 && s.cities === 5 && s.urgent_requests >= 1);
});

test('hapus lalu 404 / JSON rusak 400', async () => {
  assert.strictEqual((await j('/api/donors/99999', { method: 'DELETE' })).status, 404);
  assert.strictEqual((await j('/api/requests', { method: 'POST', body: '{bad' })).status, 400);
});

test('auth register, login, me, profile, dan catat donor bekerja', async () => {
  const userPayload = {
    email: 'user.test@sada.id',
    password: 'password123',
    name: 'User Pengujian',
    blood_type: 'O+',
    city: 'Balige',
    phone: '081299998888',
    last_donated: '2026-01-01',
  };

  // Register
  const regRes = await post('/api/auth/register', userPayload);
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  assert.ok(regData.token);
  assert.strictEqual(regData.user.email, userPayload.email);
  assert.strictEqual(regData.user.name, userPayload.name);

  // Register ulang email sama harus 409
  assert.strictEqual((await post('/api/auth/register', userPayload)).status, 409);

  // Login sukses
  const loginRes = await post('/api/auth/login', { email: userPayload.email, password: userPayload.password });
  assert.strictEqual(loginRes.status, 200);
  const { token } = await loginRes.json();
  assert.ok(token);

  // Login gagal (password salah / email salah)
  assert.strictEqual((await post('/api/auth/login', { email: userPayload.email, password: 'wrong' })).status, 401);

  // Akses /api/auth/me tanpa token harus 401
  assert.strictEqual((await j('/api/auth/me')).status, 401);

  // Akses /api/auth/me dengan token
  const meRes = await j('/api/auth/me', { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
  assert.strictEqual(meRes.status, 200);
  const meData = await meRes.json();
  assert.strictEqual(meData.user.email, userPayload.email);

  // Update profil via /api/auth/profile
  const updateRes = await j('/api/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'User Updated', city: 'Laguboti' }),
  });
  assert.strictEqual(updateRes.status, 200);
  const updatedData = await updateRes.json();
  assert.strictEqual(updatedData.user.name, 'User Updated');
  assert.strictEqual(updatedData.user.city, 'Laguboti');

  // Catat donor hari ini via /api/auth/donated
  const donatedRes = await j('/api/auth/donated', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(donatedRes.status, 200);
  const donatedData = await donatedRes.json();
  assert.strictEqual(donatedData.user.ready, false);
  assert.strictEqual(donatedData.user.days_until_eligible, 75);
});
