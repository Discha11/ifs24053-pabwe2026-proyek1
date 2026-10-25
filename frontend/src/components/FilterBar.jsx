import { BLOOD_TYPES, formatBloodType } from '../lib.js';

export default function FilterBar({
  search,
  onSearchChange,
  selectedGol,
  onGolChange,
  selectedCity,
  onCityChange,
  selectedUrgency,
  onUrgencyChange,
  priorityUrgency,
  onPriorityChange,
  cities = [],
  onReset,
  totalFiltered = 0,
  totalRequests = 0,
}) {
  return (
    <div className="filter-toolbar">
      <div className="filter-row">
        <div className="search-box">
          <input
            id="search-requests"
            name="search"
            type="text"
            aria-label="Cari rumah sakit, kota, atau golongan darah"
            placeholder="Cari rumah sakit, kota, atau golongan darah..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search"
              aria-label="Hapus pencarian"
              onClick={() => onSearchChange('')}
            >
              ×
            </button>
          )}
        </div>

        <select
          value={selectedGol}
          onChange={(e) => onGolChange(e.target.value)}
          aria-label="Filter Golongan Darah"
        >
          <option value="">Semua Gol. Darah</option>
          {BLOOD_TYPES.map((bloodGroup) => (
            <option key={bloodGroup} value={bloodGroup}>
              {formatBloodType(bloodGroup)}
            </option>
          ))}
        </select>

        <select
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          aria-label="Filter Kota/Kab"
        >
          <option value="">Semua Kota/Kab</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={selectedUrgency}
          onChange={(e) => onUrgencyChange(e.target.value)}
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
          onClick={onReset}
          aria-label="Reset Filter"
        >
          ↻
        </button>
      </div>

      <div className="filter-meta-row">
        <div className="active-meta">
          <span className="meta-badge-dot" />
          <span className="meta-text">
            <strong>Tampilan Aktif:</strong> Permintaan Darah • Menampilkan {totalFiltered} dari {totalRequests} permintaan
          </span>
        </div>
        <label className="urgency-checkbox-label">
          <input
            type="checkbox"
            checked={priorityUrgency}
            onChange={(e) => onPriorityChange(e.target.checked)}
          />
          <span>Prioritaskan Urgensi (Darurat &gt; Segera &gt; Terjadwal)</span>
        </label>
      </div>
    </div>
  );
}
