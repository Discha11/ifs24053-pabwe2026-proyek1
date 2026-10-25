import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mengambil statistik platform (jumlah pendonor, siap donor hari ini, permintaan).
 * Menggunakan AbortController untuk menjamin cleanup konsisten pada setiap reload dan unmount.
 *
 * @returns {{ stats: object|null, loading: boolean, error: boolean, reload: () => void }}
 */
export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortControllerRef = useRef(null);

  const fetchStats = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    api
      .stats({ signal: controller.signal })
      .then((statsData) => {
        if (!controller.signal.aborted) {
          setStats(statsData);
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
    fetchStats();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStats]);

  return { stats, loading, error, reload: fetchStats };
}
