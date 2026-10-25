import Match from '../components/Match.jsx';

export default function Cari() {
  return (
    <main id="main-content" role="main">
      <div className="wrap pg" style={{ paddingBottom: 0 }}>
        <h1 className="ph">Cari Pendonor Darah</h1>
        <p className="sub">Temukan pendonor yang kompatibel dan siap donor di kawasan Danau Toba.</p>
      </div>
      <Match heading="Cocokkan Golongan Darah" />
      <div style={{ height: 56 }} />
    </main>
  );
}
