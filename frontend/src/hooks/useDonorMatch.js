import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mencocokkan pendonor darah yang kompatibel secara medis.
 * @param {string} [bloodType]
 * @param {string} [city]
 * @returns {{
 *   data: object|null,
 *   loading: boolean,
 *   error: boolean,
 *   reload: () => void,
 *   fetchMatch: (bt: string, c?: string) => Promise<any>
 * }}
 */
export function useDonorMatch(bloodType = '', city = '') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const performMatch = useCallback(() => {
    if (!bloodType) return;
    let isMounted = true;
    setLoading(true);

    api
      .match(bloodType, city)
      .then((result) => {
        if (isMounted) {
          setData(result);
          setError(false);
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bloodType, city]);

  useEffect(() => {
    const cleanup = performMatch();
    return cleanup;
  }, [performMatch]);

  const fetchMatch = useCallback(async (targetBloodType, targetCity = '') => {
    return await api.match(targetBloodType, targetCity);
  }, []);

  return { data, loading, error, reload: performMatch, fetchMatch };
}
