import { URGENCY, fg, reqTime } from '../lib.js';

export default function RequestList({ requests, error, onClose, onDelete }) {
  if (error) return <p className="msg err" role="alert">Tidak bisa terhubung ke server. Pastikan back-end berjalan, lalu muat ulang halaman.</p>;
  if (!requests) return <p className="nx">Memuat permintaan…</p>;
  if (requests.length === 0) return <p className="nx">Belum ada permintaan darah yang dibuka. Buat permintaan baru lewat tombol di atas.</p>;
  return requests.map((r) => {
    const [label, cls] = URGENCY[r.urgency];
    return (
      <article className="it" key={r.id}>
        <div className="gol">{fg(r.blood_type)}</div>
        <div className="t"><b>{r.hospital} · {r.units} kantong</b><small>{r.city} · {reqTime(r)}</small></div>
        <span className={`bd ${cls}`}>{label}</span>
        <a className="wa" href={r.wa_url} target="_blank" rel="noopener noreferrer">Hubungi lewat WhatsApp</a>
        {onClose && <button className="sbtn" onClick={() => onClose(r)}>Tutup</button>}
        {onDelete && <button className="sbtn danger" onClick={() => onDelete(r)}>Hapus</button>}
      </article>
    );
  });
}
