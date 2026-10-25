import { URGENCY_CONFIG, formatBloodType, formatRequestTime } from '../lib.js';

/**
 * Komponen ticker teks berjalan untuk menampilkan highlight permintaan darah terbaru.
 * @param {{ requests: Array<object>|null }} props
 */
export default function Ticker({ requests }) {
  if (!requests || requests.length === 0) return null;

  // Menggandakan item agar animasi infinite scroll berjalan tanpa jeda
  const displayItems = [...requests, ...requests];

  return (
    <div className="tick" aria-label="Permintaan darah terbaru">
      <div className="track">
        {displayItems.map((requestItem, index) => {
          const itemKey = `ticker-${index < requests.length ? 'orig' : 'dup'}-${requestItem?.id || requestItem?.hospital || index}`;
          return (
            <span key={itemKey}>
              <em>{URGENCY_CONFIG[requestItem?.urgency]?.[0] || 'Permintaan'}</em>
              Butuh {formatBloodType(requestItem?.blood_type || 'A+')} · {requestItem?.hospital || 'RS Terdekat'} · {formatRequestTime(requestItem)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
