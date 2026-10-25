import { Component, Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataProvider, useData } from './context/DataContext.jsx';
import Nav from './components/Nav.jsx';
import Home from './pages/Home.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Lazy load routes dengan penamaan halaman konsisten
const Search = lazy(() => import('./pages/Search.jsx'));
const Requests = lazy(() => import('./pages/Requests.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const CreateRequest = lazy(() => import('./pages/CreateRequest.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const History = lazy(() => import('./pages/History.jsx'));

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

function AppContent() {
  const { pathname } = useLocation();
  const { urgentCount } = useData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ErrorBoundary>
      <Nav urgent={urgentCount} />
      <Suspense
        fallback={
          <main id="main-content" role="main" className="wrap pg min-h-60">
            <h1 className="ph">Memuat...</h1>
            <p className="nx">Menyiapkan halaman...</p>
          </main>
        }
      >
        <Routes>
          {/* Halaman Publik Kanonikal */}
          <Route path="/" element={<Home />} />
          <Route path="/cari" element={<Search />} />
          <Route path="/permintaan" element={<Requests />} />
          <Route path="/buat" element={<CreateRequest />} />
          <Route path="/daftar" element={<Register />} />
          <Route path="/masuk" element={<Login />} />

          {/* Halaman Terproteksi dengan Route Guard & Role-based Access Control */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
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
                <History />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Not Found */}
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
