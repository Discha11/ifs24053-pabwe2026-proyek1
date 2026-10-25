import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mengambil statistik platform (jumlah pendonor, siap donor hari ini, permintaan).
 * @returns {{ stats: object|null, loading: boolean, error: boolean, reload: () => void }}
 */
export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(() => {
    let isMounted = true;
    setLoading(true);

    api
      .stats()
      .then((statsData) => {
        if (isMounted) {
          setStats(statsData);
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
    const cleanup = fetchStats();
    return cleanup;
  }, [fetchStats]);

  return { stats, loading, error, reload: fetchStats };
}
