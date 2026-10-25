import Match from '../components/Match.jsx';

export default function Search() {
  return (
    <main id="main-content" role="main">
      <div className="wrap pg pb-0">
        <h1 className="ph">Cari Pendonor Darah</h1>
        <p className="sub">Temukan pendonor yang kompatibel dan siap donor di kawasan Danau Toba.</p>
      </div>
      <Match heading="Cocokkan Golongan Darah" />
      <div className="spacer-56" />
    </main>
  );
}
