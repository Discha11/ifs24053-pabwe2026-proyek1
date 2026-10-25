import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Route guard component untuk melindungi rute yang memerlukan autentikasi dan otorisasi role spesifik berbasis backend.
 * @param {{ children: React.ReactNode, requiredRole?: string }} props
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, verifyAdminRole } = useAuth();
  const location = useLocation();
  const [adminVerified, setAdminVerified] = useState(null); // null | boolean
  const [verifyingServerRole, setVerifyingServerRole] = useState(false);

  useEffect(() => {
    let active = true;
    if (user && requiredRole === 'admin') {
      setVerifyingServerRole(true);
      verifyAdminRole().then((isAuthorized) => {
        if (active) {
          setAdminVerified(isAuthorized);
          setVerifyingServerRole(false);
        }
      });
    } else {
      setAdminVerified(true);
    }
    return () => {
      active = false;
    };
  }, [user, requiredRole, verifyAdminRole]);

  if (loading || verifyingServerRole) {
    return (
      <main id="main-content" role="main" className="wrap pg min-h-60">
        <h1 className="ph">Memverifikasi Otorisasi Server...</h1>
        <p className="nx">Memeriksa hak akses dan kredensial akun ke server...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/masuk" state={{ from: location }} replace />;
  }

  // Pemeriksaan role-based authorization berbasis verifikasi server backend
  if (requiredRole === 'admin' && adminVerified === false) {
    return (
      <main id="main-content" role="main" className="wrap pg min-h-60">
        <h1 className="ph">403 – Akses Terbatas</h1>
        <div className="msg err mb-20" role="alert">
          Halaman ini khusus diperuntukkan bagi Administrator sistem yang terverifikasi server. Akun Anda ({user.email}) tidak memiliki hak akses administrator.
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

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

