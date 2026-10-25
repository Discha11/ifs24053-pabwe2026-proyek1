import { useState, useCallback } from 'react';
import { getErrorMessage } from '../utils/errors.js';

/**
 * Custom hook form reusable untuk mengeliminasi duplikasi logika form/submit di seluruh aplikasi.
 * Menangani state form values, perubahan input, eksekusi skema validasi terpusat,
 * status submitting, serta penanganan error standar.
 *
 * @param {object} initialValues - Nilai awal bidang form
 * @param {Function} [validationSchema] - Fungsi skema validasi terpusat (validationSchemas[type])
 * @param {Function} onSubmit - Handler aksi submit ketika validasi berhasil
 * @returns {object}
 */
export function useForm({ initialValues = {}, validationSchema, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback(
    (field) => (e) => {
      const val = e?.target?.type === 'checkbox' ? e.target.checked : e?.target?.value ?? e;
      setValues((prev) => ({ ...prev, [field]: val }));
    },
    []
  );

  const setFieldValue = useCallback((field, val) => {
    setValues((prev) => ({ ...prev, [field]: val }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors([]);
    setSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) {
        e.preventDefault();
      }

      setErrors([]);

      if (typeof validationSchema === 'function') {
        const valErrors = validationSchema(values);
        if (Array.isArray(valErrors) && valErrors.length > 0) {
          setErrors(valErrors);
          return;
        }
      }

      setSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        setErrors(err?.details?.length ? err.details : [getErrorMessage(err)]);
      } finally {
        setSubmitting(false);
      }
    },
    [values, validationSchema, onSubmit]
  );

  return {
    values,
    setValues,
    errors,
    setErrors,
    submitting,
    handleChange,
    setFieldValue,
    handleSubmit,
    resetForm,
  };
}
