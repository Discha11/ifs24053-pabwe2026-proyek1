import { useMemo, useState } from 'react';

/**
 * Custom hook untuk memisahkan seluruh logika filter, pencarian, dan pengurutan data permintaan darah dari komponen UI.
 * Memastikan prinsip Separation of Concerns (SoC) terpenuhi secara optimal.
 *
 * @param {Array<object>} requests
 * @returns {object}
 */
export function useFilteredRequests(requests = []) {
  const [search, setSearch] = useState('');
  const [selectedGol, setSelectedGol] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [priorityUrgency, setPriorityUrgency] = useState(true);

  const resetFilters = () => {
    setSearch('');
    setSelectedGol('');
    setSelectedCity('');
    setSelectedUrgency('');
  };

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    const list = requests.filter((r) => {
      const matchSearch =
        search === '' ||
        r.hospital?.toLowerCase().includes(search.toLowerCase()) ||
        r.city?.toLowerCase().includes(search.toLowerCase()) ||
        r.blood_type?.toLowerCase().includes(search.toLowerCase());
      const matchGol = selectedGol === '' || r.blood_type === selectedGol;
      const matchCity = selectedCity === '' || r.city === selectedCity;
      const matchUrgency = selectedUrgency === '' || r.urgency === selectedUrgency;
      return matchSearch && matchGol && matchCity && matchUrgency;
    });

    if (priorityUrgency) {
      const weight = { darurat: 3, segera: 2, terjadwal: 1 };
      list.sort((a, b) => (weight[b.urgency] || 0) - (weight[a.urgency] || 0));
    }
    return list;
  }, [requests, search, selectedGol, selectedCity, selectedUrgency, priorityUrgency]);

  return {
    search,
    setSearch,
    selectedGol,
    setSelectedGol,
    selectedCity,
    setSelectedCity,
    selectedUrgency,
    setSelectedUrgency,
    priorityUrgency,
    setPriorityUrgency,
    filteredRequests,
    resetFilters,
    totalFiltered: filteredRequests.length,
    totalRequests: requests ? requests.length : 0,
  };
}
