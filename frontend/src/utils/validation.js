/**
 * Modul utilitas validasi input data terpusat.
 * Mencegah duplikasi aturan regex dan logika validasi di seluruh aplikasi.
 */

/**
 * Pola regex nomor telepon seluler / WhatsApp aktif di Indonesia:
 * Mendukung awalan 08, +628, atau 628 dengan 8 hingga 12 digit lanjutan.
 */
export const INDONESIAN_PHONE_REGEX = /^(08|\+628|628)[0-9]{8,12}$/;

/**
 * Pola regex format alamat email standar RFC 5322 sederhana.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Membersihkan karakter spasi, strip, dan karakter non-digit dari nomor telepon.
 * @param {string} phone
 * @returns {string}
 */
export function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return phone.trim().replace(/[-\s]/g, '');
}

/**
 * Memvalidasi apakah nomor telepon merupakan nomor seluler/WhatsApp Indonesia yang valid.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidIndonesianPhone(phone) {
  const cleanPhone = sanitizePhone(phone);
  return INDONESIAN_PHONE_REGEX.test(cleanPhone);
}

/**
 * Memvalidasi format alamat email.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Memvalidasi panjang minimal teks setelah di-trim.
 * @param {string} text
 * @param {number} minLength
 * @returns {boolean}
 */
export function hasMinLength(text, minLength = 3) {
  if (!text || typeof text !== 'string') return false;
  return text.trim().length >= minLength;
}
