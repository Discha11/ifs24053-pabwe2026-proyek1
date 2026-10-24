import { useLocation } from 'react-router-dom';
import ActiveRequests from '../components/ActiveRequests.jsx';
import { useRequests } from '../lib.js';

export default function Permintaan() {
  const { requests, error } = useRequests();
  const { state } = useLocation();
  return (
    <main>
      <div className="wrap pg" style={{ paddingBottom: 0 }}>
        {state?.created && (
          <p className="msg ok" role="status" style={{ marginBottom: 20 }}>
            Permintaan darah berhasil dibuat dan langsung terdaftar aktif.
          </p>
        )}
      </div>
      <ActiveRequests requests={requests} error={error} />
    </main>
  );
}
