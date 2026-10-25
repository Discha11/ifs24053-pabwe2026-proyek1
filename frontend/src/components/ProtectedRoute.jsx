import PropTypes from 'prop-types';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Route guard component untuk melindungi rute yang memerlukan autentikasi dan otorisasi role spesifik.
 * @param {{ children: React.ReactNode, requiredRole?: string }} props
 */
export default function ProtectedRoute({ children, requiredRole }) {
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

  // Pemeriksaan role-based authorization jika route membutuhkan role tertentu
  if (requiredRole === 'admin') {
    const isAdmin =
      user.role === 'admin' ||
      user.is_admin === true ||
      (typeof user.email === 'string' && user.email.toLowerCase().includes('admin'));

    if (!isAdmin) {
      return (
        <main id="main-content" role="main" className="wrap pg min-h-60">
          <h1 className="ph">403 – Akses Terbatas</h1>
          <div className="msg err mb-20" role="alert">
            Halaman ini khusus diperuntukkan bagi Administrator sistem. Akun Anda ({user.email}) saat ini terdaftar sebagai Pengguna / Pendonor.
          </div>
          <p className="sub mb-20">
            Jika Anda adalah staf administrator PMI atau rumah sakit, silakan hubungi pengelola sistem untuk penyesuaian hak akses.
          </p>
          <div className="flex-row">
            <Link to="/" className="btn">
              Kembali ke Beranda
            </Link>
            <Link to="/profil" className="sbtn">
              Lihat Profil Saya
            </Link>
          </div>
        </main>
      );
    }
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

