import { api } from '../api.js';
import { useApiFetch } from './useApiFetch.js';

/**
 * Custom hook untuk mengambil statistik platform (jumlah pendonor, siap donor hari ini, permintaan).
 * Menggunakan generic useApiFetch untuk konsistensi pemanggilan dan penanganan cleanup request.
 *
 * @returns {{ stats: object|null, loading: boolean, error: boolean, reload: () => Promise<any> }}
 */
export function useStats() {
  const {
    data: stats,
    loading,
    error,
    reload,
  } = useApiFetch((signal) => api.stats({ signal }));

  return { stats, loading, error, reload };
}
