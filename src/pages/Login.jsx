import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useForm } from '../hooks/index.js';
import { validationSchemas } from '../utils/validation.js';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const { values, errors, submitting, handleChange, handleSubmit } = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchemas.login,
    onSubmit: async (formValues) => {
      await login(formValues.email.trim(), formValues.password);
      navigate('/profil');
    },
  });

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
              value={values.email}
              onChange={handleChange('email')}
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
              value={values.password}
              onChange={handleChange('password')}
              placeholder="Masukkan kata sandi akun"
              required
            />
          </label>

          <button id="btn-submit" className="go2" disabled={submitting}>
            {submitting ? 'Memeriksa Kredensial...' : 'Masuk Sekarang'}
          </button>

          <p className="auth-sub-link">
            Belum punya akun? <Link to="/daftar">Daftar Jadi Pendonor</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
