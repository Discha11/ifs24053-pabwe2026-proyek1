import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mengambil, menyinkronkan, dan mengelola daftar permintaan darah dari API.
 * Menggunakan AbortController untuk menjamin cleanup konsisten pada setiap reload dan unmount.
 *
 * @returns {{
 *   requests: Array<object>|null,
 *   loading: boolean,
 *   error: boolean,
 *   reload: () => void,
 *   createRequest: (data: object) => Promise<any>,
 *   closeRequest: (id: number|string) => Promise<any>,
 *   deleteRequest: (id: number|string) => Promise<any>
 * }}
 */
export function useRequests() {
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortControllerRef = useRef(null);

  const fetchRequests = useCallback(() => {
    // Batalkan pemanggilan aktif sebelumnya jika ada reload berturut-turut
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    api
      .requests({ signal: controller.signal })
      .then((requestList) => {
        if (!controller.signal.aborted) {
          setRequests(requestList);
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
    fetchRequests();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchRequests]);

  const createRequest = useCallback(
    async (data) => {
      const res = await api.createRequest(data);
      fetchRequests();
      return res;
    },
    [fetchRequests]
  );

  const closeRequest = useCallback(
    async (id) => {
      const res = await api.closeRequest(id);
      fetchRequests();
      return res;
    },
    [fetchRequests]
  );

  const deleteRequest = useCallback(
    async (id) => {
      const res = await api.deleteRequest(id);
      fetchRequests();
      return res;
    },
    [fetchRequests]
  );

  return {
    requests,
    loading,
    error,
    reload: fetchRequests,
    createRequest,
    closeRequest,
    deleteRequest,
  };
}
