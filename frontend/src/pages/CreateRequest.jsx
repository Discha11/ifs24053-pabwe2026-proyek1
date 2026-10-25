import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCities, useRequests } from '../hooks/index.js';
import { BLOOD_TYPES, formatBloodType } from '../lib.js';
import { isValidIndonesianPhone, sanitizePhone, hasMinLength } from '../utils/validation.js';

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

/**
 * Halaman pembuatan permintaan kebutuhan darah baru.
 */
export default function CreateRequest() {
  const navigate = useNavigate();
  const { cities } = useCities();
  const { createRequest } = useRequests();
  const [formData, setFormData] = useState({
    blood_type: 'A+',
    hospital: '',
    city: '',
    units: 1,
    urgency: 'segera',
    needed_date: '',
    contact_phone: '',
  });
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
    if (!hasMinLength(formData.hospital, 3)) {
      validationErrors.push('Nama rumah sakit/faskes harus diisi minimal 3 karakter.');
    }
    const unitsNum = Number(formData.units);
    if (isNaN(unitsNum) || unitsNum < 1 || unitsNum > 20) {
      validationErrors.push('Jumlah kantong darah harus antara 1 sampai 20 kantong.');
    }
    const cleanPhone = sanitizePhone(formData.contact_phone);
    if (!isValidIndonesianPhone(cleanPhone)) {
      validationErrors.push('Nomor WhatsApp tidak valid. Masukkan nomor HP aktif (contoh: 081234567890).');
    }
    if (formData.urgency === 'terjadwal' && !formData.needed_date) {
      validationErrors.push('Tanggal dibutuhkan harus diisi untuk kebutuhan terjadwal.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createRequest({
        ...formData,
        hospital: formData.hospital.trim(),
        contact_phone: cleanPhone,
        units: unitsNum,
        needed_date: formData.needed_date || null,
      });
      navigate('/permintaan', { state: { created: true } });
    } catch (err) {
      setErrors(err.details?.length ? err.details : [err.message]);
    } finally {
      setSubmitting(false);
    }
  }

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
                value={formData.blood_type}
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
                value={formData.city}
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
              value={formData.hospital}
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
                value={formData.units}
                onChange={handleChange('units')}
                required
              />
            </label>

            <label>
              Tingkat Urgensi
              <select
                value={formData.urgency}
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

          {formData.urgency === 'terjadwal' && (
            <label>
              Tanggal Dibutuhkan
              <input
                type="date"
                id="needed_date"
                name="needed_date"
                min={getTodayDateString()}
                value={formData.needed_date}
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
              value={formData.contact_phone}
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
