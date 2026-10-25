import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStorage, isTokenExpired } from './tokenStorage.js';

describe('tokenStorage (In-Memory Security)', () => {
  beforeEach(() => {
    tokenStorage.clear();
  });

  it('harus mengembalikan string kosong saat belum ada token', () => {
    expect(tokenStorage.get()).toBe('');
    expect(tokenStorage.isAuthenticated()).toBe(false);
  });

  it('harus menyimpan token aktif di in-memory', () => {
    // Dummy JWT token dengan expiration di masa mendatang (2099)
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = btoa(JSON.stringify({ id: 1, email: 'admin@sada.id', exp: futureExp }));
    const validJwt = `header.${payload}.signature`;

    tokenStorage.set(validJwt);
    expect(tokenStorage.get()).toBe(validJwt);
    expect(tokenStorage.isAuthenticated()).toBe(true);
  });

  it('harus mendeteksi token kedaluwarsa dan membersihkan memori', () => {
    // Dummy JWT token dengan expiration di masa lalu
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const payload = btoa(JSON.stringify({ id: 1, exp: pastExp }));
    const expiredJwt = `header.${payload}.signature`;

    expect(isTokenExpired(expiredJwt)).toBe(true);

    tokenStorage.set(expiredJwt);
    expect(tokenStorage.get()).toBe('');
    expect(tokenStorage.isAuthenticated()).toBe(false);
  });

  it('harus membersihkan memori token saat clear dipanggil', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = btoa(JSON.stringify({ id: 1, exp: futureExp }));
    const validJwt = `header.${payload}.signature`;

    tokenStorage.set(validJwt);
    expect(tokenStorage.isAuthenticated()).toBe(true);

    tokenStorage.clear();
    expect(tokenStorage.get()).toBe('');
    expect(tokenStorage.isAuthenticated()).toBe(false);
  });
});
