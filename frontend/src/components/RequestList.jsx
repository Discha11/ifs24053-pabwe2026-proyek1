import React from 'react';
import { URGENCY, fg, reqTime } from '../lib.js';

/**
 * Komponen untuk menampilkan daftar ringkas permintaan darah pada panel admin.
 * @param {{
 *   requests: Array<object> | null,
 *   error: boolean,
 *   onClose?: (request: object) => void,
 *   onDelete?: (request: object) => void
 * }} props
 */
export default function RequestList({ requests, error, onClose, onDelete }) {
  if (error) {
    return (
      <p className="msg err" role="alert">
        Tidak bisa terhubung ke server. Pastikan back-end berjalan, lalu muat ulang halaman.
      </p>
    );
  }

  if (!requests) {
    return <p className="nx">Memuat daftar permintaan darah…</p>;
  }

  if (requests.length === 0) {
    return (
      <p className="nx">
        Belum ada permintaan darah yang dibuka. Buat permintaan baru lewat tombol di atas.
      </p>
    );
  }

  return (
    <div className="request-items-list">
      {requests.map((requestItem) => {
        const [urgencyLabel, urgencyClass] = URGENCY[requestItem.urgency] || ['Umum', 'tj'];

        return (
          <article className="it" key={requestItem.id}>
            <div className="gol">{fg(requestItem.blood_type)}</div>
            <div className="t">
              <b>
                {requestItem.hospital} · {requestItem.units} kantong
              </b>
              <small>
                {requestItem.city} · {reqTime(requestItem)}
              </small>
            </div>
            <span className={`bd ${urgencyClass}`}>{urgencyLabel}</span>
            <a
              className="wa"
              href={requestItem.wa_url || `https://wa.me/${requestItem.contact_phone}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hubungi lewat WhatsApp
            </a>
            {onClose && (
              <button
                type="button"
                className="sbtn"
                onClick={() => onClose(requestItem)}
              >
                Tutup
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="sbtn danger"
                onClick={() => onDelete(requestItem)}
              >
                Hapus
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
