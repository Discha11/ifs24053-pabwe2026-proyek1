import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Custom hook untuk mengambil, menyinkronkan, dan mengelola daftar permintaan darah dari API.
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

  const createRequest = useCallback(async (data) => {
    const res = await api.createRequest(data);
    fetchRequests();
    return res;
  }, [fetchRequests]);

  const closeRequest = useCallback(async (id) => {
    const res = await api.closeRequest(id);
    fetchRequests();
    return res;
  }, [fetchRequests]);

  const deleteRequest = useCallback(async (id) => {
    const res = await api.deleteRequest(id);
    fetchRequests();
    return res;
  }, [fetchRequests]);

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
