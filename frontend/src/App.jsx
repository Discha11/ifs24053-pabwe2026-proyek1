import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { api } from './api.js';
import { AuthProvider } from './context/AuthContext.jsx';
import Nav from './components/Nav.jsx';
import Home from './pages/Home.jsx';

// Lazy load non-critical page routes to reduce initial bundle size and unused JavaScript
const Cari = lazy(() => import('./pages/Cari.jsx'));
const Permintaan = lazy(() => import('./pages/Permintaan.jsx'));
const Buat = lazy(() => import('./pages/Buat.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Riwayat = lazy(() => import('./pages/Riwayat.jsx'));

export default function App() {
  const { pathname } = useLocation();
  const [urgent, setUrgent] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.stats().then((s) => setUrgent(s?.urgent_requests || 0)).catch(() => {});
  }, [pathname]);

  return (
    <AuthProvider>
      <Nav urgent={urgent} />
      <Suspense fallback={<main className="wrap pg" style={{ minHeight: '60vh' }}><h1 className="sr">Memuat Halaman</h1><p className="nx">Memuat halaman...</p></main>}>
        <Routes>
          {/* Halaman Publik */}
          <Route path="/" element={<Home />} />
          <Route path="/cari" element={<Cari />} />
          <Route path="/permintaan" element={<Permintaan />} />
          <Route path="/buat" element={<Buat />} />

          {/* Halaman Auth */}
          <Route path="/masuk" element={<Login />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/daftar" element={<Register />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Halaman Terproteksi (Minimal 4 path) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/riwayat" element={<Riwayat />} />

          <Route
            path="*"
            element={
              <main className="wrap pg">
                <h1 className="ph">Halaman tidak ditemukan</h1>
                <p className="sub">Alamat yang kamu buka tidak ada. Kembali ke beranda lewat menu di atas.</p>
              </main>
            }
          />
        </Routes>
      </Suspense>
      <footer>
        <div className="wrap">SADA · Sahabat Aksi Donor Anda. “Sada” berarti “satu” dalam bahasa Batak Toba.</div>
      </footer>
    </AuthProvider>
  );
}
