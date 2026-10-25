import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mencocokkan pendonor darah yang kompatibel secara medis.
 * Menggunakan AbortController untuk menjamin cleanup konsisten pada setiap reload dan unmount.
 *
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
  const abortControllerRef = useRef(null);

  const performMatch = useCallback(() => {
    if (!bloodType) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    api
      .match(bloodType, city, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
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
  }, [bloodType, city]);

  useEffect(() => {
    performMatch();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [performMatch]);

  const fetchMatch = useCallback(async (targetBloodType, targetCity = '') => {
    return await api.match(targetBloodType, targetCity);
  }, []);

  return { data, loading, error, reload: performMatch, fetchMatch };
}
