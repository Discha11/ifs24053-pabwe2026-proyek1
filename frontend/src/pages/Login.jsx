import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setBusy(true);
    try {
      await login(email, password);
      navigate('/profil');
    } catch (err) {
      setErrors(err.details?.length ? err.details : [err.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" role="main">
      <div className="wrap pg" style={{ maxWidth: '32rem' }}>
        <h1 className="ph">Masuk Akun</h1>
        <p className="sub">Masuk untuk melihat kartu pendonor digital dan mengelola status donor Anda.</p>

        <form className="fm" style={{ maxWidth: '100%' }} onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <ul className="errs" role="alert">
              {errors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          )}

          <label htmlFor="username">
            Alamat Email / Username
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />
          </label>

          <label htmlFor="password">
            Kata Sandi
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
            />
          </label>

          <button id="btn-submit" className="go2" disabled={busy} type="submit">
            {busy ? 'Memeriksa...' : 'Masuk Sekarang'}
          </button>

          <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 14, color: 'var(--muted)' }}>
            Belum punya akun? <Link to="/daftar" style={{ fontWeight: 700, color: 'var(--red)' }}>Daftar Pendonor Baru</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
