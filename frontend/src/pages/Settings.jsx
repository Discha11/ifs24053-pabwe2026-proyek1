import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCities } from '../hooks/index.js';
import { validationSchemas, sanitizePhone } from '../utils/validation.js';
import { getErrorMessage } from '../utils/errors.js';

export default function Settings() {
  const { user, loading, updateProfile } = useAuth();
  const { cities } = useCities();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [notif, setNotif] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCity(user.city || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setMsg('');
    setErr('');

    const validationErrors = validationSchemas.settings({ name, phone });
    if (validationErrors.length > 0) {
      setErr(validationErrors[0]);
      return;
    }

    setBusy(true);
    try {
      await updateProfile({
        name: name.trim(),
        city,
        phone: sanitizePhone(phone),
      });
      setMsg('Pengaturan akun berhasil disimpan.');
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

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
        {err && <p className="msg err" role="alert">{err}</p>}

        <form className="fm w-full" onSubmit={handleSave}>
          <label>
            Nama Lengkap
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
              />
            </label>
            <label>
              Kota Domisili
              <select id="city" name="city" value={city} onChange={(e) => setCity(e.target.value)}>
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
              checked={notif}
              onChange={(e) => setNotif(e.target.checked)}
              className="auto-width"
            />
            <span>Terima pemberitahuan WhatsApp saat ada kebutuhan darah darurat yang cocok</span>
          </label>

          <button className="go2 mt-18" disabled={busy} type="submit">
            {busy ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </div>
    </main>
  );
}
