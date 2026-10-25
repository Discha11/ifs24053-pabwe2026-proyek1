import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api, tokenStorage } from './api.js';
import { ERROR_MESSAGES } from './utils/errors.js';

describe('API Service & Error Handling Test Suite', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    tokenStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    tokenStorage.clear();
  });

  it('menyertakan Authorization header jika token tersedia di tokenStorage', async () => {
    tokenStorage.set('test-jwt-token');

    let capturedHeaders = null;
    globalThis.fetch = vi.fn().mockImplementation((url, options) => {
      capturedHeaders = options.headers;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
    });

    const result = await api.stats();
    expect(result).toEqual({ success: true });
    expect(capturedHeaders.Authorization).toBe('Bearer test-jwt-token');
    expect(capturedHeaders['Content-Type']).toBe('application/json');
  });

  it('mengembalikan null jika API mengembalikan status 204 No Content', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });

    const result = await api.deleteDonor('123');
    expect(result).toBeNull();
  });

  it('menangani kasus HTTP 400 Bad Request dengan rincian validasi', async () => {
    const errorPayload = {
      error: 'Data permintaan darah tidak valid',
      details: ['Golongan darah tidak valid', 'Jumlah unit minimal 1'],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => errorPayload,
    });

    await expect(api.createRequest({})).rejects.toMatchObject({
      message: 'Data permintaan darah tidak valid',
      status: 400,
      details: errorPayload.details,
    });
  });

  it('menangani kasus HTTP 401 Unauthorized saat sesi habis', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Sesi telah berakhir, silakan masuk kembali' }),
    });

    await expect(api.me()).rejects.toMatchObject({
      message: 'Sesi telah berakhir, silakan masuk kembali',
      status: 401,
    });
  });

  it('menangani kasus HTTP 403 Forbidden ketika otorisasi ditolak', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Halaman ini hanya dapat diakses oleh Administrator' }),
    });

    await expect(api.deleteDonor('abc')).rejects.toMatchObject({
      message: 'Halaman ini hanya dapat diakses oleh Administrator',
      status: 403,
    });
  });

  it('menangani kasus HTTP 404 Not Found', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Pendonor tidak ditemukan' }),
    });

    await expect(api.markDonated('999')).rejects.toMatchObject({
      message: 'Pendonor tidak ditemukan',
      status: 404,
    });
  });

  it('menangani kasus HTTP 500 Server Error dengan respons non-JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Not JSON');
      },
    });

    await expect(api.stats()).rejects.toMatchObject({
      message: 'Permintaan gagal (status 500)',
      status: 500,
    });
  });

  it('menangani kasus Network Error (gagal koneksi ke server backend)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(api.cities()).rejects.toThrow(ERROR_MESSAGES.NETWORK_ERROR);
  });

  it('meneruskan AbortError ketika request dibatalkan oleh AbortController', async () => {
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    globalThis.fetch = vi.fn().mockRejectedValue(abortErr);

    await expect(api.stats()).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
