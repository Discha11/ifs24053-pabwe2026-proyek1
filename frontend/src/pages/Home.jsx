import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Svg from '../components/Svg.jsx';
import Ticker from '../components/Ticker.jsx';
import { iconHeart, iconSearch, mascot, iconDrop, iconCheck } from '../assets/svg.js';
import { fg, useRequests } from '../lib.js';

const ActiveRequests = lazy(() => import('../components/ActiveRequests.jsx'));

export default function Home() {
  const { requests, error } = useRequests();
  const [stats, setStats] = useState(null);
  useEffect(() => { api.stats().then(setStats).catch(() => {}); }, []);
  const urgent = requests?.find((r) => r.urgency === 'darurat');

  return (
    <main id="main-content" role="main">
      <div className="wrap hero">
        <div>
          <h1>Butuh darah? <span className="grad">Cari pendonor terdekat.</span></h1>
          <p className="sub">SADA mempertemukan pendonor dan keluarga pasien di kawasan Danau Toba. Pilih golongan darah dan kota, lalu hubungi pendonor langsung lewat WhatsApp.</p>
          <div className="btns">
            <Link className="b1" to="/cari"><Svg markup={iconHeart} />Cari Pendonor</Link>
            <Link className="b2" to="/permintaan"><Svg markup={iconSearch} />Lihat Permintaan Darah</Link>
          </div>
          <div className="stats">
            <div><b>{stats ? stats.donors : '–'}</b><span>Pendonor terdaftar</span></div>
            <div><b>{stats ? stats.ready_today : '–'}</b><span>Siap donor hari ini</span></div>
            <div><b>{stats ? stats.cities : '–'}</b><span>Kota terjangkau</span></div>
          </div>
          <p className="note">Semua data di halaman ini adalah data contoh.</p>
        </div>
        <div className="stage">
          <div className="m" aria-hidden="true"><Svg markup={mascot} /></div>
          <div className="fc a"><span className="ic" aria-hidden="true"><Svg markup={iconDrop} /></span><div><small>Kebutuhan darurat</small><b>{urgent ? `Butuh donor ${fg(urgent.blood_type)}` : 'Tidak ada yang darurat'}</b></div></div>
          <div className="fc b"><span className="ic" aria-hidden="true"><Svg markup={iconCheck} /></span><div><small>Siap donor</small><b>{stats ? `${stats.ready_today} pendonor hari ini` : '…'}</b></div></div>
        </div>
      </div>
      <div className="ulos" aria-hidden="true" />
      <Ticker requests={requests} />
      <Suspense fallback={<div className="wrap pg" style={{ textAlign: 'center', padding: '32px 0' }}><p className="nx">Memuat daftar permintaan darah...</p></div>}>
        <ActiveRequests requests={requests} error={error} />
      </Suspense>
    </main>
  );
}
