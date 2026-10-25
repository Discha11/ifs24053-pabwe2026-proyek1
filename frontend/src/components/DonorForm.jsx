import { useEffect, useState } from 'react';
import { useDonors } from '../hooks/index.js';
import { BLOOD_TYPES, formatBloodType } from '../lib.js';
import { isValidIndonesianPhone, sanitizePhone, hasMinLength } from '../utils/validation.js';

/**
 * Komponen form pendaftaran pendonor baru pada panel kelola data admin.
 * @param {{ cities: string[], onSaved: () => void }} props
 */
export default function DonorForm({ cities = [], onSaved }) {
  const { createDonor } = useDonors();
  const initialFormState = {
    name: '',
    blood_type: 'A+',
    city: '',
    phone: '',
    last_donated: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cities?.length > 0 && !formData.city) {
      setFormData((prev) => ({ ...prev, city: cities[0] }));
    }
  }, [cities, formData.city]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    const validationErrors = [];
    if (!hasMinLength(formData.name, 2)) {
      validationErrors.push('Nama lengkap harus diisi minimal 2 karakter.');
    }
    const cleanPhone = sanitizePhone(formData.phone);
    if (!isValidIndonesianPhone(cleanPhone)) {
      validationErrors.push('Nomor WhatsApp tidak valid. Masukkan nomor HP aktif (contoh: 081234567890).');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createDonor({
        ...formData,
        name: formData.name.trim(),
        phone: cleanPhone,
        last_donated: formData.last_donated || null,
      });
      setFormData({ ...initialFormState, city: cities[0] || '' });
      if (onSaved) onSaved();
    } catch (err) {
      setErrors(err.details?.length ? err.details : [err.message]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="fm" onSubmit={handleSubmit}>
      <h3>Daftarkan Pendonor Baru</h3>

      {errors.length > 0 && (
        <ul className="errs" role="alert">
          {errors.map((errorMsg, index) => (
            <li key={index}>{errorMsg}</li>
          ))}
        </ul>
      )}

      <div className="two">
        <label>
          Nama Lengkap
          <input
            id="donor-name"
            name="name"
            value={formData.name}
            onChange={handleChange('name')}
            maxLength={80}
            placeholder="Mis. Daniel Silalahi"
            required
          />
        </label>
        <label>
          Golongan Darah
          <select
            id="donor-blood-type"
            name="blood_type"
            value={formData.blood_type}
            onChange={handleChange('blood_type')}
          >
            {BLOOD_TYPES.map((bloodGroup) => (
              <option key={bloodGroup} value={bloodGroup}>
                {formatBloodType(bloodGroup)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="two">
        <label>
          Kota Domisili
          <select
            id="donor-city"
            name="city"
            value={formData.city}
            onChange={handleChange('city')}
          >
            {cities?.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nomor WhatsApp
          <input
            id="donor-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
            placeholder="081234567890"
            required
          />
        </label>
      </div>

      <label>
        Terakhir Donor (Kosongkan jika belum pernah donor)
        <input
          id="donor-last-donated"
          name="last_donated"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          value={formData.last_donated}
          onChange={handleChange('last_donated')}
        />
      </label>

      <button className="go2" type="submit" disabled={submitting}>
        {submitting ? 'Menyimpan Data...' : 'Daftarkan Pendonor'}
      </button>
    </form>
  );
}
