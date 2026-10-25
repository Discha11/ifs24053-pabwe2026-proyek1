import React from 'react';
import { URGENCY, fg, reqTime } from '../lib.js';

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
        {displayItems.map((requestItem, index) => (
          <span key={index}>
            <em>{URGENCY[requestItem?.urgency]?.[0] || 'Permintaan'}</em>
            Butuh {fg(requestItem?.blood_type || 'A+')} · {requestItem?.hospital || 'RS Terdekat'} · {reqTime(requestItem)}
          </span>
        ))}
      </div>
    </div>
  );
}
