import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCities } from '../hooks/index.js';
import { BLOOD_TYPES, formatBloodType } from '../lib.js';
import {
  isValidIndonesianPhone,
  sanitizePhone,
  isValidEmail,
  hasMinLength,
} from '../utils/validation.js';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { cities } = useCities();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    blood_type: 'A+',
    city: '',
    phone: '',
    last_donated: '',
  });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (cities?.length > 0 && !formData.city) {
      setFormData((prev) => ({ ...prev, city: cities[0] }));
    }
  }, [cities, formData.city]);

  const setField = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  function validateForm() {
    const errs = [];
    if (!hasMinLength(formData.name, 3)) {
      errs.push('Nama lengkap minimal 3 karakter.');
    }

    if (!isValidEmail(formData.email)) {
      errs.push('Format alamat email tidak valid.');
    }

    if (formData.password.length < 6) {
      errs.push('Kata sandi minimal 6 karakter demi keamanan akun.');
    }

    if (!BLOOD_TYPES.includes(formData.blood_type)) {
      errs.push('Pilih golongan darah yang valid.');
    }

    if (!formData.city) {
      errs.push('Pilih kota domisili Anda.');
    }

    const cleanPhone = sanitizePhone(formData.phone);
    if (!isValidIndonesianPhone(cleanPhone)) {
      errs.push('Nomor WhatsApp harus nomor Indonesia yang valid (contoh: 081234567890).');
    }

    if (formData.last_donated) {
      const today = new Date().toISOString().slice(0, 10);
      if (formData.last_donated > today) {
        errs.push('Tanggal terakhir donor tidak boleh lebih dari hari ini.');
      }
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setBusy(true);
    try {
      await register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim().replace(/[-\s]/g, ''),
        last_donated: formData.last_donated || null,
      });
      navigate('/profil');
    } catch (err) {
      setErrors(err.details?.length ? err.details : [err.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" role="main">
      <div className="wrap pg" style={{ maxWidth: '36rem' }}>
        <h1 className="ph">Daftar Akun Pendonor</h1>
        <p className="sub">
          Daftarkan diri Anda sebagai bagian dari Sahabat Aksi Donor Anda di kawasan Danau Toba.
        </p>

        <form className="fm" style={{ maxWidth: '100%' }} onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <ul className="errs" role="alert">
              {errors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          )}

          <label>
            Nama Lengkap
            <input
              value={formData.name}
              onChange={setField('name')}
              maxLength={80}
              placeholder="Mis. Binsar Nababan"
              required
            />
          </label>

          <div className="two">
            <label>
              Alamat Email
              <input
                type="email"
                value={formData.email}
                onChange={setField('email')}
                placeholder="nama@email.com"
                required
              />
            </label>
            <label>
              Kata Sandi
              <input
                type="password"
                value={formData.password}
                onChange={setField('password')}
                placeholder="Minimal 6 karakter"
                required
              />
            </label>
          </div>

          <div className="two">
            <label>
              Golongan Darah
              <select value={formData.blood_type} onChange={setField('blood_type')}>
                {BLOOD_TYPES.map((g) => (
                  <option key={g} value={g}>{formatBloodType(g)}</option>
                ))}
              </select>
            </label>
            <label>
              Kota Domisili
              <select value={formData.city} onChange={setField('city')}>
                {cities?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Nomor WhatsApp
            <input
              type="tel"
              inputMode="tel"
              value={formData.phone}
              onChange={setField('phone')}
              placeholder="081234567890"
              required
            />
          </label>

          <label>
            Terakhir Donor Darah (Kosongkan jika belum pernah)
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={formData.last_donated}
              onChange={setField('last_donated')}
            />
          </label>

          <button className="go2" disabled={busy}>
            {busy ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
          </button>

          <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 14, color: 'var(--muted)' }}>
            Sudah memiliki akun? <Link to="/masuk" style={{ fontWeight: 700, color: 'var(--red)' }}>Masuk di Sini</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
