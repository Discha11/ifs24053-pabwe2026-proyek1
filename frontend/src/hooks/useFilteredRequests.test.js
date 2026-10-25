import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilteredRequests } from './useFilteredRequests.js';

describe('useFilteredRequests Hook Test Suite', () => {
  const sampleRequests = [
    { id: 1, hospital: 'RS HKBP Balige', city: 'Balige', blood_type: 'A+', urgency: 'segera' },
    { id: 2, hospital: 'RSUD Tarutung', city: 'Tarutung', blood_type: 'B+', urgency: 'darurat' },
    { id: 3, hospital: 'Puskesmas Pangururan', city: 'Pangururan', blood_type: 'O+', urgency: 'terjadwal' },
    { id: 4, hospital: 'RS Porsea', city: 'Porsea', blood_type: 'A+', urgency: 'darurat' },
  ];

  it('mengurutkan permintaan darurat di awal secara default karena priorityUrgency aktif', () => {
    const { result } = renderHook(() => useFilteredRequests(sampleRequests));

    expect(result.current.totalFiltered).toBe(4);
    // Kedua darurat harus berada di urutan 1 dan 2
    expect(result.current.filteredRequests[0].urgency).toBe('darurat');
    expect(result.current.filteredRequests[1].urgency).toBe('darurat');
  });

  it('menyaring daftar berdasarkan kata kunci pencarian teks', () => {
    const { result } = renderHook(() => useFilteredRequests(sampleRequests));

    act(() => {
      result.current.setSearch('tarutung');
    });

    expect(result.current.totalFiltered).toBe(1);
    expect(result.current.filteredRequests[0].hospital).toBe('RSUD Tarutung');
  });

  it('menyaring daftar berdasarkan golongan darah', () => {
    const { result } = renderHook(() => useFilteredRequests(sampleRequests));

    act(() => {
      result.current.setSelectedGol('A+');
    });

    expect(result.current.totalFiltered).toBe(2);
    expect(result.current.filteredRequests.every((r) => r.blood_type === 'A+')).toBe(true);
  });

  it('menyaring daftar berdasarkan kota', () => {
    const { result } = renderHook(() => useFilteredRequests(sampleRequests));

    act(() => {
      result.current.setSelectedCity('Balige');
    });

    expect(result.current.totalFiltered).toBe(1);
    expect(result.current.filteredRequests[0].city).toBe('Balige');
  });

  it('menyaring daftar berdasarkan tingkat urgensi', () => {
    const { result } = renderHook(() => useFilteredRequests(sampleRequests));

    act(() => {
      result.current.setSelectedUrgency('terjadwal');
    });

    expect(result.current.totalFiltered).toBe(1);
    expect(result.current.filteredRequests[0].urgency).toBe('terjadwal');
  });

  it('mereset seluruh filter kembali ke kondisi awal melalui resetFilters', () => {
    const { result } = renderHook(() => useFilteredRequests(sampleRequests));

    act(() => {
      result.current.setSearch('HKBP');
      result.current.setSelectedGol('A+');
      result.current.setSelectedCity('Balige');
      result.current.setSelectedUrgency('segera');
    });
    expect(result.current.totalFiltered).toBe(1);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.search).toBe('');
    expect(result.current.selectedGol).toBe('');
    expect(result.current.selectedCity).toBe('');
    expect(result.current.selectedUrgency).toBe('');
    expect(result.current.totalFiltered).toBe(4);
  });
});
