import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

/**
 * Komponen Modal Dialog Konfirmasi Pengganti window.confirm bawaan browser.
 * Aksesibel dengan dukungan WAI-ARIA Dialog (Modal), Focus Trap, tombol Escape, dan styling CSS class konsisten.
 *
 * @param {{
 *   isOpen: boolean,
 *   title?: string,
 *   message: string,
 *   confirmText?: string,
 *   cancelText?: string,
 *   isDanger?: boolean,
 *   onConfirm: () => void,
 *   onCancel: () => void
 * }} props
 */
export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi Aksi',
  message,
  confirmText = 'Lanjutkan',
  cancelText = 'Batal',
  isDanger = false,
  onConfirm,
  onCancel,
}) {
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  // Focus trap dan keyboard listener (Escape & Tab)
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement;

    const focusTimeout = setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = [cancelButtonRef.current, confirmButtonRef.current].filter(Boolean);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedElementRef.current?.focus) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-card">
        <h3 id="confirm-modal-title" className="modal-title">
          {title}
        </h3>
        <p id="confirm-modal-description" className="modal-description">
          {message}
        </p>

        <div className="modal-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="sbtn modal-btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className={`sbtn modal-btn-confirm ${isDanger ? 'danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isDanger: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};


