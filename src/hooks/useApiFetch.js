import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook generik untuk eksekusi API fetch dengan penanganan lifecycle terstandar,
 * caching state, loading state, error state, dan pembersihan otomatis menggunakan AbortController.
 *
 * @template T
 * @param {(signal: AbortSignal, ...args: any[]) => Promise<T>} fetcherFn - Fungsi pemanggil API
 * @param {Array<any>} [dependencies=[]] - Dependensi yang memicu re-fetch saat berubah
 * @param {T} [initialData=null] - Nilai data awal
 * @returns {{
 *   data: T,
 *   setData: import('react').Dispatch<import('react').SetStateAction<T>>,
 *   loading: boolean,
 *   error: boolean,
 *   reload: (...args: any[]) => Promise<T>
 * }}
 */
export function useApiFetch(fetcherFn, dependencies = [], initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortControllerRef = useRef(null);

  const execute = useCallback(
    async (...args) => {
      // Abort pemanggilan aktif sebelumnya
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLoading(true);

      try {
        const result = await fetcherFn(controller.signal, ...args);
        if (!controller.signal.aborted) {
          setData(result);
          setError(false);
        }
        return result;
      } catch (err) {
        if (err?.name !== 'AbortError' && !controller.signal.aborted) {
          setError(true);
        }
        throw err;
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  );

  useEffect(() => {
    execute().catch(() => {});
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute]);

  return {
    data,
    setData,
    loading,
    error,
    reload: execute,
  };
}
