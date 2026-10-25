import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm.js';

describe('useForm Hook Test Suite', () => {
  it('menginisialisasi form dengan nilai awal dan state default', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'test@example.com', name: 'Binsar' },
      })
    );

    expect(result.current.values).toEqual({ email: 'test@example.com', name: 'Binsar' });
    expect(result.current.errors).toEqual([]);
    expect(result.current.submitting).toBe(false);
  });

  it('memperbarui nilai input teks dan checkbox melalui handleChange', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', agreed: false },
      })
    );

    act(() => {
      result.current.handleChange('email')({ target: { value: 'user@test.com' } });
    });
    expect(result.current.values.email).toBe('user@test.com');

    act(() => {
      result.current.handleChange('agreed')({ target: { type: 'checkbox', checked: true } });
    });
    expect(result.current.values.agreed).toBe(true);
  });

  it('memperbarui nilai bidang secara manual melalui setFieldValue', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { city: 'Balige' },
      })
    );

    act(() => {
      result.current.setFieldValue('city', 'Tarutung');
    });
    expect(result.current.values.city).toBe('Tarutung');
  });

  it('mereset nilai formulir kembali ke initialValues melalui resetForm', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { hospital: 'RS HKBP' },
      })
    );

    act(() => {
      result.current.setFieldValue('hospital', 'RSUD Tarutung');
    });
    expect(result.current.values.hospital).toBe('RSUD Tarutung');

    act(() => {
      result.current.resetForm();
    });
    expect(result.current.values.hospital).toBe('RS HKBP');
    expect(result.current.errors).toEqual([]);
  });

  it('memblokir submit dan menyimpan pesan error jika validasi skema gagal', async () => {
    const mockSubmit = vi.fn();
    const mockValidator = vi.fn().mockReturnValue(['Nama minimal 3 karakter']);

    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'A' },
        validationSchema: mockValidator,
        onSubmit: mockSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockValidator).toHaveBeenCalledWith({ name: 'A' });
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual(['Nama minimal 3 karakter']);
    expect(result.current.submitting).toBe(false);
  });

  it('memanggil onSubmit ketika validasi berhasil dan membersihkan error sebelumnya', async () => {
    const mockSubmit = vi.fn().mockResolvedValue({ id: 1 });
    const mockValidator = vi.fn().mockReturnValue([]);

    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'Binsar' },
        validationSchema: mockValidator,
        onSubmit: mockSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockValidator).toHaveBeenCalled();
    expect(mockSubmit).toHaveBeenCalledWith({ name: 'Binsar' });
    expect(result.current.errors).toEqual([]);
    expect(result.current.submitting).toBe(false);
  });

  it('menangkap error dari onSubmit dan memformatnya ke state errors', async () => {
    const mockSubmit = vi.fn().mockRejectedValue({
      details: ['Email sudah terdaftar di sistem'],
    });

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'dup@test.com' },
        onSubmit: mockSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors).toEqual(['Email sudah terdaftar di sistem']);
    expect(result.current.submitting).toBe(false);
  });
});
