import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { GOL, fg } from '../lib.js';

const today = () => new Date().toISOString().slice(0, 10);

export default function Buat() {
  const nav = useNavigate();
  const [cities, setCities] = useState([]);
  const [f, setF] = useState({ blood_type: 'A+', hospital: '', city: '', units: 1, urgency: 'segera', needed_date: '', contact_phone: '' });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.cities().then((c) => { setCities(c); setF((x) => ({ ...x, city: c[0] })); }).catch(() => setErrors(['Tidak bisa terhubung ke server.'])); }, []);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErrors([]);
    try {
      await api.createRequest({ ...f, units: Number(f.units), needed_date: f.needed_date || null });
      nav('/permintaan', { state: { created: true } });
    } catch (err) {
      setErrors(err.details.length ? err.details : [err.message]);
    } finally { setBusy(false); }
  }

  return (
    <main id="main-content" role="main"><div className="wrap pg">
      <h1 className="ph">Buat permintaan darah</h1>
      <p className="sub">Isi data pasien dan kontak WhatsApp yang bisa dihubungi pendonor.</p>
      <form className="fm" onSubmit={submit}>
        {errors.length > 0 && <ul className="errs" role="alert">{errors.map((m) => <li key={m}>{m}</li>)}</ul>}
        <div className="two">
          <label>Golongan darah
            <select value={f.blood_type} onChange={set('blood_type')}>{GOL.map((g) => <option key={g} value={g}>{fg(g)}</option>)}</select>
          </label>
          <label>Jumlah kantong
            <input type="number" min="1" max="20" value={f.units} onChange={set('units')} required />
          </label>
        </div>
        <label>Rumah sakit atau puskesmas
          <input value={f.hospital} onChange={set('hospital')} maxLength={100} placeholder="Mis. RS Balige" required />
        </label>
        <div className="two">
          <label>Kota
            <select value={f.city} onChange={set('city')}>{cities.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label>Tingkat kebutuhan
            <select value={f.urgency} onChange={set('urgency')}>
              <option value="darurat">Darurat</option><option value="segera">Segera</option><option value="terjadwal">Terjadwal</option>
            </select>
          </label>
        </div>
        {f.urgency === 'terjadwal' && (
          <label>Tanggal dibutuhkan
            <input type="date" min={today()} value={f.needed_date} onChange={set('needed_date')} required />
          </label>
        )}
        <label>Nomor WhatsApp yang bisa dihubungi
          <input type="tel" inputMode="tel" value={f.contact_phone} onChange={set('contact_phone')} placeholder="081234567890" required />
        </label>
        <button className="go2" disabled={busy}>{busy ? 'Menyimpan…' : 'Buat permintaan'}</button>
      </form>
    </div></main>
  );
}
