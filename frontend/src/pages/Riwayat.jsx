import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fg, fmtDate } from '../lib.js';

export default function Riwayat() {
  const navigate = useNavigate();
  const { user, loading, recordDonated } = useAuth();
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');


  if (loading || !user) {
    return (
      <main id="main-content" role="main">
        <div className="wrap pg">
          <h1 className="ph">Riwayat Donor Darah</h1>
          <p className="nx">Memuat riwayat donor...</p>
        </div>
      </main>
    );
  }

  async function handleRecord() {
    if (!window.confirm('Catat bahwa Anda telah mendonorkan darah hari ini? Jeda donor 75 hari akan dihitung mulai hari ini.')) {
      return;
    }
    setMsg('');
    setErr('');
    try {
      await recordDonated();
      setMsg('Donor hari ini berhasil dicatat!');
    } catch (e) {
      setErr(e.message || 'Gagal mencatat donor');
    }
  }

  return (
    <main id="main-content" role="main">
      <div className="wrap pg" style={{ maxWidth: '42rem' }}>
        <h1 className="ph">Riwayat Donor Darah</h1>
        <p className="sub">Catatan dan rekam jejak aksi donor darah Anda untuk menyelamatkan sesama di kawasan Danau Toba.</p>

        {msg && <p className="msg ok" role="status">{msg}</p>}
        {err && <p className="msg err" role="alert">{err}</p>}

        <div className="stats dstats" style={{ margin: '20px 0' }}>
          <div>
            <b>{fg(user.blood_type)}</b>
            <span>Golongan Darah</span>
          </div>
          <div>
            <b>{user.ready ? 'Siap' : 'Menunggu'}</b>
            <span>Status Kelayakan</span>
          </div>
          <div>
            <b>{user.last_donated ? fmtDate(user.last_donated) : '-'}</b>
            <span>Donor Terakhir</span>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <button type="button" className="go2" onClick={handleRecord}>
            🩸 Catat Aksi Donor Baru Hari Ini
          </button>
        </div>

        <h2 className="sec">Daftar Rekam Jejak Donor</h2>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal Donor</th>
                <th>Golongan</th>
                <th>Status Pemulihan</th>
              </tr>
            </thead>
            <tbody>
              {user.last_donated ? (
                <tr>
                  <td>1</td>
                  <td>{fmtDate(user.last_donated)}</td>
                  <td>{fg(user.blood_type)}</td>
                  <td>
                    <span className={`bd ${user.ready ? 'ok' : 'tj'}`}>
                      {user.ready ? 'Masa tunggu selesai' : `Siap ${fmtDate(user.eligible_date)}`}
                    </span>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>
                    Belum ada riwayat donor darah yang dicatat. Klik tombol di atas jika Anda telah mendonor hari ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
