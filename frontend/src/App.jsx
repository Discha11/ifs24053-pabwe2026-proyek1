import React, { Component, Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { api } from './api.js';
import { AuthProvider } from './context/AuthContext.jsx';
import Nav from './components/Nav.jsx';
import Home from './pages/Home.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <main id="main-content" role="main" className="wrap pg">
          <h1 className="ph">SADA – Sahabat Aksi Donor Anda</h1>
          <p className="sub">Silakan muat ulang halaman untuk melanjutkan.</p>
        </main>
      );
    }
    return this.props.children;
  }
}

import ProtectedRoute from './components/ProtectedRoute.jsx';

// Lazy load routes to eliminate unused JavaScript from the entry chunk
const Cari = lazy(() => import('./pages/Cari.jsx'));
const Permintaan = lazy(() => import('./pages/Permintaan.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Buat = lazy(() => import('./pages/Buat.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
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
      <ErrorBoundary>
        <Nav urgent={urgent} />
        <Suspense
          fallback={
            <main id="main-content" role="main" className="wrap pg" style={{ minHeight: '60vh' }}>
              <h1 className="ph">Memuat...</h1>
              <p className="nx">Menyiapkan halaman...</p>
            </main>
          }
        >
          <Routes>
            {/* Halaman Publik (Statis - Instan) */}
            <Route path="/" element={<Home />} />
            <Route path="/cari" element={<Cari />} />
            <Route path="/permintaan" element={<Permintaan />} />
            <Route path="/buat" element={<Buat />} />
            <Route path="/daftar" element={<Register />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/masuk" element={<Login />} />
            <Route path="/auth/login" element={<Login />} />

            {/* Halaman Terproteksi dengan Route Guard Eksplisit */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/setting"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pengaturan"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/riwayat"
              element={
                <ProtectedRoute>
                  <Riwayat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <Riwayat />
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={
                <main id="main-content" role="main" className="wrap pg">
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
      </ErrorBoundary>
    </AuthProvider>
  );
}
