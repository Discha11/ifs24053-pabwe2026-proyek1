import PropTypes from 'prop-types';
import { URGENCY_CONFIG, formatBloodType, formatRequestTime } from '../lib.js';

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
        const [urgencyLabel, urgencyClass] = URGENCY_CONFIG[requestItem.urgency] || ['Umum', 'tj'];

        return (
          <article className="it" key={requestItem.id}>
            <div className="gol">{formatBloodType(requestItem.blood_type)}</div>
            <div className="t">
              <b>
                {requestItem.hospital} · {requestItem.units} kantong
              </b>
              <small>
                {requestItem.city} · {formatRequestTime(requestItem)}
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

RequestList.propTypes = {
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      blood_type: PropTypes.string.isRequired,
      hospital: PropTypes.string.isRequired,
      units: PropTypes.number.isRequired,
      city: PropTypes.string.isRequired,
      urgency: PropTypes.string.isRequired,
      contact_phone: PropTypes.string,
      wa_url: PropTypes.string,
    })
  ),
  error: PropTypes.bool,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
};

RequestList.defaultProps = {
  requests: null,
  error: false,
  onClose: undefined,
  onDelete: undefined,
};

