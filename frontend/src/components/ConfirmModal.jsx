import { useEffect, useRef } from 'react';

/**
 * Komponen Modal Dialog Konfirmasi Pengganti window.confirm bawaan browser.
 * Aksesibel dengan dukungan WAI-ARIA Dialog (Modal), Focus Trap, dan tombol Escape.
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
  const modalCardRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  // Focus trap dan keyboard listener (Escape & Tab)
  useEffect(() => {
    if (!isOpen) return;

    // Simpan elemen yang sebelumnya aktif untuk dikembalikan saat modal ditutup
    previouslyFocusedElementRef.current = document.activeElement;

    // Fokuskan tombol batal terlebih dahulu untuk keamanan aksi destruktif
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
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 9999,
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={modalCardRef}
        className="modal-card"
        style={{
          background: 'var(--surface, #FFFFFF)',
          color: 'var(--text, #14181F)',
          borderRadius: 20,
          padding: 24,
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--line, #E2E8F0)',
        }}
      >
        <h3
          id="confirm-modal-title"
          style={{
            margin: '0 0 8px',
            fontSize: '1.2rem',
            fontFamily: 'var(--head, Outfit, sans-serif)',
            fontWeight: 800,
          }}
        >
          {title}
        </h3>
        <p
          id="confirm-modal-description"
          style={{
            margin: '0 0 24px',
            fontSize: 14,
            color: 'var(--muted, #64748B)',
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            ref={cancelButtonRef}
            type="button"
            className="sbtn"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className={`sbtn ${isDanger ? 'danger' : ''}`}
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 700,
              background: isDanger ? 'var(--red, #D42B2B)' : '#059669',
              color: '#FFFFFF',
              border: 'none',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
