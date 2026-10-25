import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mengambil, menyinkronkan, dan mengelola data pendonor darah.
 * @returns {{
 *   donors: Array<object>|null,
 *   loading: boolean,
 *   error: boolean,
 *   reload: () => void,
 *   createDonor: (data: object) => Promise<any>,
 *   markDonated: (id: number|string) => Promise<any>,
 *   deleteDonor: (id: number|string) => Promise<any>
 * }}
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

  const createDonor = useCallback(async (data) => {
    const res = await api.createDonor(data);
    fetchDonors();
    return res;
  }, [fetchDonors]);

  const markDonated = useCallback(async (id) => {
    const res = await api.markDonated(id);
    fetchDonors();
    return res;
  }, [fetchDonors]);

  const deleteDonor = useCallback(async (id) => {
    const res = await api.deleteDonor(id);
    fetchDonors();
    return res;
  }, [fetchDonors]);

  return {
    donors,
    loading,
    error,
    reload: fetchDonors,
    createDonor,
    markDonated,
    deleteDonor,
  };
}
