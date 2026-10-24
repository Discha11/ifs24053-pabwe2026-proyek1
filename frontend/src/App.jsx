import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { api } from './api.js';
import { AuthProvider } from './context/AuthContext.jsx';
import Nav from './components/Nav.jsx';
import Home from './pages/Home.jsx';
import Cari from './pages/Cari.jsx';
import Permintaan from './pages/Permintaan.jsx';
import Buat from './pages/Buat.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  const { pathname } = useLocation();
  const [urgent, setUrgent] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); api.stats().then((s) => setUrgent(s.urgent_requests)).catch(() => {}); }, [pathname]);

  return (
    <AuthProvider>
      <Nav urgent={urgent} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cari" element={<Cari />} />
        <Route path="/permintaan" element={<Permintaan />} />
        <Route path="/buat" element={<Buat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="/daftar" element={<Register />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="*" element={<main className="wrap pg"><h1 className="ph">Halaman tidak ditemukan</h1><p className="sub">Alamat yang kamu buka tidak ada. Kembali ke beranda lewat menu di atas.</p></main>} />
      </Routes>
      <footer><div className="wrap">SADA · Sahabat Aksi Donor Anda. “Sada” berarti “satu” dalam bahasa Batak Toba.</div></footer>
    </AuthProvider>
  );
}
