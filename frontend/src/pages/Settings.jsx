import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCities } from '../hooks/index.js';

export default function Settings() {
  const navigate = useNavigate();
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

    if (name.trim().length < 3) {
      setErr('Nama lengkap minimal 3 karakter.');
      return;
    }

    if (phone) {
      const cleanPhone = phone.trim().replace(/[-\s]/g, '');
      const phoneRegex = /^(08|\+628|628)[0-9]{8,12}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setErr('Nomor WhatsApp harus nomor Indonesia yang valid (contoh: 081234567890).');
        return;
      }
    }

    setBusy(true);
    try {
      await updateProfile({
        name: name.trim(),
        city,
        phone: phone ? phone.trim().replace(/[-\s]/g, '') : '',
      });
      setMsg('Pengaturan akun berhasil disimpan.');
    } catch (e) {
      setErr(e.message || 'Gagal menyimpan pengaturan');
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
          <div style={{ marginTop: 24 }}>
            <Link to="/masuk" className="b1">Masuk Sekarang</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" role="main">
      <div className="wrap pg" style={{ maxWidth: '38rem' }}>
        <h1 className="ph">Pengaturan Akun</h1>
        <p className="sub">Kelola preferensi akun, kontak darurat, dan informasi profil Anda.</p>

        {msg && <p className="msg ok" role="status">{msg}</p>}
        {err && <p className="msg err" role="alert">{err}</p>}

        <form className="fm" style={{ maxWidth: '100%' }} onSubmit={handleSave}>
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
              style={{ opacity: 0.7 }}
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

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 12 }}>
            <input
              type="checkbox"
              id="notif"
              checked={notif}
              onChange={(e) => setNotif(e.target.checked)}
              style={{ width: 'auto', margin: 0 }}
            />
            <span>Terima pemberitahuan WhatsApp saat ada kebutuhan darah darurat yang cocok</span>
          </label>

          <button className="go2" disabled={busy} type="submit" style={{ marginTop: 18 }}>
            {busy ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </div>
    </main>
  );
}
