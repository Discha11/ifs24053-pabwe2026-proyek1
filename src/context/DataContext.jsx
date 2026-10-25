import PropTypes from 'prop-types';
import { createContext, useContext, useCallback, useMemo } from 'react';
import { useStats, useRequests } from '../hooks/index.js';

const DataContext = createContext(null);

/**
 * Provider terpusat untuk data global aplikasi (stats & requests).
 * Mengintegrasikan data fetching dengan single-source of truth context,
 * mencegah fetch data ganda antara App.jsx dan Home.jsx saat inisialisasi.
 */
export function DataProvider({ children }) {
  const { stats, loading: loadingStats, error: statsError, reload: reloadStats } = useStats();
  const {
    requests,
    loading: loadingRequests,
    error: requestsError,
    reload: reloadRequests,
    createRequest,
    closeRequest,
    deleteRequest,
  } = useRequests();

  const reloadAll = useCallback(() => {
    reloadStats();
    reloadRequests();
  }, [reloadStats, reloadRequests]);

  const handleCreateRequest = useCallback(
    async (data) => {
      const res = await createRequest(data);
      reloadStats();
      return res;
    },
    [createRequest, reloadStats]
  );

  const value = useMemo(
    () => ({
      stats,
      loadingStats,
      statsError,
      reloadStats,
      requests,
      loadingRequests,
      requestsError,
      reloadRequests,
      reloadAll,
      createRequest: handleCreateRequest,
      closeRequest,
      deleteRequest,
      urgentCount: stats?.urgent_requests ?? 0,
    }),
    [
      stats,
      loadingStats,
      statsError,
      reloadStats,
      requests,
      loadingRequests,
      requestsError,
      reloadRequests,
      reloadAll,
      handleCreateRequest,
      closeRequest,
      deleteRequest,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}
