// Aturan domain SADA: kompatibilitas golongan darah, jeda donor, validasi input.
const GOL = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// Penerima (kunci) -> daftar golongan pendonor yang cocok
const CAN = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': GOL.slice(),
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};
const CITIES = ['Balige', 'Laguboti', 'Parapat', 'Pangururan', 'Medan'];
const URGENCY = ['darurat', 'segera', 'terjadwal'];
const MIN_DAYS = 75; // jeda minimal antar donor (hari)

// Menerima "A+", "O−" (tanda minus Unicode), dan "A " (karena "+" di query string terbaca spasi).
function normalizeBlood(input) {
  let s = String(input ?? '').replace(/\u2212/g, '-');
  if (/^(A|B|AB|O)\s+$/i.test(s)) s = s.trim() + '+';
  s = s.trim().toUpperCase();
  return GOL.includes(s) ? s : null;
}

// Hasil: nomor format internasional tanpa '+', mis. 6281200001234; null jika tidak valid.
function normalizePhone(input) {
  let d = String(input ?? '').replace(/[\s().-]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (!/^\d+$/.test(d)) return null;
  if (d.startsWith('0')) d = '62' + d.slice(1);
  return /^628\d{8,11}$/.test(d) ? d : null;
}

const maskPhone = (intl) => {
  const local = '0' + intl.slice(2);
  return local.slice(0, 4) + '****' + local.slice(-3);
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const daysBetween = (fromISO, toISO) => Math.floor((Date.parse(toISO) - Date.parse(fromISO)) / 86400000);
const addDays = (iso, n) => new Date(Date.parse(iso) + n * 86400000).toISOString().slice(0, 10);

function validateDonor(b = {}) {
  const errors = [];
  const name = String(b.name ?? '').trim();
  if (name.length < 2 || name.length > 80) errors.push('name harus 2-80 karakter');
  const blood = normalizeBlood(b.blood_type);
  if (!blood) errors.push(`blood_type harus salah satu dari: ${GOL.join(', ')}`);
  if (!CITIES.includes(b.city)) errors.push(`city harus salah satu dari: ${CITIES.join(', ')}`);
  const phone = normalizePhone(b.phone);
  if (!phone) errors.push('phone harus nomor WhatsApp Indonesia yang valid (mis. 081234567890)');
  let last = null;
  if (b.last_donated) {
    if (!isDate(b.last_donated)) errors.push('last_donated harus berformat YYYY-MM-DD');
    else if (b.last_donated > todayISO()) errors.push('last_donated tidak boleh di masa depan');
    else last = b.last_donated;
  }
  return { errors, value: { name, blood_type: blood, city: b.city, phone, last_donated: last } };
}

function validateRequest(b = {}) {
  const errors = [];
  const blood = normalizeBlood(b.blood_type);
  if (!blood) errors.push(`blood_type harus salah satu dari: ${GOL.join(', ')}`);
  const hospital = String(b.hospital ?? '').trim();
  if (hospital.length < 3 || hospital.length > 100) errors.push('hospital harus 3-100 karakter');
  if (!CITIES.includes(b.city)) errors.push(`city harus salah satu dari: ${CITIES.join(', ')}`);
  const units = Number(b.units);
  if (!Number.isInteger(units) || units < 1 || units > 20) errors.push('units harus bilangan bulat 1-20');
  if (!URGENCY.includes(b.urgency)) errors.push(`urgency harus salah satu dari: ${URGENCY.join(', ')}`);
  const contact = normalizePhone(b.contact_phone);
  if (!contact) errors.push('contact_phone harus nomor WhatsApp Indonesia yang valid');
  let needed = null;
  if (b.needed_date) {
    if (!isDate(b.needed_date)) errors.push('needed_date harus berformat YYYY-MM-DD');
    else if (b.needed_date < todayISO()) errors.push('needed_date tidak boleh di masa lalu');
    else needed = b.needed_date;
  } else if (b.urgency === 'terjadwal') errors.push('needed_date wajib untuk permintaan terjadwal');
  return { errors, value: { blood_type: blood, hospital, city: b.city, units, urgency: b.urgency, contact_phone: contact, needed_date: needed } };
}

function validateUser(b = {}) {
  const errors = [];
  const email = String(b.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email harus alamat email yang valid');
  const password = String(b.password ?? '');
  if (password.length < 6) errors.push('password minimal 6 karakter');
  const donorVal = validateDonor(b);
  errors.push(...donorVal.errors);
  return { errors, value: { email, password, ...donorVal.value } };
}

module.exports = { GOL, CAN, CITIES, URGENCY, MIN_DAYS, normalizeBlood, normalizePhone, maskPhone, todayISO, daysBetween, addDays, validateDonor, validateRequest, validateUser };
