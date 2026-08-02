# Alur Aplikasi Mini Clinic Information System

## Gambaran Umum

Aplikasi ini mensimulasikan alur kerja harian sebuah klinik — dari pasien datang, mendaftar, menunggu antrean, diperiksa dokter, hingga mendapatkan resep dan pulang.

---

## 👤 Tiga Role Pengguna

| Role | Akun Demo | Bisa Melakukan |
|---|---|---|
| **Admin** | `admin@clinic.com` | Semua fitur + kelola master data |
| **Dokter** | `doctor@clinic.com` | Periksa pasien, isi SOAP, buat resep |
| **Petugas Pendaftaran** | `officer@clinic.com` | Daftarkan pasien, kelola antrean |

---

## 🔄 Alur Kunjungan Pasien (Step by Step)

### STEP 1 — Login
Login sesuai role Anda. Setelah login, Anda akan masuk ke **Dashboard** yang menampilkan ringkasan hari ini.

---

### STEP 2 — Cek / Daftarkan Data Pasien
> 👤 Dilakukan oleh: **Petugas / Admin**

Buka halaman **Data Pasien**.

- **Pasien lama** → cari menggunakan NIK, nama, atau No. RM
- **Pasien baru** → klik **"Pasien Baru"** dan isi:
  - NIK (16 digit)
  - Nama lengkap
  - Jenis kelamin & tanggal lahir
  - No. telepon & alamat

> Sistem akan otomatis membuat **Nomor Rekam Medis (No. RM)** unik.

---

### STEP 3 — Buat Pendaftaran & Nomor Antrean
> 👤 Dilakukan oleh: **Petugas / Admin**

Buka halaman **Pendaftaran & Antrean** → klik **"Daftarkan Pasien"**.

Isi formulir:
1. Pilih **Pasien** (dari daftar yang sudah terdaftar)
2. Pilih **Poliklinik** tujuan (misal: Poli Umum)
3. Pilih **Dokter** yang bertugas (otomatis difilter sesuai poli)
4. Pilih **Jenis Pembayaran** (BPJS / Mandiri / Asuransi)
5. Isi **Keluhan Awal** pasien
6. Klik **"Buat Pendaftaran & Antrean"**

> Sistem otomatis membuat:
> - **No. Registrasi** (format: `REG-YYYYMMDD-XXX`)
> - **Nomor Antrean** (format: `A001`, `A002`, dst.)
> - Status awal: **`WAITING`** (Menunggu)

---

### STEP 4 — Pasien Menunggu (Monitor Antrean)
> 👤 Dipantau oleh: **Petugas / Admin / Dokter**

Buka halaman **Layar Antrean Live**.

Halaman ini menampilkan **Kanban 3 kolom**:
```
[ Menunggu ] → [ Dipanggil/Diperiksa ] → [ Selesai ]
```

Halaman ini di-refresh otomatis setiap **30 detik** (bisa di-toggle manual).

---

### STEP 5 — Panggil Pasien
> 👤 Dilakukan oleh: **Petugas / Admin**

Di halaman **Pendaftaran & Antrean**, pada baris pasien dengan status `WAITING`:
- Klik tombol **"Panggil"**

> Status berubah: `WAITING` → **`CHECKED_IN`**

Pasien dipindahkan ke kolom **"Dipanggil"** di layar antrean live.

---

### STEP 6 — Dokter Memeriksa Pasien (SOAP)
> 👤 Dilakukan oleh: **Dokter / Admin**

Buka halaman **Pemeriksaan (SOAP)**.

**Panel Kiri:** Daftar semua antrean hari ini → klik nama pasien yang akan diperiksa.

**Panel Kanan:** Tampil info pasien, klik **"Mulai Pemeriksaan (SOAP)"** dan isi:

| Field | Keterangan |
|---|---|
| **S** — Subjective | Keluhan pasien (menurut pasien) |
| **O** — Objective | Hasil pemeriksaan fisik dokter |
| **A** — Assessment | Diagnosis / kesimpulan dokter |
| **P** — Plan | Rencana tindakan / terapi |
| Tanda Vital | Tekanan darah, suhu, nadi, BB, TB |

Klik **"Simpan SOAP"**.

> Status berubah: `CHECKED_IN` → **`EXAMINATION`**

---

### STEP 7 — Dokter Membuat Resep (Opsional)
> 👤 Dilakukan oleh: **Dokter / Admin**

Setelah SOAP tersimpan, akan muncul tombol **"Tambah Resep Obat"**.

Untuk setiap obat, isi:
- **Pilih Obat** (dari stok inventaris yang tersedia)
- **Dosis** (misal: `3×1 tablet`)
- **Frekuensi** (misal: `Setelah makan`)
- **Jumlah** (misal: `15` tablet)
- Catatan opsional

> Stok obat akan **otomatis berkurang** sesuai jumlah yang diresepkan.

---

### STEP 8 — Kunjungan Selesai
> Status akhir: **`COMPLETED`**

Kunjungan tercatat di rekam medis pasien. Data bisa dilihat kembali di halaman **Data Pasien** → tombol history (ikon jam) → akan tampil semua riwayat SOAP & resep pasien tersebut.

---

## 🗂️ Fitur Master Data (Setup Awal)

Sebelum operasional, **Admin** perlu menyiapkan:

| Halaman | Yang Harus Diisi |
|---|---|
| **Data Poliklinik** | Buat poli (misal: Poli Umum, Poli Gigi, Poli Anak) |
| **Data Dokter** | Tambah dokter + pilih poli tempat bertugas + buat akun login |
| **Stok Obat** | Daftarkan obat + harga + stok awal |

> Tanpa data master ini, halaman pendaftaran tidak akan bisa memilih dokter/poli.

---

## 📊 Dashboard (Ringkasan Hari Ini)

Dashboard menampilkan:
- Total pasien terdaftar di sistem
- Jumlah dokter aktif
- Kunjungan hari ini (selesai vs menunggu)
- Jumlah obat dengan stok menipis (≤ min. stok)
- Grafik tren kunjungan 7 hari terakhir
- 5 pendaftaran terbaru hari ini

---

## 🔁 Ringkasan Status Antrean

```
WAITING ──▶ CHECKED_IN ──▶ EXAMINATION ──▶ COMPLETED
   │
   └──▶ CANCELLED  (dibatalkan oleh petugas)
```

| Status | Warna | Artinya |
|---|---|---|
| `WAITING` | 🟡 Kuning | Pasien sudah terdaftar, menunggu dipanggil |
| `CHECKED_IN` | 🔵 Biru | Pasien dipanggil, menuju ruang periksa |
| `EXAMINATION` | 🟣 Ungu | Sedang diperiksa dokter |
| `COMPLETED` | 🟢 Hijau | Selesai, resep sudah dibuat |
| `CANCELLED` | 🔴 Merah | Dibatalkan |

---

## 💡 Urutan Penggunaan yang Disarankan (Pertama Kali)

```
1. Login sebagai Admin
2. Buat Poliklinik  (misal: Poli Umum)
3. Tambah Dokter    (assign ke Poli Umum)
4. Tambah Obat      (isi stok awal)
5. Tambah Pasien    (data NIK/KTP)
6. Buat Pendaftaran (pilih pasien + poli + dokter)
7. Panggil Antrean  (di halaman Pendaftaran)
8. Login sebagai Dokter
9. Isi SOAP         (di halaman Pemeriksaan)
10. Buat Resep      (opsional)
11. Kunjungan selesai ✓
```
