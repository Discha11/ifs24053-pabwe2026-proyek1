import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken } from '../api.js';

const AuthContext = createContext(null);
const USER_SESSION_KEY = 'sada_user_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(USER_SESSION_KEY) || localStorage.getItem('sada_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_err) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      sessionStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem('sada_user');
      return;
    }
    setLoading(true);
    try {
      const data = await api.me();
      if (data?.user) {
        setUser(data.user);
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(data.user));
        localStorage.removeItem('sada_user'); // Bersihkan storage permanen
      } else {
        setUser(null);
        sessionStorage.removeItem(USER_SESSION_KEY);
        localStorage.removeItem('sada_user');
      }
    } catch (_err) {
      setUser(null);
      sessionStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem('sada_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (getToken()) {
      refreshUser();
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (!res?.token || !res?.user) {
        throw new Error('Gagal masuk: kredensial tidak valid');
      }
      setToken(res.token);
      setUser(res.user);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(res.user));
      localStorage.removeItem('sada_user');
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.register(formData);
      if (!res?.token || !res?.user) {
        throw new Error('Pendaftaran gagal: respon server tidak valid');
      }
      setToken(res.token);
      setUser(res.user);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(res.user));
      localStorage.removeItem('sada_user');
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    sessionStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem('sada_user');
  };

  const updateProfile = async (formData) => {
    const res = await api.updateProfile(formData);
    const updated = res?.user || { ...user, ...formData };
    setUser(updated);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
    localStorage.removeItem('sada_user');
    return updated;
  };

  const recordDonated = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = { ...user, last_donated: today, ready: false };
    setUser(updated);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
    localStorage.removeItem('sada_user');
    try {
      await api.recordUserDonated();
    } catch (_err) {
      // Server-side recorded if online
    }
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        recordDonated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
