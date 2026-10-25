import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCities, useForm } from '../hooks/index.js';
import { useData } from '../context/DataContext.jsx';
import { BLOOD_TYPES, formatBloodType } from '../lib.js';
import { validationSchemas, sanitizePhone } from '../utils/validation.js';

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

/**
 * Halaman pembuatan permintaan kebutuhan darah baru.
 * Menggunakan useForm hook reusable untuk manajemen state dan validasi terpusat.
 */
export default function CreateRequest() {
  const navigate = useNavigate();
  const { cities } = useCities();
  const { createRequest } = useData();

  const { values, submitting, errors, handleChange, handleSubmit, setFieldValue } = useForm({
    initialValues: {
      blood_type: 'A+',
      hospital: '',
      city: '',
      units: 1,
      urgency: 'segera',
      needed_date: '',
      contact_phone: '',
    },
    validationSchema: validationSchemas.createRequest,
    onSubmit: async (formValues) => {
      const cleanPhone = sanitizePhone(formValues.contact_phone);
      const unitsNum = Number(formValues.units);

      await createRequest({
        ...formValues,
        hospital: formValues.hospital.trim(),
        contact_phone: cleanPhone,
        units: unitsNum,
        needed_date: formValues.needed_date || null,
      });
      navigate('/permintaan', { state: { created: true } });
    },
  });

  useEffect(() => {
    if (cities?.length > 0 && !values.city) {
      setFieldValue('city', cities[0]);
    }
  }, [cities, values.city, setFieldValue]);

  return (
    <main id="main-content" role="main">
      <div className="wrap pg">
        <h1 className="ph">Buat Permintaan Darah</h1>
        <p className="sub">
          Isi formulir kebutuhan darah untuk pasien di rumah sakit atau puskesmas wilayah Danau Toba.
        </p>

        <form className="fm" onSubmit={handleSubmit} noValidate>
          {errors.length > 0 && (
            <ul className="errs" role="alert">
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}

          <div className="two">
            <label>
              Golongan Darah Pasien
              <select
                value={values.blood_type}
                onChange={handleChange('blood_type')}
                id="blood_type"
                name="blood_type"
              >
                {BLOOD_TYPES.map((bloodGroup) => (
                  <option key={bloodGroup} value={bloodGroup}>
                    {formatBloodType(bloodGroup)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Kota / Wilayah Faskes
              <select
                value={values.city}
                onChange={handleChange('city')}
                id="city"
                name="city"
              >
                {cities?.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Nama Rumah Sakit / Puskesmas
            <input
              type="text"
              id="hospital"
              name="hospital"
              value={values.hospital}
              onChange={handleChange('hospital')}
              placeholder="Contoh: RS HKBP Balige, RSUD Tarutung"
              maxLength={120}
              required
            />
          </label>

          <div className="two">
            <label>
              Jumlah Kantong (Unit)
              <input
                type="number"
                id="units"
                name="units"
                min={1}
                max={20}
                value={values.units}
                onChange={handleChange('units')}
                required
              />
            </label>

            <label>
              Tingkat Urgensi
              <select
                value={values.urgency}
                onChange={handleChange('urgency')}
                id="urgency"
                name="urgency"
              >
                <option value="darurat">Darurat (Butuh segera dalam beberapa jam)</option>
                <option value="segera">Segera (Dibutuhkan hari ini)</option>
                <option value="terjadwal">Terjadwal (Operasi / tindakan beberapa hari ke depan)</option>
              </select>
            </label>
          </div>

          {values.urgency === 'terjadwal' && (
            <label>
              Tanggal Dibutuhkan
              <input
                type="date"
                id="needed_date"
                name="needed_date"
                min={getTodayDateString()}
                value={values.needed_date}
                onChange={handleChange('needed_date')}
                required
              />
            </label>
          )}

          <label>
            Nomor WhatsApp Narahubung Pasien
            <input
              type="tel"
              id="contact_phone"
              name="contact_phone"
              inputMode="tel"
              value={values.contact_phone}
              onChange={handleChange('contact_phone')}
              placeholder="Contoh: 081234567890"
              maxLength={20}
              required
            />
          </label>

          <button className="go2" disabled={submitting} type="submit">
            {submitting ? 'Memproses Permintaan...' : 'Kirim Permintaan Darah'}
          </button>
        </form>
      </div>
    </main>
  );
}
