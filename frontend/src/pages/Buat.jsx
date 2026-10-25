import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useCities } from '../hooks/index.js';
import { GOL, fg } from '../lib.js';

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

/**
 * Halaman pembuatan permintaan kebutuhan darah baru.
 */
export default function Buat() {
  const navigate = useNavigate();
  const { cities } = useCities();
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
    if (cities.length > 0 && !formData.city) {
      setFormData((prev) => ({ ...prev, city: cities[0] }));
    }
  }, [cities, formData.city]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    try {
      await api.createRequest({
        ...formData,
        units: Number(formData.units),
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
          Isi data kebutuhan pasien dan kontak WhatsApp yang dapat dihubungi oleh pendonor.
        </p>

        <form className="fm" onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <ul className="errs" role="alert">
              {errors.map((errorMsg, index) => (
                <li key={index}>{errorMsg}</li>
              ))}
            </ul>
          )}

          <div className="two">
            <label>
              Golongan Darah
              <select
                id="req-blood-type"
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange('blood_type')}
              >
                {GOL.map((bloodGroup) => (
                  <option key={bloodGroup} value={bloodGroup}>
                    {fg(bloodGroup)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Jumlah Kantong
              <input
                id="req-units"
                name="units"
                type="number"
                min="1"
                max="20"
                value={formData.units}
                onChange={handleChange('units')}
                required
              />
            </label>
          </div>

          <label>
            Rumah Sakit atau Puskesmas
            <input
              id="req-hospital"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange('hospital')}
              maxLength={100}
              placeholder="Mis. RS Balige"
              required
            />
          </label>

          <div className="two">
            <label>
              Kota / Kabupaten
              <select
                id="req-city"
                name="city"
                value={formData.city}
                onChange={handleChange('city')}
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tingkat Urgensi
              <select
                id="req-urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleChange('urgency')}
              >
                <option value="darurat">Darurat (&lt; 6 Jam)</option>
                <option value="segera">Segera (&lt; 24 Jam)</option>
                <option value="terjadwal">Terjadwal</option>
              </select>
            </label>
          </div>

          {formData.urgency === 'terjadwal' && (
            <label>
              Tanggal Dibutuhkan
              <input
                id="req-needed-date"
                name="needed_date"
                type="date"
                min={getTodayDateString()}
                value={formData.needed_date}
                onChange={handleChange('needed_date')}
                required
              />
            </label>
          )}

          <label>
            Nomor WhatsApp yang Dapat Dihubungi
            <input
              id="req-contact-phone"
              name="contact_phone"
              type="tel"
              inputMode="tel"
              value={formData.contact_phone}
              onChange={handleChange('contact_phone')}
              placeholder="081234567890"
              required
            />
          </label>

          <button className="go2" disabled={submitting} type="submit">
            {submitting ? 'Menyimpan Permintaan...' : 'Kirim Permintaan Darah'}
          </button>
        </form>
      </div>
    </main>
  );
}
