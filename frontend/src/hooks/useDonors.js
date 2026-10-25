import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mengambil, menyinkronkan, dan mengelola data pendonor darah.
 * Menggunakan AbortController untuk menjamin cleanup konsisten pada setiap reload dan unmount.
 *
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
  const abortControllerRef = useRef(null);

  const fetchDonors = useCallback(() => {
    // Batalkan pemanggilan aktif sebelumnya jika ada reload berturut-turut
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    api
      .donors({ signal: controller.signal })
      .then((donorList) => {
        if (!controller.signal.aborted) {
          setDonors(donorList);
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
    fetchDonors();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDonors]);

  const createDonor = useCallback(
    async (data) => {
      const res = await api.createDonor(data);
      fetchDonors();
      return res;
    },
    [fetchDonors]
  );

  const markDonated = useCallback(
    async (id) => {
      const res = await api.markDonated(id);
      fetchDonors();
      return res;
    },
    [fetchDonors]
  );

  const deleteDonor = useCallback(
    async (id) => {
      const res = await api.deleteDonor(id);
      fetchDonors();
      return res;
    },
    [fetchDonors]
  );

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
