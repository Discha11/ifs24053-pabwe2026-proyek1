import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, clearToken } from '../api.js';

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      // Memvalidasi sesi pengguna secara autoritatif langsung ke back-end melalui HttpOnly cookie / In-Memory token
      const data = await api.me();
      if (data?.user) {
        setUser(data.user);
        return data.user;
      }
      setUser(null);
      return null;
    } catch (_err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
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
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const res = await api.updateProfile(formData);
    const updated = res?.user || { ...user, ...formData };
    setUser(updated);
    return updated;
  };

  const recordDonated = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = { ...user, last_donated: today, ready: false };
    setUser(updated);
    try {
      await api.recordUserDonated();
    } catch (_err) {
      // Server-side recorded if online
    }
    return updated;
  };

  /**
   * Verifikasi hak akses role admin secara autoritatif ke back-end.
   * Mencegah bypass inspeksi role di sisi klien browser semata.
   * @returns {Promise<boolean>}
   */
  const verifyAdminRole = async () => {
    try {
      const data = await api.me();
      const currentUser = data?.user;
      if (!currentUser) return false;
      const isAdmin = currentUser.role === 'admin' || currentUser.is_admin === true;
      if (isAdmin) {
        setUser(currentUser);
        return true;
      }
      return false;
    } catch (_err) {
      return false;
    }
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
        verifyAdminRole,
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

