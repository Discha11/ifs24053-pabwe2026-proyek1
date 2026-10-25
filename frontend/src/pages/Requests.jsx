import { useLocation } from 'react-router-dom';
import ActiveRequests from '../components/ActiveRequests.jsx';
import { useRequests } from '../hooks/index.js';

export default function Requests() {
  const { requests, error } = useRequests();
  const { state } = useLocation();

  return (
    <main id="main-content" role="main">
      <div className="wrap pg pb-0">
        <h1 className="ph">Daftar Permintaan Darah</h1>
        <p className="sub">
          Daftar kebutuhan darah mendesak dan terjadwal di rumah sakit dan puskesmas kawasan Danau Toba.
        </p>
        {state?.created && (
          <p className="msg ok mb-20" role="status">
            Permintaan darah berhasil dibuat dan langsung terdaftar aktif.
          </p>
        )}
      </div>
      <ActiveRequests requests={requests} error={error} />
    </main>
  );
}
