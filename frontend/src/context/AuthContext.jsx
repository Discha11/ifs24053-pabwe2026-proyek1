import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api.js';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: 'Discha Hutasoit',
  email: 'discha@gmail.com',
  blood_type: 'O+',
  city: 'Balige',
  phone: '081234567890',
  ready: true,
  last_donated: '2026-07-01',
  eligible_date: '2026-09-14',
  days_until_eligible: 0,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sada_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const [loading, setLoading] = useState(false);

  const refreshUser = async () => {
    try {
      const data = await api.me();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('sada_user', JSON.stringify(data.user));
      }
    } catch (_err) {
      // Keep existing user if API fails
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('sada_user', JSON.stringify(res.user));
      return res.user;
    } catch (_err) {
      const fallbackUser = {
        ...DEFAULT_USER,
        name: email.split('@')[0] || DEFAULT_USER.name,
        email: email,
      };
      setToken('sada_mock_token');
      setUser(fallbackUser);
      localStorage.setItem('sada_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.register(formData);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('sada_user', JSON.stringify(res.user));
      return res.user;
    } catch (_err) {
      const fallbackUser = {
        ...DEFAULT_USER,
        name: formData.name || DEFAULT_USER.name,
        email: formData.email || DEFAULT_USER.email,
        blood_type: formData.blood_type || DEFAULT_USER.blood_type,
        city: formData.city || DEFAULT_USER.city,
      };
      setToken('sada_mock_token');
      setUser(fallbackUser);
      localStorage.setItem('sada_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(DEFAULT_USER);
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.updateProfile(formData);
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem('sada_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch (_err) {
      // Fallback update locally
    }
    const updated = { ...user, ...formData };
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
      // Handled
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
