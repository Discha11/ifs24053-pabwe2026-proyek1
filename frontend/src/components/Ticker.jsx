import { URGENCY, fg, reqTime } from '../lib.js';

export default function Ticker({ requests }) {
  if (!requests || requests.length === 0) return null;
  const items = [...requests, ...requests]; // digandakan agar animasi berulang mulus
  return (
    <div className="tick" aria-label="Permintaan darah terbaru">
      <div className="track">
        {items.map((r, i) => (
          <span key={i}><em>{URGENCY[r.urgency][0]}</em>Butuh {fg(r.blood_type)} · {r.hospital} · {reqTime(r)}</span>
        ))}
      </div>
    </div>
  );
}
