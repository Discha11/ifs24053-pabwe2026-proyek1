import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mencocokkan pendonor kompatibel berdasarkan golongan darah dan kota.
 * @param {string} bloodType
 * @param {string} city
 * @returns {{ data: object|null, loading: boolean, error: boolean, reload: () => void }}
 */
export function useDonorMatch(bloodType, city = '') {
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

  return { data, loading, error, reload: performMatch };
}
