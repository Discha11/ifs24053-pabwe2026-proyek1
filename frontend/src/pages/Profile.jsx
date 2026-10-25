import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useCities } from '../hooks/index.js';
import { fg, fmtDate } from '../lib.js';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading, logout, updateProfile, recordDonated } = useAuth();
  const { cities } = useCities();
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editLastDonated, setEditLastDonated] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditCity(user.city);
      setEditLastDonated(user.last_donated || '');
    }
  }, [user]);

  if (loading) {
    return (
      <main id="main-content" role="main">
        <div className="wrap pg">
          <h1 className="ph">Profil Pendonor</h1>
          <p className="nx">Memuat data profil pendonor...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main id="main-content" role="main">
        <div className="wrap pg">
          <h1 className="ph">Profil Pendonor</h1>
          <p className="sub">Silakan masuk ke akun Anda untuk melihat profil dan kartu pendonor digital.</p>
          <div style={{ marginTop: 24 }}>
            <Link to="/masuk" className="b1">Masuk Sekarang</Link>
          </div>
        </div>
      </main>
    );
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setMsg('');
    setErr('');
    setBusy(true);
    try {
      await updateProfile({
        name: editName,
        city: editCity,
        last_donated: editLastDonated || null,
      });
      setMsg('Profil berhasil diperbarui.');
    } catch (error) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  }

  const handleRecordDonated = () => {
    setShowConfirm(true);
  };

  const executeRecordDonated = async () => {
    setShowConfirm(false);
    setMsg('');
    setErr('');
    try {
      await recordDonated();
      setMsg('Donor hari ini berhasil dicatat! Terima kasih atas aksi kemanusiaan Anda.');
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <main id="main-content" role="main">
      <div className="wrap pg" style={{ maxWidth: '42rem' }}>
        <div className="ph-row">
          <h1 className="ph">Profil Pendonor</h1>
          <button className="sbtn danger" onClick={logout}>Keluar (Logout)</button>
        </div>

        {msg && <p className="msg ok" role="status">{msg}</p>}
        {err && <p className="msg err" role="alert">{err}</p>}

        {/* Digital Donor Card */}
        <div className="donor-id-card">
          <div className="card-top-row">
            <div className="blood-type-box" style={{ width: 68, height: 68 }}>
              <span className="blood-text" style={{ fontSize: 26 }}>{fg(user.blood_type)}</span>
              <span className="blood-sub">RBC</span>
            </div>
            <div className="card-hospital-meta">
              <span className="id-card-title">KARTU PENDONOR DIGITAL SADA</span>
              <h2 className="hospital-name" style={{ fontSize: 22 }}>{user.name}</h2>
              <div className="hospital-loc">
                <span>📍 Domisili: {user.city}</span> • <span>📱 {user.phone}</span>
              </div>
            </div>
            <div className="card-urgency-wrapper">
              <span className={`bd ${user.ready ? 'ok' : 'tj'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                {user.ready ? 'Siap Donor Hari Ini' : 'Masa Tunggu 75 Hari'}
              </span>
            </div>
          </div>

          <div className="card-specs-box" style={{ margin: '16px 0' }}>
            <div className="spec-item">
              <span className="spec-label">Terakhir Donor:</span>
              <strong className="spec-val">
                {user.last_donated ? fmtDate(user.last_donated) : 'Belum pernah dicatat'}
              </strong>
            </div>
            <div className="spec-item">
              <span className="spec-label">Status Kelayakan:</span>
              <strong className="spec-val">
                {user.ready ? 'Boleh Donor Sekarang' : `Bisa donor lagi ${fmtDate(user.eligible_date)} (${user.days_until_eligible} hari lagi)`}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="go2"
              style={{ minHeight: 40, padding: '0 18px', fontSize: 13 }}
              onClick={handleRecordDonated}
            >
              🩸 Catat Donor Hari Ini
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        <h2 className="sec">Perbarui Informasi Akun</h2>
        <form className="fm" style={{ maxWidth: '100%' }} onSubmit={handleUpdate}>
          <label>
            Nama Lengkap
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </label>

          <div className="two">
            <label>
              Alamat Email (Akun)
              <input value={user.email} disabled style={{ opacity: 0.7 }} />
            </label>
            <label>
              Golongan Darah
              <input value={fg(user.blood_type)} disabled style={{ opacity: 0.7 }} />
            </label>
          </div>

          <div className="two">
            <label>
              Kota Domisili
              <select value={editCity} onChange={(e) => setEditCity(e.target.value)}>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Tanggal Terakhir Donor Darah
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={editLastDonated}
                onChange={(e) => setEditLastDonated(e.target.value)}
              />
            </label>
          </div>

          <button className="sbtn" disabled={busy} style={{ width: 'fit-content' }}>
            {busy ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>

        <ConfirmModal
          isOpen={showConfirm}
          title="Konfirmasi Pencatatan Donor"
          message="Catat bahwa Anda telah mendonorkan darah hari ini? Jeda donor 75 hari berikutnya akan dihitung mulai hari ini."
          confirmText="Ya, Catat Donor"
          onConfirm={executeRecordDonated}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </main>
  );
}
