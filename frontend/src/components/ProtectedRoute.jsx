import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Route guard component untuk melindungi rute yang memerlukan autentikasi.
 * Mengalihkan pengunjung yang belum login ke halaman /masuk dengan membawa state rute asal.
 * @param {{ children: any }} props
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main id="main-content" role="main" className="wrap pg min-h-60">
        <h1 className="ph">Memeriksa Autentikasi...</h1>
        <p className="nx">Mohon tunggu sebentar...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/masuk" state={{ from: location }} replace />;
  }

  return children;
}
