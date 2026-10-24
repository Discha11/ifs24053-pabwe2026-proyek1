import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { GOL, fg, fmtDate } from '../lib.js';
import Svg from './Svg.jsx';
import { iconDrop, iconHeart } from '../assets/svg.js';

export default function ActiveRequests({ requests = [], error = false }) {
  const [search, setSearch] = useState('');
  const [selectedGol, setSelectedGol] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [priorityUrgency, setPriorityUrgency] = useState(true);
  const [cities, setCities] = useState([]);
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [matchData, setMatchData] = useState({});
  const [matchLoading, setMatchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'calculator'

  // Calculator state
  const [calcGol, setCalcGol] = useState('A+');
  const [calcCity, setCalcCity] = useState('');
  const [calcData, setCalcData] = useState(null);

  useEffect(() => {
    api.cities().then(setCities).catch(() => {});
  }, []);

  // Fetch match for calculator
  useEffect(() => {
    if (activeTab === 'calculator') {
      api.match(calcGol, calcCity).then(setCalcData).catch(() => {});
    }
  }, [calcGol, calcCity, activeTab]);

  // Handle clicking "Cari Donor Kompatibel" on a specific request card
  const handleToggleMatch = async (req) => {
    if (expandedMatchId === req.id) {
      setExpandedMatchId(null);
      return;
    }
    setExpandedMatchId(req.id);
    if (!matchData[req.id]) {
      setMatchLoading(true);
      try {
        const res = await api.match(req.blood_type, req.city);
        setMatchData((prev) => ({ ...prev, [req.id]: res }));
      } catch (e) {
        console.error(e);
      } finally {
        setMatchLoading(false);
      }
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedGol('');
    setSelectedCity('');
    setSelectedUrgency('');
  };

  // Sample notes contextualized for Danau Toba regional clinics/hospitals
  const getRequestNote = (r) => {
    if (r.urgency === 'darurat') {
      return `"Pendarahan akut pasca tindakan darurat di ${r.hospital}, butuh suplai kantong segera untuk penanganan intensif."`;
    }
    if (r.urgency === 'segera') {
      return `"Persiapan tindakan transfusi cito di ruang rawat ${r.hospital}, ${r.city} dalam kurun waktu 24 jam."`;
    }
    return `"Kebutuhan terjadwal untuk prosedur medis dan cuci darah/operasi elektif di ${r.hospital}."`;
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    let list = requests.filter((r) => {
      const matchSearch =
        search === '' ||
        r.hospital.toLowerCase().includes(search.toLowerCase()) ||
        r.city.toLowerCase().includes(search.toLowerCase()) ||
        r.blood_type.toLowerCase().includes(search.toLowerCase());
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
        {/* Tab Switcher */}
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
            <Svg markup={iconHeart} />
            Cek Kompatibilitas Golongan Darah
          </button>
        </div>

        {activeTab === 'requests' ? (
          <>
            {/* Toolbar Filter / Search Bar */}
            <div className="filter-toolbar">
              <div className="filter-row">
                <div className="search-box">
                  <span className="search-icon" aria-hidden="true">🔍</span>
                  <input
                    type="text"
                    placeholder="Cari rumah sakit, kota, atau golongan darah..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="clear-search" onClick={() => setSearch('')}>×</button>
                  )}
                </div>

                <select
                  value={selectedGol}
                  onChange={(e) => setSelectedGol(e.target.value)}
                  aria-label="Filter Golongan Darah"
                >
                  <option value="">Semua Gol. Darah</option>
                  {GOL.map((g) => (
                    <option key={g} value={g}>{fg(g)}</option>
                  ))}
                </select>

                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  aria-label="Filter Kota/Kab"
                >
                  <option value="">Semua Kota/Kab</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  aria-label="Filter Status"
                >
                  <option value="">Semua Status</option>
                  <option value="darurat">Darurat (&lt; 6 Jam)</option>
                  <option value="segera">Segera (&lt; 24 Jam)</option>
                  <option value="terjadwal">Terjadwal</option>
                </select>

                <button
                  type="button"
                  className="reset-btn"
                  title="Reset Filter"
                  onClick={resetFilters}
                  aria-label="Reset Filter"
                >
                  ↻
                </button>
              </div>

              <div className="filter-meta-row">
                <div className="active-meta">
                  <span className="meta-badge-dot" />
                  <span className="meta-text">
                    <strong>Tampilan Aktif:</strong> Permintaan Darah • Menampilkan {filteredRequests.length} dari {requests ? requests.length : 0} permintaan
                  </span>
                </div>
                <label className="urgency-checkbox-label">
                  <input
                    type="checkbox"
                    checked={priorityUrgency}
                    onChange={(e) => setPriorityUrgency(e.target.checked)}
                  />
                  <span>Prioritaskan Urgensi (Darurat &gt; Segera &gt; Terjadwal)</span>
                </label>
              </div>
            </div>

            {/* Section Header */}
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

            {/* Rich Cards Grid */}
            <div className="requests-cards-grid">
              {filteredRequests.map((r) => {
                const isExpanded = expandedMatchId === r.id;
                const mInfo = matchData[r.id];

                return (
                  <article key={r.id} className={`req-card ${r.urgency === 'darurat' ? 'border-urgent' : ''}`}>
                    {/* Top Row: Blood Badge + Hospital Info + Urgency Pill */}
                    <div className="card-top-row">
                      <div className="blood-type-box">
                        <span className="blood-text">{fg(r.blood_type)}</span>
                        <span className="blood-sub">RBC</span>
                      </div>

                      <div className="card-hospital-meta">
                        <h3 className="hospital-name">{r.hospital}</h3>
                        <div className="hospital-loc">
                          <span className="pin-icon" aria-hidden="true">📍</span>
                          <span>{r.hospital}, {r.city}</span>
                        </div>
                      </div>

                      <div className="card-urgency-wrapper">
                        {r.urgency === 'darurat' && (
                          <span className="urgency-pill pill-darurat">
                            <span className="pulse-dot red" />
                            DARURAT (&lt; 6 JAM)
                          </span>
                        )}
                        {r.urgency === 'segera' && (
                          <span className="urgency-pill pill-segera">
                            <span className="pulse-dot amber" />
                            SEGERA (&lt; 24 JAM)
                          </span>
                        )}
                        {r.urgency === 'terjadwal' && (
                          <span className="urgency-pill pill-terjadwal">
                            📅 TERJADWAL
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Detail Specs Grid */}
                    <div className="card-specs-box">
                      <div className="spec-item">
                        <span className="spec-label">Kebutuhan:</span>
                        <strong className="spec-val">{r.units} Kantong Darah</strong>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Batas Waktu:</span>
                        <strong className="spec-val">
                          {r.needed_date ? fmtDate(r.needed_date) : 'Hari Ini / Cito'}
                        </strong>
                      </div>
                    </div>

                    {/* Clinic Quote */}
                    <p className="card-quote">{getRequestNote(r)}</p>

                    {/* Action Buttons */}
                    <div className="card-actions-row">
                      <button
                        type="button"
                        className={`btn-match-action ${isExpanded ? 'active' : ''}`}
                        onClick={() => handleToggleMatch(r)}
                      >
                        <span className="match-ic">🔍</span>
                        <span>
                          {isExpanded
                            ? 'Tutup Daftar Kompatibel'
                            : mInfo
                            ? `Donor Kompatibel (${mInfo.ready_count} Siap)`
                            : 'Cari Donor Kompatibel'}
                        </span>
                      </button>

                      <a
                        className="btn-wa-contact"
                        href={r.wa_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Hubungi kontak pemohon langsung"
                      >
                        💬 Hubungi Pasien
                      </a>
                    </div>

                    {/* Expandable Compatible Donors Drawer */}
                    {isExpanded && (
                      <div className="donor-compat-drawer">
                        <div className="drawer-header">
                          <h4>
                            Pendonor Kompatibel untuk <span>{fg(r.blood_type)}</span> di <span>{r.city}</span>
                          </h4>
                          <span className="compat-rule">
                            Menerima: {mInfo ? mInfo.compatible_types.map(fg).join(', ') : '...'}
                          </span>
                        </div>

                        {matchLoading && !mInfo && (
                          <p className="drawer-status">Mencari pendonor yang siap...</p>
                        )}

                        {mInfo && mInfo.results.length === 0 && (
                          <p className="drawer-empty">
                            Belum ada pendonor kompatibel terdaftar di {r.city}. Silakan bagikan info ini ke komunitas.
                          </p>
                        )}

                        {mInfo && mInfo.results.length > 0 && (
                          <div className="drawer-donor-list">
                            {mInfo.results.map((donor) => (
                              <div key={donor.id} className="drawer-donor-item">
                                <span className={`mini-blood-pill ${donor.ready ? 'ready' : 'not-ready'}`}>
                                  {fg(donor.blood_type)}
                                </span>
                                <div className="mini-donor-info">
                                  <strong>{donor.name}</strong>
                                  <small>
                                    {donor.same_type ? 'Golongan sama' : 'Kompatibel'} • {donor.city}
                                  </small>
                                </div>
                                <div className="mini-donor-status">
                                  {donor.ready ? (
                                    <a
                                      href={donor.wa_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mini-wa-btn"
                                    >
                                      Chat WA
                                    </a>
                                  ) : (
                                    <span className="wait-badge">
                                      Siap {donor.days_until_eligible} hr lg
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          /* Calculator View: Full compatibility checker */
          <div className="calculator-view-box">
            <div className="calc-header">
              <h2>Cek Kompatibilitas Darah</h2>
              <p className="sub">
                Pilih golongan darah pasien untuk melihat siapa saja pendonor kompatibel yang sudah melewati jeda 75 hari donor terakhir.
              </p>
            </div>

            <div className="ctl" style={{ marginTop: 20 }}>
              <div className="chips" role="group" aria-label="Golongan darah pasien">
                {GOL.map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={g === calcGol}
                    onClick={() => setCalcGol(g)}
                  >
                    {fg(g)}
                  </button>
                ))}
              </div>
              <select
                aria-label="Pilih Kota"
                value={calcCity}
                onChange={(e) => setCalcCity(e.target.value)}
              >
                <option value="">Semua kota kawasan Toba</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {calcData && (
              <div className="calc-results-wrap">
                <p className="ringkas">
                  Pasien <strong>{fg(calcGol)}</strong>{calcCity ? ` di ${calcCity}` : ''}: menerima donor dari{' '}
                  <span className="grad-compat">{calcData.compatible_types.map(fg).join(', ')}</span>.{' '}
                  Ditemukan <strong>{calcData.total}</strong> pendonor ({calcData.ready_count} siap hari ini).
                </p>

                <div className="donor-grid-compact">
                  {calcData.results.map((d) => (
                    <article className="it" key={d.id}>
                      <div className={`gol ${d.ready ? '' : 'off'}`}>{fg(d.blood_type)}</div>
                      <div className="t">
                        <b>{d.name} · {d.city}</b>
                        <small>{d.same_type ? 'Golongan sama' : 'Kompatibel'} · {d.phone_masked}</small>
                      </div>
                      <span className={`bd ${d.ready ? 'ok' : 'tj'}`}>
                        {d.ready ? 'Siap donor' : 'Belum boleh'}
                      </span>
                      {d.ready ? (
                        <a className="wa" href={d.wa_url} target="_blank" rel="noopener noreferrer">
                          Hubungi WhatsApp
                        </a>
                      ) : (
                        <span className="nx">Bisa donor {fmtDate(d.eligible_date)}</span>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
