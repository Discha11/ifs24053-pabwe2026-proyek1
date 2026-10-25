import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mengambil daftar kota/kabupaten kawasan Toba.
 * Mengisolasi state data, loading, dan error.
 * @returns {{ cities: string[], loading: boolean, error: boolean, reload: () => void }}
 */
export function useCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchCities = useCallback(() => {
    let isMounted = true;
    setLoading(true);

    api
      .cities()
      .then((cityList) => {
        if (isMounted) {
          setCities(cityList || []);
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
  }, []);

  useEffect(() => {
    const cleanup = fetchCities();
    return cleanup;
  }, [fetchCities]);

  return { cities, loading, error, reload: fetchCities };
}
