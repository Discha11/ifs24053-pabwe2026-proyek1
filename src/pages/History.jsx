import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { formatBloodType, formatDate } from '../lib.js';
import { getErrorMessage } from '../utils/errors.js';

export default function History() {
  const { user, loading, recordDonated } = useAuth();
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (loading) {
    return (
      <main id="main-content" role="main">
        <div className="wrap pg">
          <h1 className="ph">Riwayat Donor Darah</h1>
          <p className="nx">Memuat riwayat donor...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main id="main-content" role="main">
        <div className="wrap pg">
          <h1 className="ph">Riwayat Donor Darah</h1>
          <p className="sub">Silakan masuk ke akun Anda untuk melihat riwayat dan pencatatan donor darah.</p>
          <div className="mt-24">
            <Link to="/masuk" className="b1">Masuk Sekarang</Link>
          </div>
        </div>
      </main>
    );
  }

  const handleRecord = () => {
    setShowConfirm(true);
  };

  const executeRecord = async () => {
    setShowConfirm(false);
    setMsg('');
    setErr('');
    try {
      await recordDonated();
      setMsg('Donor hari ini berhasil dicatat!');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <main id="main-content" role="main">
      <div className="wrap pg box-w-42">
        <h1 className="ph">Riwayat Donor Darah</h1>
        <p className="sub">Catatan dan rekam jejak aksi donor darah Anda untuk menyelamatkan sesama di kawasan Danau Toba.</p>

        {msg && <p className="msg ok" role="status">{msg}</p>}
        {err && <p className="msg err" role="alert">{err}</p>}

        <div className="stats dstats mt-20 mb-20">
          <div>
            <b>{formatBloodType(user.blood_type)}</b>
            <span>Golongan Darah</span>
          </div>
          <div>
            <b>{user.ready ? 'Siap' : 'Menunggu'}</b>
            <span>Status Kelayakan</span>
          </div>
          <div>
            <b>{user.last_donated ? formatDate(user.last_donated) : '-'}</b>
            <span>Donor Terakhir</span>
          </div>
        </div>

        <div className="mb-24">
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
                <tr key={`history-${user.last_donated}`}>
                  <td>1</td>
                  <td>{formatDate(user.last_donated)}</td>
                  <td>{formatBloodType(user.blood_type)}</td>
                  <td>
                    <span className={`bd ${user.ready ? 'ok' : 'tj'}`}>
                      {user.ready ? 'Masa tunggu selesai' : `Siap ${formatDate(user.eligible_date)}`}
                    </span>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="4" className="empty-table-note">
                    Belum ada riwayat donor darah yang dicatat. Klik tombol di atas jika Anda telah mendonor hari ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ConfirmModal
          isOpen={showConfirm}
          title="Konfirmasi Pencatatan Donor"
          message="Catat bahwa Anda telah mendonorkan darah hari ini? Jeda donor 75 hari berikutnya akan dihitung mulai hari ini."
          confirmText="Ya, Catat Donor"
          onConfirm={executeRecord}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </main>
  );
}
