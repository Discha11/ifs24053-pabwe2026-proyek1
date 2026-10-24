import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import RequestList from '../components/RequestList.jsx';
import { GOL, fg, fmtDate, useRequests } from '../lib.js';

function DonorForm({ cities, onSaved }) {
  const empty = { name: '', blood_type: 'A+', city: '', phone: '', last_donated: '' };
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState([]);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  useEffect(() => { if (cities[0]) setF((x) => ({ ...x, city: x.city || cities[0] })); }, [cities]);

  async function submit(e) {
    e.preventDefault();
    setErrors([]);
    try {
      await api.createDonor({ ...f, last_donated: f.last_donated || null });
      setF({ ...empty, city: cities[0] });
      onSaved();
    } catch (err) { setErrors(err.details.length ? err.details : [err.message]); }
  }

  return (
    <form className="fm" onSubmit={submit}>
      <h3>Daftarkan pendonor</h3>
      {errors.length > 0 && <ul className="errs" role="alert">{errors.map((m) => <li key={m}>{m}</li>)}</ul>}
      <div className="two">
        <label>Nama<input value={f.name} onChange={set('name')} maxLength={80} required /></label>
        <label>Golongan darah<select value={f.blood_type} onChange={set('blood_type')}>{GOL.map((g) => <option key={g} value={g}>{fg(g)}</option>)}</select></label>
      </div>
      <div className="two">
        <label>Kota<select value={f.city} onChange={set('city')}>{cities.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Nomor WhatsApp<input type="tel" inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="081234567890" required /></label>
      </div>
      <label>Terakhir donor (kosongkan jika belum pernah)<input type="date" max={new Date().toISOString().slice(0, 10)} value={f.last_donated} onChange={set('last_donated')} /></label>
      <button className="go2">Daftarkan pendonor</button>
    </form>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState(null);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(false);
  const { requests, error: reqError, reload } = useRequests();

  const load = useCallback(() => {
    Promise.all([api.stats(), api.donors()]).then(([s, d]) => { setStats(s); setDonors(d); setError(false); }).catch(() => setError(true));
  }, []);
  useEffect(() => { load(); api.cities().then(setCities).catch(() => {}); }, [load]);

  const refresh = () => { load(); reload(); };
  const donated = async (d) => { await api.markDonated(d.id); load(); };
  const delDonor = async (d) => { if (window.confirm(`Hapus pendonor ${d.name}?`)) { await api.deleteDonor(d.id); load(); } };
  const closeReq = async (r) => { await api.closeRequest(r.id); refresh(); };
  const delReq = async (r) => { if (window.confirm('Hapus permintaan ini?')) { await api.deleteRequest(r.id); refresh(); } };

  return (
    <main><div className="wrap pg">
      <h1 className="ph">Kelola Data (Panel Admin)</h1>
      <p className="sub" style={{ marginBottom: 20 }}>Panel administrasi untuk menutup permintaan selesai, menghapus data, dan mencatat riwayat donor warga.</p>
      {error && <p className="msg err" role="alert">Tidak bisa terhubung ke server. Pastikan back-end berjalan, lalu muat ulang halaman.</p>}
      {stats && (
        <div className="stats dstats">
          <div><b>{stats.donors}</b><span>Pendonor terdaftar</span></div>
          <div><b>{stats.ready_today}</b><span>Siap donor hari ini</span></div>
          <div><b>{stats.open_requests}</b><span>Permintaan terbuka</span></div>
          <div><b>{stats.urgent_requests}</b><span>Darurat</span></div>
        </div>
      )}

      <h2 className="sec">Permintaan terbuka</h2>
      <RequestList requests={requests} error={reqError} onClose={closeReq} onDelete={delReq} />

      <h2 className="sec">Pendonor</h2>
      {donors && (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Nama</th><th>Gol.</th><th>Kota</th><th>Kontak</th><th>Status</th><th><span className="sr">Aksi</span></th></tr></thead>
            <tbody>
              {donors.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td><td>{fg(d.blood_type)}</td><td>{d.city}</td><td>{d.phone_masked}</td>
                  <td><span className={`bd ${d.ready ? 'ok' : 'tj'}`}>{d.ready ? 'Siap donor' : `Boleh ${fmtDate(d.eligible_date)}`}</span></td>
                  <td className="acts">
                    <button className="sbtn" onClick={() => donated(d)}>Catat donor hari ini</button>
                    <button className="sbtn danger" onClick={() => delDonor(d)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <DonorForm cities={cities} onSaved={load} />
    </div></main>
  );
}
