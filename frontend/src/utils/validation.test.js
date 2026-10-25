import { describe, it, expect } from 'vitest';
import {
  isValidIndonesianPhone,
  isValidEmail,
  hasMinLength,
  sanitizePhone,
  validationSchemas,
} from './validation.js';

describe('Validation Utilities', () => {
  describe('isValidIndonesianPhone', () => {
    it('harus menerima nomor HP Indonesia yang valid', () => {
      expect(isValidIndonesianPhone('081234567890')).toBe(true);
      expect(isValidIndonesianPhone('+6281234567890')).toBe(true);
      expect(isValidIndonesianPhone('6281234567890')).toBe(true);
    });

    it('harus menolak nomor tidak valid atau terlalu pendek', () => {
      expect(isValidIndonesianPhone('021123456')).toBe(false);
      expect(isValidIndonesianPhone('0812')).toBe(false);
      expect(isValidIndonesianPhone('abc')).toBe(false);
      expect(isValidIndonesianPhone('')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('harus memvalidasi format email yang benar', () => {
      expect(isValidEmail('pendonor@sada.id')).toBe(true);
      expect(isValidEmail('admin.toba@rumahsakit.org')).toBe(true);
    });

    it('harus menolak format email yang salah', () => {
      expect(isValidEmail('pendonor')).toBe(false);
      expect(isValidEmail('pendonor@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    it('harus memeriksa panjang minimal string setelah di-trim', () => {
      expect(hasMinLength('Balige', 3)).toBe(true);
      expect(hasMinLength('  RS  ', 3)).toBe(false);
      expect(hasMinLength(null, 3)).toBe(false);
    });
  });

  describe('sanitizePhone', () => {
    it('harus membersihkan spasi dan tanda minus', () => {
      expect(sanitizePhone('0812-3456-7890')).toBe('081234567890');
      expect(sanitizePhone(' 0812 3456 7890 ')).toBe('081234567890');
    });
  });
});

describe('validationSchemas Centralized Rules', () => {
  it('harus memvalidasi form login secara akurat', () => {
    expect(validationSchemas.login({ email: '', password: '' })).toHaveLength(2);
    expect(validationSchemas.login({ email: 'user@mail.com', password: '123' })).toContain(
      'Kata sandi minimal 6 karakter.'
    );
    expect(validationSchemas.login({ email: 'user@mail.com', password: 'password123' })).toHaveLength(0);
  });

  it('harus memvalidasi form registrasi donor baru', () => {
    const invalidData = {
      name: 'A',
      email: 'not-email',
      password: '12',
      blood_type: 'INVALID',
      city: '',
      phone: '123',
    };
    const errors = validationSchemas.register(invalidData);
    expect(errors.length).toBeGreaterThanOrEqual(5);

    const validData = {
      name: 'Tigor Silalahi',
      email: 'tigor@gmail.com',
      password: 'password123',
      blood_type: 'O+',
      city: 'Balige',
      phone: '081234567890',
    };
    expect(validationSchemas.register(validData)).toHaveLength(0);
  });

  it('harus memvalidasi form buat permintaan darah', () => {
    const invalidRequest = {
      hospital: 'RS',
      units: 0,
      contact_phone: '12345',
      urgency: 'terjadwal',
      needed_date: '',
    };
    const errors = validationSchemas.createRequest(invalidRequest);
    expect(errors).toContain('Nama rumah sakit/faskes harus diisi minimal 3 karakter.');
    expect(errors).toContain('Jumlah kantong darah harus antara 1 sampai 20 kantong.');
    expect(errors).toContain('Tanggal dibutuhkan harus diisi untuk kebutuhan terjadwal.');

    const validRequest = {
      hospital: 'RS HKBP Balige',
      units: 3,
      contact_phone: '081234567890',
      urgency: 'darurat',
    };
    expect(validationSchemas.createRequest(validRequest)).toHaveLength(0);
  });
});
