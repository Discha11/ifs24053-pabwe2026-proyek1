/**
 * Modul terpusat untuk standarisasi pesan kesalahan dan error handling di seluruh aplikasi.
 * Mencegah duplikasi pesan error di berbagai halaman dan komponen.
 */

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Tidak dapat terhubung ke server back-end. Pastikan server aktif lalu muat ulang.',
  SESSION_EXPIRED: 'Sesi Anda telah kedaluwarsa. Silakan masuk kembali untuk melanjutkan.',
  FORBIDDEN_ADMIN: 'Halaman ini khusus untuk Administrator. Akun Anda tidak memiliki hak akses.',
  UNAUTHORIZED: 'Silakan masuk ke akun Anda terlebih dahulu.',
  INVALID_CREDENTIALS: 'Email atau kata sandi yang Anda masukkan salah.',
  UNKNOWN_ERROR: 'Terjadi kesalahan sistem yang tidak terduga. Silakan coba beberapa saat lagi.',
};

/**
 * Mengubah objek error dari server atau exception JavaScript menjadi pesan ramah pengguna yang konsisten.
 * @param {Error|object|string} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;
  if (typeof error === 'string') return error;

  if (error.name === 'AbortError') {
    return 'Permintaan dibatalkan.';
  }

  if (error.status === 401) {
    return ERROR_MESSAGES.SESSION_EXPIRED;
  }

  if (error.status === 403) {
    return ERROR_MESSAGES.FORBIDDEN_ADMIN;
  }

  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.message?.includes('terhubung ke server')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}
