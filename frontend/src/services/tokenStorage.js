/**
 * Layanan manajemen penyimpanan token autentikasi yang aman.
 * Melindungi token di localStorage dengan enkapsulasi envelope, encoding aman,
 * pemeriksaan kedaluwarsa JWT otomatis, dan fallback in-memory untuk mode privat.
 */

let inMemoryToken = null;

const STORAGE_KEY = 'sada_secure_session';
const LEGACY_STORAGE_KEY = 'sada_token';

/**
 * Memeriksa apakah token JWT sudah kedaluwarsa berdasarkan klaim `exp`.
 * @param {string} token
 * @returns {boolean}
 */
function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false; // Bukan JWT standar (mis. demo token)
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

/**
 * Melakukan encoding aman untuk menyimpan token tanpa teks mentah langsung.
 * @param {string} rawToken
 * @returns {string}
 */
function encodeToken(rawToken) {
  try {
    return btoa(encodeURIComponent(rawToken));
  } catch (_err) {
    return rawToken;
  }
}

/**
 * Melakukan decoding token dari format penyimpanan aman.
 * @param {string} encodedToken
 * @returns {string}
 */
function decodeToken(encodedToken) {
  try {
    return decodeURIComponent(atob(encodedToken));
  } catch (_err) {
    return encodedToken;
  }
}

export const tokenStorage = {
  /**
   * Mengambil token autentikasi yang valid dari memori atau localStorage.
   * Membersihkan token secara otomatis jika sudah kedaluwarsa.
   * @returns {string}
   */
  get() {
    if (inMemoryToken && !isTokenExpired(inMemoryToken)) {
      return inMemoryToken;
    }

    try {
      // Periksa envelope baru yang aman
      const storedEnvelope = localStorage.getItem(STORAGE_KEY);
      if (storedEnvelope) {
        const parsed = JSON.parse(storedEnvelope);
        if (parsed?.payload) {
          const rawToken = decodeToken(parsed.payload);
          if (rawToken && !isTokenExpired(rawToken)) {
            inMemoryToken = rawToken;
            return rawToken;
          }
        }
        // Token tidak valid atau kedaluwarsa
        tokenStorage.clear();
        return '';
      }

      // Migrasi aman dari kunci legacy jika ada
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem('sada_auth_token');
      if (legacy && typeof legacy === 'string' && !isTokenExpired(legacy)) {
        tokenStorage.set(legacy.trim());
        return legacy.trim();
      }
    } catch (_err) {
      return inMemoryToken || '';
    }

    return '';
  },

  /**
   * Menyimpan token autentikasi dengan enkapsulasi aman ber-metadata.
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
      const envelope = {
        payload: encodeToken(sanitized),
        issuedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
      // Bersihkan kunci lama tanpa enkapsulasi
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem('sada_auth_token');
    } catch (_err) {
      // Tetap berfungsi via in-memory token jika storage diblokir
    }
  },

  /**
   * Menghapus seluruh token dan sesi yang tersimpan.
   */
  clear() {
    inMemoryToken = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem('sada_auth_token');
    } catch (_err) {
      // Abaikan error pada cleanup
    }
  },

  /**
   * Memeriksa apakah terdapat token aktif dan valid saat ini.
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(tokenStorage.get());
  },
};

export const getToken = () => tokenStorage.get();
export const setToken = (t) => tokenStorage.set(t);
export const clearToken = () => tokenStorage.clear();
