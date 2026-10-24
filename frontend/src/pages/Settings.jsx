import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading, updateProfile } = useAuth();
  const [cities, setCities] = useState([]);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [notif, setNotif] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);


  useEffect(() => {
    api.cities().then(setCities).catch(() => {});
  }, []);

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
    setBusy(true);
    try {
      await updateProfile({ name, city, phone });
      setMsg('Pengaturan akun berhasil disimpan.');
    } catch (e) {
      setErr(e.message || 'Gagal menyimpan pengaturan');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
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
                {cities.map((c) => (
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
