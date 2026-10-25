import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mengambil daftar kota/kabupaten terjangkau di kawasan Danau Toba.
 * Menggunakan AbortController untuk menjamin cleanup konsisten pada setiap reload dan unmount.
 *
 * @returns {{ cities: Array<string>, loading: boolean, error: boolean, reload: () => void }}
 */
export function useCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortControllerRef = useRef(null);

  const fetchCities = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    api
      .cities({ signal: controller.signal })
      .then((cityList) => {
        if (!controller.signal.aborted) {
          setCities(cityList);
          setError(false);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError' && !controller.signal.aborted) {
          setError(true);
        }
      })
      .finally(() => {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    fetchCities();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCities]);

  return { cities, loading, error, reload: fetchCities };
}
