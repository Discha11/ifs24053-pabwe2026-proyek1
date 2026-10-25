import { BLOOD_TYPES } from '../lib.js';

/**
 * Modul utilitas validasi input data terpusat dan skema validasi deklaratif.
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

/**
 * Skema validasi terpusat untuk setiap domain formulir di dalam aplikasi.
 */
export const validationSchemas = {
  /**
   * Skema validasi pendaftaran akun pendonor baru
   */
  register(data = {}) {
    const errors = [];
    if (!hasMinLength(data.name, 3)) {
      errors.push('Nama lengkap minimal 3 karakter.');
    }
    if (!isValidEmail(data.email)) {
      errors.push('Format alamat email tidak valid.');
    }
    if (!data.password || data.password.length < 6) {
      errors.push('Kata sandi minimal 6 karakter demi keamanan akun.');
    }
    if (!BLOOD_TYPES.includes(data.blood_type)) {
      errors.push('Pilih golongan darah yang valid.');
    }
    if (!data.city) {
      errors.push('Pilih kota domisili Anda.');
    }
    if (!isValidIndonesianPhone(data.phone)) {
      errors.push('Nomor WhatsApp harus nomor Indonesia yang valid (contoh: 081234567890).');
    }
    if (data.last_donated) {
      const today = new Date().toISOString().slice(0, 10);
      if (data.last_donated > today) {
        errors.push('Tanggal terakhir donor tidak boleh lebih dari hari ini.');
      }
    }
    return errors;
  },

  /**
   * Skema validasi masuk akun (login)
   */
  login(data = {}) {
    const errors = [];
    if (!data.email || !data.email.trim()) {
      errors.push('Alamat email atau username wajib diisi.');
    }
    if (!data.password) {
      errors.push('Kata sandi wajib diisi.');
    } else if (data.password.length < 6) {
      errors.push('Kata sandi minimal 6 karakter.');
    }
    return errors;
  },

  /**
   * Skema validasi pembuatan permintaan kebutuhan darah
   */
  createRequest(data = {}) {
    const errors = [];
    if (!hasMinLength(data.hospital, 3)) {
      errors.push('Nama rumah sakit/faskes harus diisi minimal 3 karakter.');
    }
    const unitsNum = Number(data.units);
    if (isNaN(unitsNum) || unitsNum < 1 || unitsNum > 20) {
      errors.push('Jumlah kantong darah harus antara 1 sampai 20 kantong.');
    }
    if (!isValidIndonesianPhone(data.contact_phone)) {
      errors.push('Nomor WhatsApp tidak valid. Masukkan nomor HP aktif (contoh: 081234567890).');
    }
    if (data.urgency === 'terjadwal' && !data.needed_date) {
      errors.push('Tanggal dibutuhkan harus diisi untuk kebutuhan terjadwal.');
    }
    return errors;
  },

  /**
   * Skema validasi penambahan pendonor via panel admin
   */
  donor(data = {}) {
    const errors = [];
    if (!hasMinLength(data.name, 2)) {
      errors.push('Nama lengkap harus diisi minimal 2 karakter.');
    }
    if (!isValidIndonesianPhone(data.phone)) {
      errors.push('Nomor WhatsApp tidak valid. Masukkan nomor HP aktif (contoh: 081234567890).');
    }
    return errors;
  },

  /**
   * Skema validasi pembaruan profil pengguna
   */
  profile(data = {}) {
    const errors = [];
    if (!hasMinLength(data.name, 3)) {
      errors.push('Nama lengkap minimal 3 karakter.');
    }
    if (data.last_donated) {
      const today = new Date().toISOString().slice(0, 10);
      if (data.last_donated > today) {
        errors.push('Tanggal terakhir donor tidak boleh di masa mendatang.');
      }
    }
    return errors;
  },

  /**
   * Skema validasi pengaturan akun
   */
  settings(data = {}) {
    const errors = [];
    if (!hasMinLength(data.name, 3)) {
      errors.push('Nama lengkap minimal 3 karakter.');
    }
    if (data.phone && !isValidIndonesianPhone(data.phone)) {
      errors.push('Nomor WhatsApp harus nomor Indonesia yang valid (contoh: 081234567890).');
    }
    return errors;
  },
};
