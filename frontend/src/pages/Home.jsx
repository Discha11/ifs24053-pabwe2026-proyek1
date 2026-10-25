import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import Ticker from '../components/Ticker.jsx';
import { IconHeart, IconSearch, Mascot, IconDrop, IconCheck } from '../components/Icons.jsx';
import { useStats, useRequests } from '../hooks/index.js';
import { formatBloodType } from '../lib.js';

const ActiveRequests = lazy(() => import('../components/ActiveRequests.jsx'));

export default function Home() {
  const { requests, error } = useRequests();
  const { stats } = useStats();
  const urgent = requests?.find((r) => r.urgency === 'darurat');

  return (
    <main id="main-content" role="main">
      <div className="wrap hero">
        <div>
          <h1>Butuh darah? <span className="grad">Cari pendonor terdekat.</span></h1>
          <p className="sub">SADA mempertemukan pendonor dan keluarga pasien di kawasan Danau Toba. Pilih golongan darah dan kota, lalu hubungi pendonor langsung lewat WhatsApp.</p>
          <div className="btns">
            <Link className="b1" to="/cari"><IconHeart />Cari Pendonor</Link>
            <Link className="b2" to="/permintaan"><IconSearch />Lihat Permintaan Darah</Link>
          </div>
          <div className="stats">
            <div><b>{stats ? stats.donors : '–'}</b><span>Pendonor terdaftar</span></div>
            <div><b>{stats ? stats.ready_today : '–'}</b><span>Siap donor hari ini</span></div>
            <div><b>{stats ? stats.cities : '–'}</b><span>Kota terjangkau</span></div>
          </div>
          <p className="note">Semua data di halaman ini adalah data contoh.</p>
        </div>
        <div className="stage">
          <div className="m" aria-hidden="true"><Mascot /></div>
          <div className="fc a"><span className="ic" aria-hidden="true"><IconDrop /></span><div><small>Kebutuhan darurat</small><b>{urgent ? `Butuh donor ${formatBloodType(urgent.blood_type)}` : 'Tidak ada yang darurat'}</b></div></div>
          <div className="fc b"><span className="ic" aria-hidden="true"><IconCheck /></span><div><small>Siap donor</small><b>{stats ? `${stats.ready_today} pendonor hari ini` : '…'}</b></div></div>
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
