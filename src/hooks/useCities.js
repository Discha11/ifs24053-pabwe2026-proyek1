import { api } from '../api.js';
import { useApiFetch } from './useApiFetch.js';

/**
 * Custom hook untuk mengambil daftar kota/kabupaten terjangkau di kawasan Danau Toba.
 * Menggunakan generic useApiFetch untuk konsistensi pemanggilan dan penanganan cleanup request.
 *
 * @returns {{ cities: Array<string>, loading: boolean, error: boolean, reload: () => Promise<any> }}
 */
export function useCities() {
  const {
    data: cities,
    loading,
    error,
    reload,
  } = useApiFetch((signal) => api.cities({ signal }), [], []);

  return { cities: cities || [], loading, error, reload };
}
