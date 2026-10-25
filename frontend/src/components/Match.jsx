import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { GOL, fg, fmtDate } from '../lib.js';

export default function Match({ heading = 'Cocokkan pendonor dengan permintaan' }) {
  const [sel, setSel] = useState('A+');
  const [kota, setKota] = useState('');
  const [cities, setCities] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => { api.cities().then(setCities).catch(() => {}); }, []);
  useEffect(() => {
    let live = true;
    api.match(sel, kota).then((d) => { if (live) { setData(d); setError(false); } }).catch(() => live && setError(true));
    return () => { live = false; };
  }, [sel, kota]);

  return (
    <section className="match" id="cocok"><div className="wrap">
      <h2>{heading}</h2>
      <p className="sub" style={{ marginBottom: 20 }}>Pilih golongan darah pasien. SADA menampilkan pendonor yang kompatibel, bukan hanya yang golongannya sama, lalu menandai siapa yang sudah boleh donor lagi.</p>
      <div className="ctl">
        <div className="chips" role="group" aria-label="Golongan darah pasien">
          {GOL.map((g) => <button key={g} type="button" aria-pressed={g === sel} onClick={() => setSel(g)}>{fg(g)}</button>)}
        </div>
        <select aria-label="Kota" value={kota} onChange={(e) => setKota(e.target.value)}>
          <option value="">Semua kota</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {error && <p className="msg err" role="alert">Tidak bisa terhubung ke server. Pastikan back-end berjalan, lalu muat ulang halaman.</p>}
      {data && !error && (() => {
        const results = Array.isArray(data) ? data : (data.results || []);
        const total = typeof data.total === 'number' ? data.total : results.length;
        const ready_count = typeof data.ready_count === 'number' ? data.ready_count : results.filter(d => d.ready).length;
        return (
          <>
            <p className="ringkas" aria-live="polite">
              Permintaan {fg(sel)}{kota ? ` di ${kota}` : ''}: {total} pendonor cocok, {ready_count} siap donor.
            </p>
            {total === 0 && <p className="nx">Belum ada pendonor yang cocok di kota ini.</p>}
            {results.map((d) => (
              <article className="it" key={d.id}>
                <div className={`gol${d.ready ? '' : ' off'}`}>{fg(d.blood_type)}</div>
                <div className="t"><b>{d.name} · {d.city}</b><small>{d.same_type ? 'Golongan sama' : 'Kompatibel'} · {d.phone_masked}</small></div>
                <span className={`bd ${d.ready ? 'ok' : 'tj'}`}>{d.ready ? 'Siap donor' : 'Belum boleh'}</span>
                {d.ready
                  ? <a className="wa" href={d.wa_url || `https://wa.me/${d.phone}`} target="_blank" rel="noopener noreferrer">Hubungi lewat WhatsApp</a>
                  : <span className="nx">Bisa donor lagi {fmtDate(d.eligible_date)}</span>}
              </article>
            ))}
          </>
        );
      })()}
    </div></section>
  );
}
