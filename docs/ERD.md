# ERD — Mini Clinic Information System

Dokumen ini berisi Entity Relationship Diagram (ERD) untuk Mini Clinic Information System.

## Daftar Tabel

| Tabel | Deskripsi |
|---|---|
| `users` | Akun pengguna (Admin, Dokter, Petugas) |
| `patients` | Data master pasien |
| `policlinics` | Data poli klinik |
| `doctors` | Profil dokter |
| `registrations` | Data pendaftaran / kunjungan |
| `queues` | Nomor antrean pasien |
| `medical_records` | Rekam medis SOAP |
| `medical_actions` | Tindakan medis |
| `medicines` | Data master obat |
| `prescriptions` | Header resep obat |
| `prescription_details` | Detail obat dalam resep |

## Relasi

- `users` ←→ `doctors` (one-to-one)
- `policlinics` ←→ `doctors` (one-to-many)
- `patients` ←→ `registrations` (one-to-many)
- `doctors` ←→ `registrations` (one-to-many)
- `policlinics` ←→ `registrations` (one-to-many)
- `users` ←→ `registrations` (one-to-many, via created_by)
- `registrations` ←→ `queues` (one-to-one)
- `registrations` ←→ `medical_records` (one-to-one)
- `patients` ←→ `medical_records` (one-to-many)
- `doctors` ←→ `medical_records` (one-to-many)
- `medical_records` ←→ `medical_actions` (one-to-many)
- `medical_records` ←→ `prescriptions` (one-to-one)
- `patients` ←→ `prescriptions` (one-to-many)
- `doctors` ←→ `prescriptions` (one-to-many)
- `prescriptions` ←→ `prescription_details` (one-to-many)
- `medicines` ←→ `prescription_details` (one-to-many)

## ERD Diagram

> File ERD.png akan ditambahkan setelah migrasi database selesai (Tahap 4).
