import { useState } from 'react';
import { useCities, useDonorMatch } from '../hooks/index.js';
import { BLOOD_TYPES, formatBloodType, formatDate } from '../lib.js';

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

      <div className="ctl mt-20">
        <div className="chips" role="group" aria-label="Golongan darah pasien">
          {BLOOD_TYPES.map((bloodGroup) => (
            <button
              key={bloodGroup}
              type="button"
              aria-pressed={bloodGroup === selGol}
              onClick={() => setSelGol(bloodGroup)}
            >
              {formatBloodType(bloodGroup)}
            </button>
          ))}
        </div>
        <select
          aria-label="Pilih Kota"
          value={selCity}
          onChange={(e) => setSelCity(e.target.value)}
        >
          <option value="">Semua kota kawasan Toba</option>
          {cities.map((cityName) => (
            <option key={cityName} value={cityName}>
              {cityName}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="msg err mt-16" role="alert">
          Tidak bisa terhubung ke server back-end. Pastikan server aktif lalu muat ulang.
        </p>
      )}

      {loading && !data && (
        <p className="nx mt-20">
          Mencari pendonor kompatibel...
        </p>
      )}

      {data && !error && (
        <div className="calc-results-wrap">
          <p className="ringkas" aria-live="polite">
            Pasien <strong>{formatBloodType(selGol)}</strong>
            {selCity ? ` di ${selCity}` : ''}:{' '}
            {compatibleTypes.length > 0 && (
              <>
                menerima donor dari{' '}
                <span className="grad-compat">
                  {compatibleTypes.map(formatBloodType).join(', ')}
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
            {results.map((donor) => (
              <article className="it" key={donor.id}>
                <div className={`gol ${donor.ready ? '' : 'off'}`}>{formatBloodType(donor.blood_type)}</div>
                <div className="t">
                  <b>
                    {donor.name} · {donor.city}
                  </b>
                  <small>
                    {donor.same_type ? 'Golongan sama' : 'Kompatibel'} · {donor.phone_masked}
                  </small>
                </div>
                <span className={`bd ${donor.ready ? 'ok' : 'tj'}`}>
                  {donor.ready ? 'Siap donor' : 'Belum boleh'}
                </span>
                {donor.ready ? (
                  <a
                    className="wa"
                    href={donor.wa_url || `https://wa.me/${donor.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hubungi WhatsApp
                  </a>
                ) : (
                  <span className="nx">Bisa donor {formatDate(donor.eligible_date)}</span>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
