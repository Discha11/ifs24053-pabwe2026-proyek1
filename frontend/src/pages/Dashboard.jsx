import { useCallback, useState } from 'react';
import RequestList from '../components/RequestList.jsx';
import DonorForm from '../components/DonorForm.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useStats, useDonors, useCities, useRequests } from '../hooks/index.js';
import { formatBloodType, formatDate } from '../lib.js';

export default function Dashboard() {
  const { stats, reload: reloadStats } = useStats();
  const { donors, reload: reloadDonors, markDonated, deleteDonor } = useDonors();
  const { cities } = useCities();
  const { requests, error: reqError, reload: reloadRequests, closeRequest, deleteRequest } = useRequests();

  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Lanjutkan',
    isDanger: false,
    onConfirm: () => {},
  });

  const loadDashboardData = useCallback(() => {
    reloadStats();
    reloadDonors();
  }, [reloadStats, reloadDonors]);

  const refreshAll = () => {
    loadDashboardData();
    reloadRequests();
  };

  const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));

  const handleMarkDonated = async (donor) => {
    setActionMsg('');
    setActionErr('');
    try {
      await markDonated(donor.id);
      setActionMsg(`Aksi donor hari ini untuk ${donor.name} berhasil dicatat.`);
      loadDashboardData();
    } catch (err) {
      setActionErr(err.message || 'Gagal memperbarui status donor');
    }
  };

  const handleDeleteDonor = (donor) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Pendonor',
      message: `Apakah Anda yakin ingin menghapus data pendonor ${donor.name}? Data yang dihapus tidak dapat dipulihkan.`,
      confirmText: 'Ya, Hapus Data',
      isDanger: true,
      onConfirm: async () => {
        closeModal();
        setActionMsg('');
        setActionErr('');
        try {
          await deleteDonor(donor.id);
          setActionMsg(`Pendonor ${donor.name} berhasil dihapus.`);
          loadDashboardData();
        } catch (err) {
          setActionErr(err.message || 'Gagal menghapus data pendonor');
        }
      },
    });
  };

  const handleCloseRequest = async (request) => {
    setActionMsg('');
    setActionErr('');
    try {
      await closeRequest(request.id);
      setActionMsg(`Permintaan darah untuk ${request.hospital} berhasil ditutup.`);
      refreshAll();
    } catch (err) {
      setActionErr(err.message || 'Gagal menutup permintaan');
    }
  };

  const handleDeleteRequest = (request) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Permintaan Darah',
      message: `Apakah Anda yakin ingin menghapus permintaan darah dari ${request.hospital}?`,
      confirmText: 'Ya, Hapus Permintaan',
      isDanger: true,
      onConfirm: async () => {
        closeModal();
        setActionMsg('');
        setActionErr('');
        try {
          await deleteRequest(request.id);
          setActionMsg('Permintaan darah berhasil dihapus.');
          refreshAll();
        } catch (err) {
          setActionErr(err.message || 'Gagal menghapus permintaan');
        }
      },
    });
  };

  return (
    <main id="main-content" role="main">
      <div className="wrap pg">
        <h1 className="ph">Kelola Data (Panel Admin)</h1>
        <p className="sub" style={{ marginBottom: 20 }}>
          Panel administrasi untuk menutup permintaan selesai, menghapus data, dan mencatat riwayat donor warga.
        </p>

        {actionMsg && <p className="msg ok" role="status">{actionMsg}</p>}
        {actionErr && <p className="msg err" role="alert">{actionErr}</p>}

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
                    <td>{formatBloodType(donor.blood_type)}</td>
                    <td>{donor.city}</td>
                    <td>{donor.phone_masked}</td>
                    <td>
                      <span className={`bd ${donor.ready ? 'ok' : 'tj'}`}>
                        {donor.ready ? 'Siap donor' : `Boleh ${formatDate(donor.eligible_date)}`}
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
        <ConfirmModal {...modalConfig} onCancel={closeModal} />
      </div>
    </main>
  );
}
