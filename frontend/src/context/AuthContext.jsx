import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sada_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      localStorage.removeItem('sada_user');
      return;
    }
    setLoading(true);
    try {
      const data = await api.me();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('sada_user', JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem('sada_user');
      }
    } catch (_err) {
      // Clear invalid session
      setUser(null);
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
      localStorage.setItem('sada_user', JSON.stringify(res.user));
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
      localStorage.setItem('sada_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sada_user');
  };

  const updateProfile = async (formData) => {
    const res = await api.updateProfile(formData);
    const updated = res?.user || { ...user, ...formData };
    setUser(updated);
    localStorage.setItem('sada_user', JSON.stringify(updated));
    return updated;
  };

  const recordDonated = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = { ...user, last_donated: today, ready: false };
    setUser(updated);
    localStorage.setItem('sada_user', JSON.stringify(updated));
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
