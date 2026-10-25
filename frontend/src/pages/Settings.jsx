import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCities, useForm } from '../hooks/index.js';
import { validationSchemas, sanitizePhone } from '../utils/validation.js';

export default function Settings() {
  const { user, loading, updateProfile } = useAuth();
  const { cities } = useCities();
  const [msg, setMsg] = useState('');

  const { values, errors, submitting, handleChange, handleSubmit, setFieldValue } = useForm({
    initialValues: {
      name: '',
      city: '',
      phone: '',
      notif: true,
    },
    validationSchema: validationSchemas.settings,
    onSubmit: async (formValues) => {
      setMsg('');
      await updateProfile({
        name: formValues.name.trim(),
        city: formValues.city,
        phone: sanitizePhone(formValues.phone),
      });
      setMsg('Pengaturan akun berhasil disimpan.');
    },
  });

  useEffect(() => {
    if (user) {
      setFieldValue('name', user.name || '');
      setFieldValue('city', user.city || '');
      setFieldValue('phone', user.phone || '');
    }
  }, [user, setFieldValue]);

  if (loading) {
    return (
      <main id="main-content" role="main">
        <div className="wrap pg">
          <h1 className="ph">Pengaturan Akun</h1>
          <p className="nx">Memuat data pengaturan...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main id="main-content" role="main">
        <div className="wrap pg">
          <h1 className="ph">Pengaturan Akun</h1>
          <p className="sub">Silakan masuk ke akun Anda untuk mengelola preferensi profil dan notifikasi.</p>
          <div className="mt-24">
            <Link to="/masuk" className="b1">Masuk Sekarang</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" role="main">
      <div className="wrap pg box-w-38">
        <h1 className="ph">Pengaturan Akun</h1>
        <p className="sub">Kelola preferensi akun, kontak darurat, dan informasi profil Anda.</p>

        {msg && <p className="msg ok" role="status">{msg}</p>}
        {errors.length > 0 && (
          <ul className="errs" role="alert">
            {errors.map((errorMsg) => (
              <li key={errorMsg}>{errorMsg}</li>
            ))}
          </ul>
        )}

        <form className="fm w-full" onSubmit={handleSubmit}>
          <label>
            Nama Lengkap
            <input
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange('name')}
              required
            />
          </label>

          <label>
            Alamat Email
            <input
              id="email"
              name="email"
              value={user?.email || ''}
              disabled
              className="opacity-70"
            />
          </label>

          <div className="two">
            <label>
              Nomor WhatsApp
              <input
                id="phone"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={handleChange('phone')}
                placeholder="081234567890"
              />
            </label>
            <label>
              Kota Domisili
              <select id="city" name="city" value={values.city} onChange={handleChange('city')}>
                {cities?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              id="notif"
              checked={values.notif}
              onChange={handleChange('notif')}
              className="auto-width"
            />
            <span>Terima pemberitahuan WhatsApp saat ada kebutuhan darah darurat yang cocok</span>
          </label>

          <button className="go2 mt-18" disabled={submitting} type="submit">
            {submitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </div>
    </main>
  );
}
