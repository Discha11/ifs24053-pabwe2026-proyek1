/**
 * Layanan manajemen penyimpanan token autentikasi yang aman.
 * Menyediakan enkapsulasi penyimpanan dengan validasi token dan fallback in-memory yang aman.
 */

let inMemoryToken = null;

const STORAGE_KEY = 'sada_auth_token';

export const tokenStorage = {
  /**
   * Mengambil token autentikasi yang tersimpan.
   * @returns {string}
   */
  get() {
    if (inMemoryToken) return inMemoryToken;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('sada_token') || '';
      return typeof stored === 'string' ? stored.trim() : '';
    } catch (_err) {
      return inMemoryToken || '';
    }
  },

  /**
   * Menyimpan token autentikasi dengan validasi tipe string dan sanitasi.
   * @param {string|null} token
   */
  set(token) {
    if (!token || typeof token !== 'string') {
      tokenStorage.clear();
      return;
    }
    const sanitized = token.trim();
    inMemoryToken = sanitized;
    try {
      localStorage.setItem(STORAGE_KEY, sanitized);
      // Bersihkan kunci lama untuk konsistensi
      localStorage.removeItem('sada_token');
    } catch (_err) {
      // Menjaga fungsionalitas di lingkungan private mode / storage terbatas
    }
  },

  /**
   * Menghapus token autentikasi saat logout atau sesi kedaluwarsa.
   */
  clear() {
    inMemoryToken = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('sada_token');
    } catch (_err) {
      // Ignore storage errors on cleanup
    }
  },
};

export const getToken = () => tokenStorage.get();
export const setToken = (t) => tokenStorage.set(t);
export const clearToken = () => tokenStorage.clear();
