import RequestList from '../components/RequestList.jsx';
import DonorForm from '../components/DonorForm.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useDashboardData } from '../hooks/index.js';
import { formatBloodType, formatDate } from '../lib.js';

export default function Dashboard() {
  const {
    stats,
    donors,
    cities,
    requests,
    reqError,
    actionMsg,
    actionErr,
    modalConfig,
    closeModal,
    loadDashboardData,
    handleMarkDonated,
    handleDeleteDonor,
    handleCloseRequest,
    handleDeleteRequest,
  } = useDashboardData();

  return (
    <main id="main-content" role="main">
      <div className="wrap pg">
        <h1 className="ph">Kelola Data (Panel Admin)</h1>
        <p className="sub mb-20">
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
