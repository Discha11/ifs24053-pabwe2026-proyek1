/**
 * Layanan manajemen token autentikasi berbasis IN-MEMORY murni dan HTTPONLY COOKIE.
 *
 * ARSITEKTUR KEAMANAN TINGKAT TINGGI (OWASP RECOMMENDED):
 * 1. Menghilangkan seluruh penyimpanan token di Web Storage (localStorage/sessionStorage/document.cookie)
 *    yang dapat dibaca oleh script pihak ketiga atau serangan XSS (Cross-Site Scripting).
 * 2. Mengutamakan otorisasi berbasis backend via HttpOnly Cookie yang dikirimkan secara otomatis
 *    oleh peramban dengan opsi `credentials: 'include'`.
 * 3. Token Bearer transien selama sesi aktif hanya disimpan di memori variabel privat JavaScript (In-Memory).
 *    Ketika tab atau browser ditutup/di-refresh, otentikasi kembali diverifikasi secara aman ke endpoint
 *    backend `/api/auth/me` melalui HttpOnly cookie.
 */

let inMemoryToken = null;

/**
 * Memeriksa apakah token JWT sudah kedaluwarsa berdasarkan klaim `exp`.
 * @param {string} token
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && typeof payload.exp === 'number') {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      return payload.exp < nowInSeconds;
    }
    return false;
  } catch (_err) {
    return false;
  }
}

export const tokenStorage = {
  /**
   * Mengambil token autentikasi aktif dari memori privat.
   * Tidak mengakses storage peramban yang rentan XSS.
   * @returns {string}
   */
  get() {
    if (inMemoryToken && !isTokenExpired(inMemoryToken)) {
      return inMemoryToken;
    }
    inMemoryToken = null;
    return '';
  },

  /**
   * Menyimpan token secara eksklusif di memori runtime JavaScript.
   * @param {string|null} token
   */
  set(token) {
    if (!token || typeof token !== 'string') {
      inMemoryToken = null;
      return;
    }

    const sanitized = token.trim();
    if (isTokenExpired(sanitized)) {
      inMemoryToken = null;
      return;
    }

    inMemoryToken = sanitized;

    // Bersihkan seluruh legacy storage jika sebelumnya pernah tersimpan
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sada_token');
        localStorage.removeItem('sada_auth_token');
        sessionStorage.removeItem('sada_session_token');
        sessionStorage.removeItem('sada_user_session');
      }
    } catch (_err) {
      // Abaikan jika sandbox storage dibatasi
    }
  },

  /**
   * Menghapus seluruh sesi token in-memory dan membersihkan storage peninggalan saat logout.
   */
  clear() {
    inMemoryToken = null;
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sada_token');
        localStorage.removeItem('sada_auth_token');
        sessionStorage.removeItem('sada_session_token');
        sessionStorage.removeItem('sada_user_session');
        // Bersihkan cookie peninggalan
        document.cookie = 'sada_auth_token=; Max-Age=-99999999; path=/; SameSite=Strict';
      }
    } catch (_err) {
      // Abaikan
    }
  },

  /**
   * Memeriksa status ketersediaan token aktif di memori.
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(tokenStorage.get());
  },
};

export const getToken = () => tokenStorage.get();
export const setToken = (t) => tokenStorage.set(t);
export const clearToken = () => tokenStorage.clear();
