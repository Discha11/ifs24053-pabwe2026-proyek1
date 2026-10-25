import { useState } from 'react';
import { useCities, useDonorMatch } from '../hooks/index.js';
import { GOL, fg, fmtDate } from '../lib.js';

export default function CompatibilityCalculator({
  heading = 'Cek Kompatibilitas Golongan Darah',
  subheading = 'Pilih golongan darah pasien untuk melihat siapa saja pendonor kompatibel yang sudah melewati jeda 75 hari donor terakhir.',
  initialGol = 'A+',
  initialCity = '',
  className = '',
}) {
  const [selGol, setSelGol] = useState(initialGol);
  const [selCity, setSelCity] = useState(initialCity);
  const { cities } = useCities();
  const { data, loading, error } = useDonorMatch(selGol, selCity);

  const results = data ? (Array.isArray(data) ? data : data.results || []) : [];
  const total = data ? (typeof data.total === 'number' ? data.total : results.length) : 0;
  const readyCount = data
    ? typeof data.ready_count === 'number'
      ? data.ready_count
      : results.filter((d) => d.ready).length
    : 0;
  const compatibleTypes = data?.compatible_types || [];

  return (
    <div className={`calculator-view-box ${className}`}>
      <div className="calc-header">
        <h2>{heading}</h2>
        {subheading && <p className="sub">{subheading}</p>}
      </div>

      <div className="ctl" style={{ marginTop: 20 }}>
        <div className="chips" role="group" aria-label="Golongan darah pasien">
          {GOL.map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={g === selGol}
              onClick={() => setSelGol(g)}
            >
              {fg(g)}
            </button>
          ))}
        </div>
        <select
          aria-label="Pilih Kota"
          value={selCity}
          onChange={(e) => setSelCity(e.target.value)}
        >
          <option value="">Semua kota kawasan Toba</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="msg err" role="alert" style={{ marginTop: 16 }}>
          Tidak bisa terhubung ke server back-end. Pastikan server aktif lalu muat ulang.
        </p>
      )}

      {loading && !data && (
        <p className="nx" style={{ marginTop: 20 }}>
          Mencari pendonor kompatibel...
        </p>
      )}

      {data && !error && (
        <div className="calc-results-wrap">
          <p className="ringkas" aria-live="polite">
            Pasien <strong>{fg(selGol)}</strong>
            {selCity ? ` di ${selCity}` : ''}:{' '}
            {compatibleTypes.length > 0 && (
              <>
                menerima donor dari{' '}
                <span className="grad-compat">
                  {compatibleTypes.map(fg).join(', ')}
                </span>
                .{' '}
              </>
            )}
            Ditemukan <strong>{total}</strong> pendonor ({readyCount} siap hari ini).
          </p>

          {total === 0 && (
            <p className="nx">Belum ada pendonor yang cocok di kota ini.</p>
          )}

          <div className="donor-grid-compact">
            {results.map((d) => (
              <article className="it" key={d.id}>
                <div className={`gol ${d.ready ? '' : 'off'}`}>{fg(d.blood_type)}</div>
                <div className="t">
                  <b>
                    {d.name} · {d.city}
                  </b>
                  <small>
                    {d.same_type ? 'Golongan sama' : 'Kompatibel'} · {d.phone_masked}
                  </small>
                </div>
                <span className={`bd ${d.ready ? 'ok' : 'tj'}`}>
                  {d.ready ? 'Siap donor' : 'Belum boleh'}
                </span>
                {d.ready ? (
                  <a
                    className="wa"
                    href={d.wa_url || `https://wa.me/${d.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
  );
}
