import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

/**
 * Daftar golongan darah lengkap dengan sistem Rhesus (+/-)
 */
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const GOL = BLOOD_TYPES; // Alias backward-compatibility

/**
 * Memformat penulisan simbol minus pada golongan darah agar lebih estetik dan tipografi rapi.
 * @param {string} bloodType
 * @returns {string}
 */
export function formatBloodType(bloodType) {
  if (!bloodType) return '';
  return bloodType.replace('-', '−');
}
export const fg = formatBloodType; // Alias backward-compatibility

/**
 * Konfigurasi badge urgensi permintaan darah
 */
export const URGENCY_CONFIG = {
  darurat: ['Darurat', 'dr'],
  segera: ['Segera', 'sg'],
  terjadwal: ['Terjadwal', 'tj'],
};
export const URGENCY = URGENCY_CONFIG; // Alias backward-compatibility

const getTodayTimestamp = () => Date.parse(new Date().toISOString().slice(0, 10));

/**
 * Memformat tanggal ISO menjadi format tanggal lokal Indonesia (misal: "24 Okt").
 * @param {string|Date} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  if (!isoDate) return '-';
  try {
    const dateString = String(isoDate).includes('T') ? String(isoDate) : `${isoDate}T00:00:00`;
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return String(isoDate);
    return parsedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  } catch (_err) {
    return String(isoDate);
  }
}
export const fmtDate = formatDate; // Alias backward-compatibility

/**
 * Menghitung dan memformat sisa waktu atau elapsed time permintaan darah secara manusiawi.
 * @param {object} request
 * @returns {string}
 */
export function formatRequestTime(request) {
  if (!request) return '';

  if (request.urgency === 'terjadwal' && request.needed_date) {
    const daysRemaining = Math.ceil((Date.parse(request.needed_date) - getTodayTimestamp()) / 86400000);
    return daysRemaining <= 0 ? 'Dibutuhkan hari ini' : `Dibutuhkan ${daysRemaining} hari lagi`;
  }

  const minutesAgo = (Date.now() - (Date.parse(request.created_at) || Date.now())) / 60000;
  if (minutesAgo < 60) return `Diminta ${Math.max(1, Math.round(minutesAgo))} menit lalu`;
  if (minutesAgo < 24 * 60) return `Diminta ${Math.floor(minutesAgo / 60)} jam lalu`;
  if (minutesAgo < 48 * 60) return 'Diminta kemarin';
  return `Diminta ${Math.floor(minutesAgo / 1440)} hari lalu`;
}
export const reqTime = formatRequestTime; // Alias backward-compatibility

/**
 * Hook kustom untuk memuat dan menyinkronkan daftar permintaan darah dari API.
 * @returns {{ requests: Array<object>|null, error: boolean, reload: () => void }}
 */
export function useRequests() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState(false);

  const reload = useCallback(() => {
    api
      .requests()
      .then((data) => {
        setRequests(data);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { requests, error, reload };
}
