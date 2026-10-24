// Data contoh (sama dengan prototipe tampilan). Dipanggil otomatis saat tabel kosong.
const { todayISO, addDays } = require('./rules');

function seed(db) {
  const today = todayISO();
  // [nama, golongan, kota, hari sejak donor terakhir, 3 digit akhir nomor]
  const donors = [
    ['Rina S.', 'A+', 'Balige', 120, '318'], ['Doni P.', 'O+', 'Balige', 30, '502'],
    ['Mawar T.', 'A-', 'Laguboti', 90, '276'], ['Johannes L.', 'O-', 'Parapat', 200, '945'],
    ['Sari N.', 'B+', 'Balige', 80, '160'], ['Bona H.', 'AB+', 'Pangururan', 10, '739'],
    ['Lestari M.', 'A+', 'Laguboti', 76, '884'], ['Rudi G.', 'O+', 'Parapat', 45, '417'],
    ['Evi R.', 'A+', 'Medan', 150, '623'], ['Tigor S.', 'B-', 'Balige', 100, '095'],
    ['Nia W.', 'AB-', 'Laguboti', 60, '338'], ['Hotma P.', 'O+', 'Balige', 95, '771'],
  ];
  const insD = db.prepare('INSERT INTO donors (name, blood_type, city, phone, last_donated) VALUES (?,?,?,?,?)');
  donors.forEach(([n, g, c, days, tail], i) =>
    insD.run(n, g, c, `6281200${String(i).padStart(2, '0')}${tail}`, addDays(today, -days)));

  const ago = (h) => new Date(Date.now() - h * 3600000).toISOString();
  const insR = db.prepare(`INSERT INTO requests (blood_type, hospital, city, units, urgency, contact_phone, needed_date, created_at)
                           VALUES (?,?,?,?,?,?,?,?)`);
  const phone = '628120000000';
  insR.run('A+', 'RS Balige', 'Balige', 2, 'darurat', phone, null, ago(2));
  insR.run('O-', 'Puskesmas Parapat', 'Parapat', 1, 'segera', phone, null, ago(26));
  insR.run('B+', 'RS Laguboti', 'Laguboti', 3, 'terjadwal', phone, addDays(today, 3), ago(30));
  insR.run('AB+', 'RS Pangururan', 'Pangururan', 1, 'darurat', phone, null, ago(5));
}

module.exports = seed;
if (require.main === module) { seed(require('./db')); console.log('Seed selesai.'); }
