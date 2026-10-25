import { useCallback, useState } from 'react';
import { useStats, useDonors, useCities, useRequests } from './index.js';
import { getErrorMessage } from '../utils/errors.js';

/**
 * Custom hook untuk merangkum seluruh logika state management, pemanggilan data,
 * dan aksi administratif (tandai donor, hapus data, tutup permintaan) dari komponen Dashboard.
 * Menghilangkan percampuran antara logika data dan render presentational UI.
 */
export function useDashboardData() {
  const { stats, reload: reloadStats } = useStats();
  const { donors, reload: reloadDonors, markDonated, deleteDonor } = useDonors();
  const { cities } = useCities();
  const { requests, error: reqError, reload: reloadRequests, closeRequest, deleteRequest } = useRequests();

  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Lanjutkan',
    isDanger: false,
    onConfirm: () => {},
  });

  const loadDashboardData = useCallback(() => {
    reloadStats();
    reloadDonors();
  }, [reloadStats, reloadDonors]);

  const refreshAll = useCallback(() => {
    loadDashboardData();
    reloadRequests();
  }, [loadDashboardData, reloadRequests]);

  const closeModal = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleMarkDonated = async (donor) => {
    setActionMsg('');
    setActionErr('');
    try {
      await markDonated(donor.id);
      setActionMsg(`Aksi donor hari ini untuk ${donor.name} berhasil dicatat.`);
      loadDashboardData();
    } catch (err) {
      setActionErr(getErrorMessage(err));
    }
  };

  const handleDeleteDonor = (donor) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Pendonor',
      message: `Apakah Anda yakin ingin menghapus data pendonor ${donor.name}? Data yang dihapus tidak dapat dipulihkan.`,
      confirmText: 'Ya, Hapus Data',
      isDanger: true,
      onConfirm: async () => {
        closeModal();
        setActionMsg('');
        setActionErr('');
        try {
          await deleteDonor(donor.id);
          setActionMsg(`Pendonor ${donor.name} berhasil dihapus.`);
          loadDashboardData();
        } catch (err) {
          setActionErr(getErrorMessage(err));
        }
      },
    });
  };

  const handleCloseRequest = async (request) => {
    setActionMsg('');
    setActionErr('');
    try {
      await closeRequest(request.id);
      setActionMsg(`Permintaan darah untuk ${request.hospital} berhasil ditutup.`);
      refreshAll();
    } catch (err) {
      setActionErr(getErrorMessage(err));
    }
  };

  const handleDeleteRequest = (request) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Permintaan Darah',
      message: `Apakah Anda yakin ingin menghapus permintaan darah dari ${request.hospital}?`,
      confirmText: 'Ya, Hapus Permintaan',
      isDanger: true,
      onConfirm: async () => {
        closeModal();
        setActionMsg('');
        setActionErr('');
        try {
          await deleteRequest(request.id);
          setActionMsg('Permintaan darah berhasil dihapus.');
          refreshAll();
        } catch (err) {
          setActionErr(getErrorMessage(err));
        }
      },
    });
  };

  return {
    stats,
    donors,
    cities,
    requests,
    reqError,
    actionMsg,
    actionErr,
    modalConfig,
    closeModal,
    loadDashboardData,
    refreshAll,
    handleMarkDonated,
    handleDeleteDonor,
    handleCloseRequest,
    handleDeleteRequest,
  };
}
