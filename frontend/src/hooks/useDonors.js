import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mengambil daftar pendonor terdaftar.
 * @returns {{ donors: Array<object>|null, loading: boolean, error: boolean, reload: () => void }}
 */
export function useDonors() {
  const [donors, setDonors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchDonors = useCallback(() => {
    let isMounted = true;
    setLoading(true);

    api
      .donors()
      .then((donorList) => {
        if (isMounted) {
          setDonors(donorList);
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
    const cleanup = fetchDonors();
    return cleanup;
  }, [fetchDonors]);

  return { donors, loading, error, reload: fetchDonors };
}
