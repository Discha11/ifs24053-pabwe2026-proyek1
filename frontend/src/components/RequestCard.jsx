import PropTypes from 'prop-types';
import { formatBloodType, formatDate } from '../lib.js';

export default function RequestCard({
  request: r = {},
  isExpanded = false,
  onToggleMatch = () => {},
  matchInfo = null,
  matchLoading = false,
}) {
  const getRequestNote = (req) => {
    if (req?.urgency === 'darurat') {
      return `"Pendarahan akut pasca tindakan darurat di ${req?.hospital || 'rumah sakit'}, butuh suplai kantong segera untuk penanganan intensif."`;
    }
    if (req?.urgency === 'segera') {
      return `"Persiapan tindakan transfusi cito di ruang rawat ${req?.hospital || 'rumah sakit'}, ${req?.city || 'Danau Toba'} dalam kurun waktu 24 jam."`;
    }
    return `"Kebutuhan terjadwal untuk prosedur medis dan cuci darah/operasi elektif di ${req?.hospital || 'rumah sakit'}."`;
  };

  return (
    <article className={`req-card ${r?.urgency === 'darurat' ? 'border-urgent' : ''}`}>
      {/* Top Row: Blood Badge + Hospital Info + Urgency Pill */}
      <div className="card-top-row">
        <div className="blood-type-box">
          <span className="blood-text">{formatBloodType(r?.blood_type)}</span>
          <span className="blood-sub">RBC</span>
        </div>

        <div className="card-hospital-meta">
          <h3 className="hospital-name">{r?.hospital}</h3>
          <div className="hospital-loc">
            <span className="pin-icon" aria-hidden="true">📍</span>
            <span>{r?.hospital}, {r?.city}</span>
          </div>
        </div>

        <div className="card-urgency-wrapper">
          {r?.urgency === 'darurat' && (
            <span className="urgency-pill pill-darurat">
              <span className="pulse-dot red" />
              DARURAT (&lt; 6 JAM)
            </span>
          )}
          {r?.urgency === 'segera' && (
            <span className="urgency-pill pill-segera">
              <span className="pulse-dot amber" />
              SEGERA (&lt; 24 JAM)
            </span>
          )}
          {r?.urgency === 'terjadwal' && (
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
          <strong className="spec-val">{r?.units ?? 1} Kantong Darah</strong>
        </div>
        <div className="spec-item">
          <span className="spec-label">Batas Waktu:</span>
          <strong className="spec-val">
            {r?.needed_date ? formatDate(r.needed_date) : 'Hari Ini / Cito'}
          </strong>
        </div>
      </div>

      {/* Clinic Note Quote */}
      <p className="card-quote">{getRequestNote(r)}</p>

      {/* Action Buttons */}
      <div className="card-actions-row">
        <button
          type="button"
          className={`btn-match-action ${isExpanded ? 'active' : ''}`}
          onClick={() => onToggleMatch(r)}
        >
          <span className="match-ic">🔍</span>
          <span>
            {isExpanded
              ? 'Tutup Daftar Kompatibel'
              : matchInfo
              ? `Donor Kompatibel (${matchInfo?.ready_count ?? 0} Siap)`
              : 'Cari Donor Kompatibel'}
          </span>
        </button>

        <a
          className="btn-wa-contact"
          href={r?.wa_url || `https://wa.me/${r?.contact_phone}`}
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
              Pendonor Kompatibel untuk <span>{formatBloodType(r?.blood_type)}</span> di <span>{r?.city}</span>
            </h4>
            <span className="compat-rule">
              Menerima: {matchInfo?.compatible_types ? matchInfo.compatible_types.map(formatBloodType).join(', ') : '...'}
            </span>
          </div>

          {matchLoading && !matchInfo && (
            <p className="drawer-status">Mencari pendonor yang siap...</p>
          )}

          {matchInfo && (matchInfo?.results?.length ?? 0) === 0 && (
            <p className="drawer-empty">
              Belum ada pendonor kompatibel terdaftar di {r?.city}. Silakan bagikan info ini ke komunitas.
            </p>
          )}

          {matchInfo && (matchInfo?.results?.length ?? 0) > 0 && (
            <div className="drawer-donor-list">
              {matchInfo.results.map((donor) => (
                <div key={donor?.id} className="drawer-donor-item">
                  <span className={`mini-blood-pill ${donor?.ready ? 'ready' : 'not-ready'}`}>
                    {formatBloodType(donor?.blood_type)}
                  </span>
                  <div className="mini-donor-info">
                    <strong>{donor?.name}</strong>
                    <small>
                      {donor?.same_type ? 'Golongan sama' : 'Kompatibel'} • {donor?.city}
                    </small>
                  </div>
                  <div className="mini-donor-status">
                    {donor?.ready ? (
                      <a
                        href={donor?.wa_url || `https://wa.me/${donor?.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mini-wa-btn"
                      >
                        Chat WA
                      </a>
                    ) : (
                      <span className="wait-badge">
                        Siap {donor?.days_until_eligible ?? 0} hr lg
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
}

RequestCard.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hospital: PropTypes.string,
    city: PropTypes.string,
    blood_type: PropTypes.string,
    units: PropTypes.number,
    urgency: PropTypes.string,
    needed_date: PropTypes.string,
    contact_phone: PropTypes.string,
    wa_url: PropTypes.string,
  }),
  isExpanded: PropTypes.bool,
  onToggleMatch: PropTypes.func,
  matchInfo: PropTypes.shape({
    compatible_types: PropTypes.arrayOf(PropTypes.string),
    ready_count: PropTypes.number,
    results: PropTypes.arrayOf(PropTypes.object),
  }),
  matchLoading: PropTypes.bool,
};


