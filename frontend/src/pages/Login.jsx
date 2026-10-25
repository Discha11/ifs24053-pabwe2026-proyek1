import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { validationSchemas } from '../utils/validation.js';
import { getErrorMessage } from '../utils/errors.js';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const valErrs = validationSchemas.login({ email, password });
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
      setErrors(err.details?.length ? err.details : [getErrorMessage(err)]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" role="main">
      <div className="wrap pg box-w-32">
        <h1 className="ph">Masuk Akun</h1>
        <p className="sub">Masuk untuk melihat kartu pendonor digital dan mengelola status donor Anda.</p>

        <form className="fm w-full" onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <ul className="errs" role="alert">
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
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

          <button id="btn-submit" className="go2" disabled={busy}>
            {busy ? 'Memeriksa Kredensial...' : 'Masuk Sekarang'}
          </button>

          <p className="auth-sub-link">
            Belum punya akun? <Link to="/daftar">Daftar Jadi Pendonor</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
