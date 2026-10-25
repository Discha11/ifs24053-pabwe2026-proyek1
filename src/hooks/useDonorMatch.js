import { useCallback } from 'react';
import { api } from '../api.js';
import { useApiFetch } from './useApiFetch.js';

/**
 * Custom hook untuk mencocokkan pendonor darah yang kompatibel secara medis.
 * Menggunakan generic useApiFetch untuk konsistensi pemanggilan dan penanganan cleanup request.
 *
 * @param {string} [bloodType]
 * @param {string} [city]
 * @returns {{
 *   data: object|null,
 *   loading: boolean,
 *   error: boolean,
 *   reload: () => Promise<any>,
 *   fetchMatch: (bt: string, c?: string) => Promise<any>
 * }}
 */
export function useDonorMatch(bloodType = '', city = '') {
  const fetcher = useCallback(
    (signal) => {
      if (!bloodType) return Promise.resolve(null);
      return api.match(bloodType, city, { signal });
    },
    [bloodType, city]
  );

  const { data, loading, error, reload } = useApiFetch(fetcher, [bloodType, city], null);

  const fetchMatch = useCallback(async (targetBloodType, targetCity = '') => {
    return await api.match(targetBloodType, targetCity);
  }, []);

  return { data, loading, error, reload, fetchMatch };
}
