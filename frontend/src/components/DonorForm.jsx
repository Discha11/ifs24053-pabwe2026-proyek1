import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDonors, useForm } from '../hooks/index.js';
import { BLOOD_TYPES, formatBloodType } from '../lib.js';
import { validationSchemas, sanitizePhone } from '../utils/validation.js';

/**
 * Komponen form pendaftaran pendonor baru pada panel kelola data admin.
 * @param {{ cities: string[], onSaved: () => void }} props
 */
export default function DonorForm({ cities = [], onSaved = undefined }) {
  const { createDonor } = useDonors();

  const { values, errors, submitting, handleChange, handleSubmit, resetForm, setFieldValue } = useForm({
    initialValues: {
      name: '',
      blood_type: 'A+',
      city: '',
      phone: '',
      last_donated: '',
    },
    validationSchema: validationSchemas.donor,
    onSubmit: async (formValues) => {
      const cleanPhone = sanitizePhone(formValues.phone);
      await createDonor({
        ...formValues,
        name: formValues.name.trim(),
        phone: cleanPhone,
        last_donated: formValues.last_donated || null,
      });
      resetForm();
      if (cities?.[0]) setFieldValue('city', cities[0]);
      if (onSaved) onSaved();
    },
  });

  useEffect(() => {
    if (cities?.length > 0 && !values.city) {
      setFieldValue('city', cities[0]);
    }
  }, [cities, values.city, setFieldValue]);

  return (
    <form className="fm" onSubmit={handleSubmit}>
      <h3>Daftarkan Pendonor Baru</h3>

      {errors.length > 0 && (
        <ul className="errs" role="alert">
          {errors.map((errorMsg) => (
            <li key={errorMsg}>{errorMsg}</li>
          ))}
        </ul>
      )}

      <div className="two">
        <label>
          Nama Lengkap
          <input
            id="donor-name"
            name="name"
            value={values.name}
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
            value={values.blood_type}
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
            value={values.city}
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
            value={values.phone}
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
          value={values.last_donated}
          onChange={handleChange('last_donated')}
        />
      </label>

      <button className="go2" type="submit" disabled={submitting}>
        {submitting ? 'Menyimpan Data...' : 'Daftarkan Pendonor'}
      </button>
    </form>
  );
}

DonorForm.propTypes = {
  cities: PropTypes.arrayOf(PropTypes.string),
  onSaved: PropTypes.func,
};


