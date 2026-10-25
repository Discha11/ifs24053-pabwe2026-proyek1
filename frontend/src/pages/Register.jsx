import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCities, useForm } from '../hooks/index.js';
import { BLOOD_TYPES, formatBloodType } from '../lib.js';
import { validationSchemas, sanitizePhone } from '../utils/validation.js';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { cities } = useCities();

  const { values, errors, submitting, handleChange, handleSubmit, setFieldValue } = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      blood_type: 'A+',
      city: '',
      phone: '',
      last_donated: '',
    },
    validationSchema: validationSchemas.register,
    onSubmit: async (formValues) => {
      await register({
        ...formValues,
        name: formValues.name.trim(),
        email: formValues.email.trim().toLowerCase(),
        phone: sanitizePhone(formValues.phone),
        last_donated: formValues.last_donated || null,
      });
      navigate('/profil');
    },
  });

  useEffect(() => {
    if (cities?.length > 0 && !values.city) {
      setFieldValue('city', cities[0]);
    }
  }, [cities, values.city, setFieldValue]);

  return (
    <main id="main-content" role="main">
      <div className="wrap pg box-w-36">
        <h1 className="ph">Daftar Akun Pendonor</h1>
        <p className="sub">
          Daftarkan diri Anda sebagai bagian dari Sahabat Aksi Donor Anda di kawasan Danau Toba.
        </p>

        <form className="fm w-full" onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <ul className="errs" role="alert">
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}

          <label>
            Nama Lengkap
            <input
              value={values.name}
              onChange={handleChange('name')}
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
                value={values.email}
                onChange={handleChange('email')}
                placeholder="nama@email.com"
                required
              />
            </label>
            <label>
              Kata Sandi
              <input
                type="password"
                value={values.password}
                onChange={handleChange('password')}
                placeholder="Minimal 6 karakter"
                required
              />
            </label>
          </div>

          <div className="two">
            <label>
              Golongan Darah
              <select value={values.blood_type} onChange={handleChange('blood_type')}>
                {BLOOD_TYPES.map((g) => (
                  <option key={g} value={g}>{formatBloodType(g)}</option>
                ))}
              </select>
            </label>
            <label>
              Kota Domisili
              <select value={values.city} onChange={handleChange('city')}>
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
              value={values.phone}
              onChange={handleChange('phone')}
              placeholder="081234567890"
              required
            />
          </label>

          <label>
            Terakhir Donor Darah (Kosongkan jika belum pernah)
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={values.last_donated}
              onChange={handleChange('last_donated')}
            />
          </label>

          <button className="go2" disabled={submitting}>
            {submitting ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
          </button>

          <p className="auth-sub-link">
            Sudah memiliki akun? <Link to="/masuk">Masuk di Sini</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
