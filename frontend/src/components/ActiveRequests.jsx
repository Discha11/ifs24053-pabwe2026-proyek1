import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCities, useDonorMatch } from '../hooks/index.js';
import { IconHeart } from './Icons.jsx';
import FilterBar from './FilterBar.jsx';
import RequestCard from './RequestCard.jsx';
import CompatibilityCalculator from './CompatibilityCalculator.jsx';

export default function ActiveRequests({ requests = [], error = false }) {
  const [search, setSearch] = useState('');
  const [selectedGol, setSelectedGol] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [priorityUrgency, setPriorityUrgency] = useState(true);
  const { cities } = useCities();
  const { fetchMatch } = useDonorMatch();
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [matchData, setMatchData] = useState({});
  const [loadingMatchId, setLoadingMatchId] = useState(null);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'calculator'

  const handleToggleMatch = async (req) => {
    if (expandedMatchId === req.id) {
      setExpandedMatchId(null);
      return;
    }
    setExpandedMatchId(req.id);
    if (!matchData[req.id]) {
      setLoadingMatchId(req.id);
      try {
        const res = await fetchMatch(req.blood_type, req.city);
        setMatchData((prev) => ({ ...prev, [req.id]: res }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMatchId(null);
      }
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedGol('');
    setSelectedCity('');
    setSelectedUrgency('');
  };

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    let list = requests.filter((r) => {
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

  return (
    <section className="active-req-section" id="permintaan-aktif">
      <div className="wrap">
        <div className="view-mode-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'requests'}
            className={`tab-pill ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span className="dot-live" />
            Permintaan Darah Aktif ({requests ? requests.length : 0})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'calculator'}
            className={`tab-pill ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <IconHeart />
            Cek Kompatibilitas Golongan Darah
          </button>
        </div>

        {activeTab === 'requests' ? (
          <>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              selectedGol={selectedGol}
              onGolChange={setSelectedGol}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              selectedUrgency={selectedUrgency}
              onUrgencyChange={setSelectedUrgency}
              priorityUrgency={priorityUrgency}
              onPriorityChange={setPriorityUrgency}
              cities={cities}
              onReset={resetFilters}
              totalFiltered={filteredRequests.length}
              totalRequests={requests ? requests.length : 0}
            />

            <div className="req-sec-header">
              <div className="title-with-pill">
                <h2>Daftar Permintaan Darah Aktif</h2>
                <span className="source-pill">SQLite: requests</span>
              </div>
              <Link to="/buat" className="btn-create-req">
                <span className="plus-ic">+</span> Buat Permintaan Darah
              </Link>
            </div>

            {error && (
              <p className="msg err" role="alert">
                Tidak bisa terhubung ke server back-end. Pastikan server aktif lalu muat ulang.
              </p>
            )}

            {filteredRequests.length === 0 && !error && (
              <div className="empty-state-box">
                <p>Tidak ada permintaan darah yang cocok dengan filter pencarian Anda.</p>
                <button className="sbtn" onClick={resetFilters}>Reset Semua Filter</button>
              </div>
            )}

            <div className="requests-cards-grid">
              {filteredRequests.map((r) => (
                <RequestCard
                  key={r.id}
                  request={r}
                  isExpanded={expandedMatchId === r.id}
                  onToggleMatch={handleToggleMatch}
                  matchInfo={matchData[r.id]}
                  matchLoading={loadingMatchId === r.id}
                />
              ))}
            </div>
          </>
        ) : (
          <CompatibilityCalculator />
        )}
      </div>
    </section>
  );
}
