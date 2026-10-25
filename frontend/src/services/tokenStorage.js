/**
 * Layanan manajemen penyimpanan token autentikasi yang aman.
 * Menghindari penyimpanan jangka panjang di localStorage rentan XSS.
 * Menggunakan primary in-memory cache, sessionStorage (terhapus otomatis saat tab ditutup),
 * serta cookie SameSite=Strict untuk mendukung standar keamanan modern.
 */

let inMemoryToken = null;

const COOKIE_NAME = 'sada_auth_token';
const SESSION_KEY = 'sada_session_token';

/**
 * Membaca nilai cookie berdasarkan nama cookie.
 * @param {string} name
 * @returns {string}
 */
function getCookie(name) {
  if (typeof document === 'undefined') return '';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const c = cookies[i].trim();
    if (c.startsWith(`${name}=`)) {
      return decodeURIComponent(c.substring(name.length + 1));
    }
  }
  return '';
}

/**
 * Menulis cookie dengan atribut keamanan SameSite=Strict.
 * @param {string} name
 * @param {string} value
 * @param {number} days
 */
function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict${secureFlag}`;
}

/**
 * Menghapus cookie dengan memundurkan masa berlaku.
 * @param {string} name
 */
function eraseCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Strict`;
}

/**
 * Memeriksa apakah token JWT sudah kedaluwarsa berdasarkan klaim `exp`.
 * @param {string} token
 * @returns {boolean}
 */
function isTokenExpired(token) {
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
   * Mengambil token autentikasi aktif dari memory, sessionStorage, atau secure cookie.
   * @returns {string}
   */
  get() {
    if (inMemoryToken && !isTokenExpired(inMemoryToken)) {
      return inMemoryToken;
    }

    // 1. Coba baca dari sessionStorage
    try {
      const sessionToken = sessionStorage.getItem(SESSION_KEY);
      if (sessionToken && !isTokenExpired(sessionToken)) {
        inMemoryToken = sessionToken;
        return sessionToken;
      }
    } catch (_err) {
      // Abaikan jika storage diblokir
    }

    // 2. Coba baca dari secure cookie
    const cookieToken = getCookie(COOKIE_NAME);
    if (cookieToken && !isTokenExpired(cookieToken)) {
      inMemoryToken = cookieToken;
      return cookieToken;
    }

    // Bersihkan sesi jika sudah kedaluwarsa
    tokenStorage.clear();
    return '';
  },

  /**
   * Menyimpan token autentikasi ke in-memory, sessionStorage, dan secure cookie.
   * @param {string|null} token
   */
  set(token) {
    if (!token || typeof token !== 'string') {
      tokenStorage.clear();
      return;
    }

    const sanitized = token.trim();
    if (isTokenExpired(sanitized)) {
      tokenStorage.clear();
      return;
    }

    inMemoryToken = sanitized;

    try {
      sessionStorage.setItem(SESSION_KEY, sanitized);
    } catch (_err) {
      // Memory fallback jika sessionStorage diblokir
    }

    setCookie(COOKIE_NAME, sanitized, 7);

    // Bersihkan kunci dari localStorage untuk mencegah penyimpanan rentan XSS
    try {
      localStorage.removeItem('sada_token');
      localStorage.removeItem('sada_auth_token');
      localStorage.removeItem('sada_secure_session');
    } catch (_err) {
      // Abaikan
    }
  },

  /**
   * Menghapus seluruh sesi token saat logout.
   */
  clear() {
    inMemoryToken = null;
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_err) {
      // Abaikan
    }

    eraseCookie(COOKIE_NAME);

    try {
      localStorage.removeItem('sada_token');
      localStorage.removeItem('sada_auth_token');
      localStorage.removeItem('sada_secure_session');
    } catch (_err) {
      // Abaikan
    }
  },

  /**
   * Memeriksa status keberadaan token yang valid saat ini.
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(tokenStorage.get());
  },
};

export const getToken = () => tokenStorage.get();
export const setToken = (t) => tokenStorage.set(t);
export const clearToken = () => tokenStorage.clear();
