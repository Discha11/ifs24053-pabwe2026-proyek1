import { useCallback } from 'react';
import { api } from '../api.js';
import { useApiFetch } from './useApiFetch.js';

/**
 * Custom hook untuk mengambil, menyinkronkan, dan mengelola data pendonor darah.
 * Menggunakan generic useApiFetch untuk konsistensi lifecycle dan penanganan pembatalan request.
 *
 * @returns {{
 *   donors: Array<object>|null,
 *   loading: boolean,
 *   error: boolean,
 *   reload: () => Promise<any>,
 *   createDonor: (data: object) => Promise<any>,
 *   markDonated: (id: number|string) => Promise<any>,
 *   deleteDonor: (id: number|string) => Promise<any>
 * }}
 */
export function useDonors() {
  const {
    data: donors,
    loading,
    error,
    reload,
  } = useApiFetch((signal) => api.donors({ signal }));

  const createDonor = useCallback(
    async (data) => {
      const res = await api.createDonor(data);
      reload().catch(() => {});
      return res;
    },
    [reload]
  );

  const markDonated = useCallback(
    async (id) => {
      const res = await api.markDonated(id);
      reload().catch(() => {});
      return res;
    },
    [reload]
  );

  const deleteDonor = useCallback(
    async (id) => {
      const res = await api.deleteDonor(id);
      reload().catch(() => {});
      return res;
    },
    [reload]
  );

  return {
    donors,
    loading,
    error,
    reload,
    createDonor,
    markDonated,
    deleteDonor,
  };
}
