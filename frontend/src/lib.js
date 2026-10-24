import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

export const GOL = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const fg = (g) => g.replace('-', '−'); // tampilkan tanda minus yang rapi
export const URGENCY = { darurat: ['Darurat', 'dr'], segera: ['Segera', 'sg'], terjadwal: ['Terjadwal', 'tj'] };

const todayMs = () => Date.parse(new Date().toISOString().slice(0, 10));

export function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function reqTime(r) {
  if (r.urgency === 'terjadwal' && r.needed_date) {
    const d = Math.ceil((Date.parse(r.needed_date) - todayMs()) / 86400000);
    return d <= 0 ? 'Dibutuhkan hari ini' : `Dibutuhkan ${d} hari lagi`;
  }
  const min = (Date.now() - Date.parse(r.created_at)) / 60000;
  if (min < 60) return `Diminta ${Math.max(1, Math.round(min))} menit lalu`;
  if (min < 24 * 60) return `Diminta ${Math.floor(min / 60)} jam lalu`;
  if (min < 48 * 60) return 'Diminta kemarin';
  return `Diminta ${Math.floor(min / 1440)} hari lalu`;
}

export function useRequests() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState(false);
  const reload = useCallback(() => api.requests().then((r) => { setRequests(r); setError(false); }).catch(() => setError(true)), []);
  useEffect(() => { reload(); }, [reload]);
  return { requests, error, reload };
}
