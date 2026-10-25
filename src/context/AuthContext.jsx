import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { api, setToken, clearToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
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
  }, []);

  const register = useCallback(async (formData) => {
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
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (formData) => {
    const res = await api.updateProfile(formData);
    const updated = res?.user || formData;
    setUser((prev) => ({ ...(prev || {}), ...updated }));
    return updated;
  }, []);

  const recordDonated = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    setUser((prev) => (prev ? { ...prev, last_donated: today, ready: false } : null));
    try {
      await api.recordUserDonated();
    } catch (_err) {
      // Server-side recorded if online
    }
  }, []);

  /**
   * Verifikasi hak akses role admin secara autoritatif ke back-end.
   * Dimemoized dengan useCallback untuk mencegah infinite effect loop pada ProtectedRoute.
   * @returns {Promise<boolean>}
   */
  const verifyAdminRole = useCallback(async () => {
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
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      recordDonated,
      verifyAdminRole,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      recordDonated,
      verifyAdminRole,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}


