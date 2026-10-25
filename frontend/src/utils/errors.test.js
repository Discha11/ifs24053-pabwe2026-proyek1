import { describe, it, expect } from 'vitest';
import { ERROR_MESSAGES, getErrorMessage } from './errors.js';

describe('Error Handling Standardizer', () => {
  it('harus memetakan error jaringan ke pesan yang seragam', () => {
    const netErr = new Error('Failed to fetch data from backend');
    expect(getErrorMessage(netErr)).toBe(ERROR_MESSAGES.NETWORK_ERROR);
  });

  it('harus menangani status 401 dan 403 HTTP', () => {
    const err401 = new Error('Unauthorized');
    err401.status = 401;
    expect(getErrorMessage(err401)).toBe(ERROR_MESSAGES.SESSION_EXPIRED);

    const err403 = new Error('Forbidden');
    err403.status = 403;
    expect(getErrorMessage(err403)).toBe(ERROR_MESSAGES.FORBIDDEN_ADMIN);
  });

  it('harus menangani AbortError', () => {
    const abortErr = new Error('The user aborted a request.');
    abortErr.name = 'AbortError';
    expect(getErrorMessage(abortErr)).toBe('Permintaan dibatalkan.');
  });

  it('harus mengembalikan pesan asli jika berupa string', () => {
    expect(getErrorMessage('Golongan darah tidak valid')).toBe('Golongan darah tidak valid');
  });
});
