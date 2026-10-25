import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import RequestList from '../components/RequestList.jsx';
import DonorForm from '../components/DonorForm.jsx';
import { fg, fmtDate, useRequests } from '../lib.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState(null);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(false);
  const { requests, error: reqError, reload: reloadRequests } = useRequests();

  const loadDashboardData = useCallback(() => {
    Promise.all([api.stats(), api.donors()])
      .then(([statsData, donorsData]) => {
        setStats(statsData);
        setDonors(donorsData);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    loadDashboardData();
    api.cities().then(setCities).catch(() => {});
  }, [loadDashboardData]);

  const refreshAll = () => {
    loadDashboardData();
    reloadRequests();
  };

  const handleMarkDonated = async (donor) => {
    try {
      await api.markDonated(donor.id);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Gagal memperbarui status donor');
    }
  };

  const handleDeleteDonor = async (donor) => {
    if (window.confirm(`Hapus pendonor ${donor.name}?`)) {
      try {
        await api.deleteDonor(donor.id);
        loadDashboardData();
      } catch (err) {
        alert(err.message || 'Gagal menghapus data pendonor');
      }
    }
  };

  const handleCloseRequest = async (request) => {
    try {
      await api.closeRequest(request.id);
      refreshAll();
    } catch (err) {
      alert(err.message || 'Gagal menutup permintaan');
    }
  };

  const handleDeleteRequest = async (request) => {
    if (window.confirm('Hapus permintaan ini?')) {
      try {
        await api.deleteRequest(request.id);
        refreshAll();
      } catch (err) {
        alert(err.message || 'Gagal menghapus permintaan');
      }
    }
  };

  return (
    <main id="main-content" role="main">
      <div className="wrap pg">
        <h1 className="ph">Kelola Data (Panel Admin)</h1>
        <p className="sub" style={{ marginBottom: 20 }}>
          Panel administrasi untuk menutup permintaan selesai, menghapus data, dan mencatat riwayat donor warga.
        </p>

        {error && (
          <p className="msg err" role="alert">
            Tidak bisa terhubung ke server. Pastikan back-end berjalan, lalu muat ulang halaman.
          </p>
        )}

        {stats && (
          <div className="stats dstats">
            <div>
              <b>{stats.donors}</b>
              <span>Pendonor terdaftar</span>
            </div>
            <div>
              <b>{stats.ready_today}</b>
              <span>Siap donor hari ini</span>
            </div>
            <div>
              <b>{stats.open_requests}</b>
              <span>Permintaan terbuka</span>
            </div>
            <div>
              <b>{stats.urgent_requests}</b>
              <span>Darurat</span>
            </div>
          </div>
        )}

        <h2 className="sec">Permintaan terbuka</h2>
        <RequestList
          requests={requests}
          error={reqError}
          onClose={handleCloseRequest}
          onDelete={handleDeleteRequest}
        />

        <h2 className="sec">Daftar Pendonor</h2>
        {donors && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Gol.</th>
                  <th>Kota</th>
                  <th>Kontak</th>
                  <th>Status</th>
                  <th>
                    <span className="sr">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => (
                  <tr key={donor.id}>
                    <td>{donor.name}</td>
                    <td>{fg(donor.blood_type)}</td>
                    <td>{donor.city}</td>
                    <td>{donor.phone_masked}</td>
                    <td>
                      <span className={`bd ${donor.ready ? 'ok' : 'tj'}`}>
                        {donor.ready ? 'Siap donor' : `Boleh ${fmtDate(donor.eligible_date)}`}
                      </span>
                    </td>
                    <td className="acts">
                      <button
                        className="sbtn"
                        onClick={() => handleMarkDonated(donor)}
                      >
                        Catat donor hari ini
                      </button>
                      <button
                        className="sbtn danger"
                        onClick={() => handleDeleteDonor(donor)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DonorForm cities={cities} onSaved={loadDashboardData} />
      </div>
    </main>
  );
}
