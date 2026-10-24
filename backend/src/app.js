const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const R = require('./rules');

const JWT_SECRET = process.env.JWT_SECRET || 'sada-danau-toba-secret-key-2026';

const app = express();
app.use(cors());
app.use(express.json());

const waLink = (intl, text) => `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;

function userView(u) {
  const days = u.last_donated ? R.daysBetween(u.last_donated, R.todayISO()) : null;
  const ready = days === null || days >= R.MIN_DAYS;
  const left = ready ? 0 : R.MIN_DAYS - days;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    blood_type: u.blood_type,
    city: u.city,
    phone: u.phone,
    phone_masked: R.maskPhone(u.phone),
    last_donated: u.last_donated,
    days_since: days,
    ready,
    days_until_eligible: left,
    eligible_date: R.addDays(R.todayISO(), left),
    created_at: u.created_at,
  };
}

function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token autentikasi tidak ditemukan' });
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });
    req.user = user;
    next();
  } catch (_e) {
    return res.status(401).json({ error: 'Token tidak valid atau telah kedaluwarsa' });
  }
}

function donorView(row) {
  const days = row.last_donated ? R.daysBetween(row.last_donated, R.todayISO()) : null;
  const ready = days === null || days >= R.MIN_DAYS;
  const left = ready ? 0 : R.MIN_DAYS - days;
  return {
    id: row.id, name: row.name, blood_type: row.blood_type, city: row.city,
    phone_masked: R.maskPhone(row.phone), last_donated: row.last_donated,
    days_since: days, ready, days_until_eligible: left,
    eligible_date: R.addDays(R.todayISO(), left),
  };
}

function requestView(r) {
  return {
    id: r.id, blood_type: r.blood_type, hospital: r.hospital, city: r.city, units: r.units,
    urgency: r.urgency, needed_date: r.needed_date, status: r.status, created_at: r.created_at,
    wa_url: waLink(r.contact_phone, `Halo, saya bisa donor ${r.blood_type} untuk ${r.hospital}`),
  };
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/cities', (_req, res) => res.json(R.CITIES));

app.get('/api/stats', (_req, res) => {
  const donors = db.prepare('SELECT * FROM donors').all().map(donorView);
  const open = db.prepare("SELECT urgency FROM requests WHERE status='open'").all();
  res.json({
    donors: donors.length,
    ready_today: donors.filter((d) => d.ready).length,
    cities: new Set(donors.map((d) => d.city)).size,
    open_requests: open.length,
    urgent_requests: open.filter((r) => r.urgency === 'darurat').length,
  });
});

// ---- Pendonor ----
app.get('/api/donors', (_req, res) => {
  res.json(db.prepare('SELECT * FROM donors ORDER BY name').all().map(donorView));
});

app.get('/api/donors/match', (req, res) => {
  const bt = R.normalizeBlood(req.query.blood_type);
  if (!bt) return res.status(400).json({ error: 'blood_type tidak valid' });
  const city = req.query.city || '';
  const compat = R.CAN[bt];
  const rows = db.prepare(`SELECT * FROM donors WHERE blood_type IN (${compat.map(() => '?').join(',')})
                           ${city ? 'AND city = ?' : ''}`).all(...compat, ...(city ? [city] : []));
  const results = rows.map((row) => {
    const v = donorView(row);
    return {
      ...v, same_type: row.blood_type === bt,
      wa_url: v.ready ? waLink(row.phone, `Halo ${row.name}, ada permintaan darah ${bt} di ${row.city}. Apakah Anda bisa donor?`) : null,
    };
  });
  // yang siap dulu; di antara yang siap, yang istirahatnya paling lama; lalu yang paling cepat boleh donor
  results.sort((a, b) => (b.ready - a.ready) || (a.ready ? b.days_since - a.days_since : a.days_until_eligible - b.days_until_eligible));
  res.json({ blood_type: bt, city, total: results.length, ready_count: results.filter((r) => r.ready).length, results });
});

app.post('/api/donors', (req, res) => {
  const { errors, value } = R.validateDonor(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validasi gagal', details: errors });
  try {
    const info = db.prepare(`INSERT INTO donors (name, blood_type, city, phone, last_donated)
                             VALUES (@name, @blood_type, @city, @phone, @last_donated)`).run(value);
    res.status(201).json(donorView(db.prepare('SELECT * FROM donors WHERE id = ?').get(info.lastInsertRowid)));
  } catch (_e) {
    return res.status(409).json({ error: 'Nomor WhatsApp sudah terdaftar' });
  }
});

app.patch('/api/donors/:id/donated', (req, res) => {
  const info = db.prepare('UPDATE donors SET last_donated = ? WHERE id = ?').run(R.todayISO(), req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Pendonor tidak ditemukan' });
  res.json(donorView(db.prepare('SELECT * FROM donors WHERE id = ?').get(req.params.id)));
});

app.delete('/api/donors/:id', (req, res) => {
  const info = db.prepare('DELETE FROM donors WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Pendonor tidak ditemukan' });
  res.status(204).end();
});

// ---- Permintaan darah ----
app.get('/api/requests', (req, res) => {
  const status = req.query.status || 'open';
  const where = status === 'all' ? '' : 'WHERE status = ?';
  const rows = db.prepare(`SELECT * FROM requests ${where}
    ORDER BY CASE urgency WHEN 'darurat' THEN 0 WHEN 'segera' THEN 1 ELSE 2 END, created_at DESC`)
    .all(...(where ? [status] : []));
  res.json(rows.map(requestView));
});

app.post('/api/requests', (req, res) => {
  const { errors, value } = R.validateRequest(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validasi gagal', details: errors });
  const info = db.prepare(`INSERT INTO requests (blood_type, hospital, city, units, urgency, contact_phone, needed_date)
                           VALUES (@blood_type, @hospital, @city, @units, @urgency, @contact_phone, @needed_date)`).run(value);
  res.status(201).json(requestView(db.prepare('SELECT * FROM requests WHERE id = ?').get(info.lastInsertRowid)));
});

app.patch('/api/requests/:id/close', (req, res) => {
  const info = db.prepare("UPDATE requests SET status = 'closed' WHERE id = ?").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Permintaan tidak ditemukan' });
  res.json(requestView(db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id)));
});

app.delete('/api/requests/:id', (req, res) => {
  const info = db.prepare('DELETE FROM requests WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Permintaan tidak ditemukan' });
  res.status(204).end();
});

// ---- Autentikasi (Register, Login, Me, Profile, Catat Donor) ----
app.post('/api/auth/register', (req, res) => {
  const { errors, value } = R.validateUser(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validasi gagal', details: errors });

  const existEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(value.email);
  if (existEmail) return res.status(409).json({ error: 'Email sudah terdaftar. Silakan login.' });

  const existPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(value.phone);
  if (existPhone) return res.status(409).json({ error: 'Nomor WhatsApp sudah terdaftar pada akun lain.' });

  const hash = bcrypt.hashSync(value.password, 10);

  // Sinkronkan atau daftarkan ke tabel donors agar bisa dicocokkan
  let donor = db.prepare('SELECT id FROM donors WHERE phone = ?').get(value.phone);
  let donorId;
  if (!donor) {
    const dInfo = db.prepare(`INSERT INTO donors (name, blood_type, city, phone, last_donated)
                             VALUES (?, ?, ?, ?, ?)`).run(value.name, value.blood_type, value.city, value.phone, value.last_donated);
    donorId = dInfo.lastInsertRowid;
  } else {
    donorId = donor.id;
  }

  const uInfo = db.prepare(`INSERT INTO users (email, password, name, blood_type, city, phone, last_donated, donor_id)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    value.email, hash, value.name, value.blood_type, value.city, value.phone, value.last_donated, donorId
  );

  const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(uInfo.lastInsertRowid);
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: userView(newUser) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  if (!user || !bcrypt.compareSync(String(password), user.password)) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: userView(user) });
});

app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ user: userView(req.user) });
});

app.patch('/api/auth/profile', authRequired, (req, res) => {
  const { name, city, last_donated } = req.body || {};
  const current = req.user;
  const newName = name !== undefined ? String(name).trim() : current.name;
  const newCity = city !== undefined ? String(city).trim() : current.city;
  let newLast = current.last_donated;
  if (last_donated !== undefined) {
    if (last_donated && last_donated > R.todayISO()) {
      return res.status(400).json({ error: 'Tanggal donor tidak boleh di masa depan' });
    }
    newLast = last_donated || null;
  }

  db.prepare(`UPDATE users SET name = ?, city = ?, last_donated = ? WHERE id = ?`)
    .run(newName, newCity, newLast, current.id);

  if (current.donor_id) {
    db.prepare(`UPDATE donors SET name = ?, city = ?, last_donated = ? WHERE id = ?`)
      .run(newName, newCity, newLast, current.donor_id);
  }

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(current.id);
  res.json({ user: userView(updated) });
});

app.post('/api/auth/donated', authRequired, (req, res) => {
  const today = R.todayISO();
  db.prepare('UPDATE users SET last_donated = ? WHERE id = ?').run(today, req.user.id);
  if (req.user.donor_id) {
    db.prepare('UPDATE donors SET last_donated = ? WHERE id = ?').run(today, req.user.donor_id);
  }
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: userView(updated) });
});

app.use((_req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON tidak valid' });
  console.error(err);
  res.status(500).json({ error: 'Kesalahan server' });
});

module.exports = app;
