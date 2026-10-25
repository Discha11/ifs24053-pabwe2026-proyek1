import { useCallback } from 'react';
import { api } from '../api.js';
import { useApiFetch } from './useApiFetch.js';

/**
 * Custom hook untuk mengambil, menyinkronkan, dan mengelola daftar permintaan darah dari API.
 * Menggunakan generic useApiFetch untuk konsistensi lifecycle dan penanganan pembatalan request.
 *
 * @returns {{
 *   requests: Array<object>|null,
 *   loading: boolean,
 *   error: boolean,
 *   reload: () => Promise<any>,
 *   createRequest: (data: object) => Promise<any>,
 *   closeRequest: (id: number|string) => Promise<any>,
 *   deleteRequest: (id: number|string) => Promise<any>
 * }}
 */
export function useRequests() {
  const {
    data: requests,
    loading,
    error,
    reload,
  } = useApiFetch((signal) => api.requests({ signal }));

  const createRequest = useCallback(
    async (data) => {
      const res = await api.createRequest(data);
      reload().catch(() => {});
      return res;
    },
    [reload]
  );

  const closeRequest = useCallback(
    async (id) => {
      const res = await api.closeRequest(id);
      reload().catch(() => {});
      return res;
    },
    [reload]
  );

  const deleteRequest = useCallback(
    async (id) => {
      const res = await api.deleteRequest(id);
      reload().catch(() => {});
      return res;
    },
    [reload]
  );

  return {
    requests,
    loading,
    error,
    reload,
    createRequest,
    closeRequest,
    deleteRequest,
  };
}
