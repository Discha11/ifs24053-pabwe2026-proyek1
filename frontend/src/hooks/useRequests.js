import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mengambil dan menyinkronkan daftar permintaan darah dari API.
 * @returns {{ requests: Array<object>|null, loading: boolean, error: boolean, reload: () => void }}
 */
export function useRequests() {
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchRequests = useCallback(() => {
    let isMounted = true;
    setLoading(true);

    api
      .requests()
      .then((requestList) => {
        if (isMounted) {
          setRequests(requestList);
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
    const cleanup = fetchRequests();
    return cleanup;
  }, [fetchRequests]);

  return { requests, loading, error, reload: fetchRequests };
}
