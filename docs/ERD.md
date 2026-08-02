# 📐 Entity Relationship Diagram (ERD) — Mini Clinic Information System

Dokumen ini berisi spesifikasi skema relasi database untuk **Mini Clinic Information System (Clinica)**.

---

## 📌 Daftar Tabel Database

| Nama Tabel | Deskripsi Ringkas |
| :--- | :--- |
| **`users`** | Akun autentikasi pengguna (Admin, Dokter, Petugas Pendaftaran) |
| **`patients`** | Master data pasien (No. Rekam Medis otomatis, NIK unik, biodata) |
| **`policlinics`** | Master data poliklinik (Poli Umum, Poli Gigi, Poli Anak, dll) |
| **`doctors`** | Profil dokter spesialis yang terhubung ke akun `users` dan `policlinics` |
| **`registrations`** | Data pendaftaran kunjungan pasien dan penjamin pembayaran |
| **`queues`** | Data nomor antrean pasien harian dan status pemanggilan live |
| **`medical_records`** | Catatan pemeriksaan medis dokter berbasis **SOAP** (Subjective, Objective, Assessment, Plan) & Tanda Vital |
| **`medical_actions`** | Rincian tindakan medis yang diberikan kepada pasien |
| **`medicines`** | Master data obat, stok inventaris, dan harga satuan |
| **`prescriptions`** | Header resep obat pasien |
| **`prescription_details`** | Rincian detail obat dalam resep (Dosis, Frekuensi, Jumlah Unit) |
| **`payments`** | Transaksi pembayaran kuitansi kasir dan omzet pendapatan klinik |

---

## 🔗 Struktur Relasi Antar Tabel (*Relationships*)

- **`users` 1:1 `doctors`** — Satu akun dokter memiliki satu profil dokter.
- **`policlinics` 1:N `doctors`** — Satu poliklinik dapat memiliki banyak dokter.
- **`patients` 1:N `registrations`** — Satu pasien dapat melakukan banyak kunjungan pendaftaran.
- **`doctors` 1:N `registrations`** — Satu dokter dapat menangani banyak pendaftaran pasien.
- **`policlinics` 1:N `registrations`** — Satu poli dapat menerima banyak pendaftaran pasien.
- **`users` 1:N `registrations`** — Satu petugas pendaftaran dapat mendaftarkan banyak pasien.
- **`registrations` 1:1 `queues`** — Satu pendaftaran kunjungan memiliki satu nomor antrean.
- **`registrations` 1:1 `medical_records`** — Satu kunjungan memiliki maksimal satu rekam medis SOAP.
- **`patients` 1:N `medical_records`** — Satu pasien dapat memiliki banyak riwayat rekam medis.
- **`doctors` 1:N `medical_records`** — Satu dokter dapat membuat banyak rekam medis.
- **`medical_records` 1:N `medical_actions`** — Satu rekam medis dapat memiliki banyak rincian tindakan medis.
- **`medical_records` 1:1 `prescriptions`** — Satu rekam medis memiliki maksimal satu resep obat.
- **`patients` 1:N `prescriptions`** — Satu pasien dapat memiliki banyak resep obat.
- **`doctors` 1:N `prescriptions`** — Satu dokter dapat menerbitkan banyak resep obat.
- **`prescriptions` 1:N `prescription_details`** — Satu resep obat memiliki banyak detail sediaan obat.
- **`medicines` 1:N `prescription_details`** — Satu master obat dapat diresepkan pada banyak detail resep.
- **`registrations` 1:1 `payments`** — Satu pendaftaran kunjungan memiliki satu transaksi pembayaran.
- **`patients` 1:N `payments`** — Satu pasien dapat memiliki banyak riwayat pembayaran kuitansi.

