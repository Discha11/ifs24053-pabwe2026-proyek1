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

  function validate() {
    const errs = [];
    if (!email.trim()) {
      errs.push('Alamat email atau username wajib diisi.');
    }
    if (!password) {
      errs.push('Kata sandi wajib diisi.');
    } else if (password.length < 6) {
      errs.push('Kata sandi minimal 6 karakter.');
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const valErrs = validate();
    if (valErrs.length > 0) {
      setErrors(valErrs);
      return;
    }

    setErrors([]);
    setBusy(true);
    try {
      await login(email.trim(), password);
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
              placeholder="Masukkan kata sandi akun"
              required
            />
          </label>

          <button className="go2" disabled={busy}>
            {busy ? 'Memeriksa Kredensial...' : 'Masuk Sekarang'}
          </button>

          <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 14, color: 'var(--muted)' }}>
            Belum punya akun? <Link to="/daftar" style={{ fontWeight: 700, color: 'var(--red)' }}>Daftar Jadi Pendonor</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
