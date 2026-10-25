import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from './ConfirmModal.jsx';

describe('ConfirmModal Component Test Suite', () => {
  it('tidak merender apapun saat isOpen bernilai false', () => {
    const { container } = render(
      <ConfirmModal
        isOpen={false}
        message="Hapus data?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('merender dialog modal dengan teks dan atribut aksesibilitas WAI-ARIA yang sesuai saat isOpen true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus data pendonor ini?"
        confirmText="Ya, Hapus"
        cancelText="Batalkan"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText('Konfirmasi Hapus')).toBeDefined();
    expect(screen.getByText('Apakah Anda yakin ingin menghapus data pendonor ini?')).toBeDefined();
    expect(screen.getByText('Ya, Hapus')).toBeDefined();
    expect(screen.getByText('Batalkan')).toBeDefined();
  });

  it('memanggil handler onConfirm ketika tombol konfirmasi ditekan', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        message="Lanjutkan aksi?"
        confirmText="Ya, Lanjutkan"
        onConfirm={handleConfirm}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Ya, Lanjutkan'));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('memanggil handler onCancel ketika tombol batal ditekan', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        message="Lanjutkan aksi?"
        cancelText="Batal"
        onConfirm={() => {}}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByText('Batal'));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('memanggil onCancel saat backdrop luar diklik', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        message="Lanjutkan aksi?"
        onConfirm={() => {}}
        onCancel={handleCancel}
      />
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('memanggil onCancel ketika tombol Escape ditekan', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        message="Lanjutkan aksi?"
        onConfirm={() => {}}
        onCancel={handleCancel}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('menambahkan kelas "danger" pada tombol aksi jika isDanger bernilai true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        message="Tindakan berbahaya!"
        confirmText="Hapus Permanen"
        isDanger={true}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const confirmBtn = screen.getByText('Hapus Permanen');
    expect(confirmBtn.className).toContain('danger');
  });
});
