# SADA – Sahabat Aksi Donor Anda

Aplikasi web untuk mempertemukan pendonor darah dan keluarga pasien di kawasan Danau Toba.
Pengguna memilih golongan darah pasien, SADA menampilkan pendonor yang **kompatibel** (bukan hanya golongan sama)
dan menandai siapa yang sudah melewati jeda 75 hari sejak donor terakhir.

- **Front-end:** ReactJS (Vite, React Router)

## Menjalankan di komputer lokal

Prasyarat: Node.js 20 atau lebih baru.

```bash
git clone <URL-REPOSITORY-FRONTEND-ANDA>
cd ifs24053-pabwe2026-proyek1

# Jalankan front-end (http://localhost:5173)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Atau dari root proyek:
```bash
npm run dev
npm run build
```

## Halaman

| Rute | Fungsi |
|---|---|
| `/` | Beranda: ringkasan, ticker permintaan, pencocokan pendonor, daftar permintaan |
| `/cari` | Cari pendonor berdasarkan golongan darah dan kota |
| `/permintaan` | Daftar permintaan darah yang dibuka |
| `/buat` | Form buat permintaan darah |
| `/dashboard` | Kelola permintaan dan pendonor (daftar, catat donor, hapus) |

## Endpoint API

| Method | Path | Fungsi |
|---|---|---|
| GET | /api/health | Cek status server |
| GET | /api/cities | Daftar kota |
| GET | /api/stats | Ringkasan |
| GET | /api/donors | Daftar pendonor (nomor disamarkan) |
| GET | /api/donors/match?blood_type=A%2B&city= | Pendonor kompatibel, urut yang siap dulu |
| POST | /api/donors | Daftarkan pendonor |
| PATCH | /api/donors/:id/donated | Catat donor hari ini |
| DELETE | /api/donors/:id | Hapus pendonor |
| GET | /api/requests | Permintaan terbuka (darurat dulu) |
| POST | /api/requests | Buat permintaan |
| PATCH | /api/requests/:id/close | Tutup permintaan |
| DELETE | /api/requests/:id | Hapus permintaan |

## Deployment

Back-end: Web Service Node (mis. Render), perintah `npm start`, variabel `PORT` dan `DB_PATH`.
Front-end: static site (mis. Vercel/Netlify/Render), build `npm run build`, folder `dist`,
variabel `VITE_API_URL` berisi URL back-end. Routing memakai hash (`/#/cari`) sehingga tidak perlu konfigurasi rewrite.
