# 🏥 Mini Clinic Information System (Clinica)

Aplikasi Sistem Informasi Manajemen Klinik Pratama berbasis web terintegrasi yang dibangun menggunakan **React.js**, **Node.js (Express.js)**, **PostgreSQL (Sequelize ORM)**, dan **JSON Web Token (JWT) Authentication**.

Dokumen ini disusun untuk memenuhi seluruh kriteria *Technical Assignment Programmer (Take Home Test)*.

---

## 📌 Daftar Isi
1. [Cara Instalasi Aplikasi](#1-cara-instalasi-aplikasi)
2. [Cara Menjalankan Aplikasi](#2-cara-menjalankan-aplikasi)
3. [Struktur Project](#3-struktur-project)
4. [Akun Login (Demo Credentials)](#4-akun-login-demo-credentials)
5. [Konfigurasi File `.env`](#5-konfigurasi-file-env)
6. [Cara Melakukan Migrasi & Seeding Database](#6-cara-melakukan-migrasi--seeding-database)
7. [Ketentuan Keamanan (.env.example)](#7-ketentuan-keamanan-envexample)

---

## 1. Cara Instalasi Aplikasi

### Prasyarat Sistem
- **Node.js**: v18.x atau versi lebih baru
- **PostgreSQL**: v14.x atau versi lebih baru
- **Git**

### Langkah Instalasi

```bash
# 1. Clone repositori Git
git clone https://github.com/username/mini-clinic-information-system.git
cd mini-clinic-information-system

# 2. Install dependensi Backend
cd backend
npm install

# 3. Install dependensi Frontend
cd ../frontend
npm install
```

---

## 2. Cara Menjalankan Aplikasi

Aplikasi membutuhkan **dua terminal** terpisah (Terminal 1 untuk Backend API, Terminal 2 untuk Frontend Client).

### Terminal 1: Jalankan Backend API
```bash
cd backend
npm run dev
```
> Server Backend REST API akan berjalan pada: **`http://localhost:5000`**

### Terminal 2: Jalankan Frontend App
```bash
cd frontend
npm run dev
```
> Aplikasi Web Client React akan berjalan pada: **`http://localhost:5173`**

---

## 3. Struktur Project

```
mini-clinic-information-system/
├── backend/                  # REST API Service (Node.js + Express.js)
│   ├── src/
│   │   ├── config/          # Konfigurasi database & Sequelize via process.env
│   │   ├── controllers/     # Controller handler REST API
│   │   ├── middlewares/    # Auth JWT & Role Validation middlewares
│   │   ├── models/         # Model Sequelize (User, Patient, Doctor, Policlinic, etc.)
│   │   ├── routes/         # Router Express (/api/auth, /api/patients, /api/queues, etc.)
│   │   ├── services/       # Layer logika bisnis & database query
│   │   ├── utils/          # Helper response & pagination
│   │   ├── validators/     # Express validator & data sanitizer
│   │   ├── app.js          # Express app & CORS config
│   │   └── server.js       # Entry point server HTTP backend
│   ├── migrations/         # Migration database Sequelize
│   ├── seeders/            # Seeder data awal & demo
│   ├── .env.example        # Template konfigurasi variabel lingkungan backend
│   └── package.json
├── frontend/                 # Client Interface (React.js + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # UI Components (Sidebar, Navbar, Modal, FormField, Toast, dll)
│   │   ├── context/        # AuthContext & ToastContext (Toast Confirm System)
│   │   ├── pages/          # Halaman Utama (LoginPage, Dashboard, Patients, SOAP, dll)
│   │   ├── services/       # Axios API Client Instance
│   │   ├── App.jsx         # Router & Route Guards
│   │   └── main.jsx        # Entry point React Vite
│   ├── .env.example        # Template konfigurasi variabel lingkungan frontend
│   └── package.json
├── database/                 # Export Database SQL (.sql)
├── postman/                  # Postman Collection JSON
├── .gitignore                # Pengecualian file sensitif (.env)
└── README.md                 # Dokumentasi utama proyek
```

---

## 4. Akun Login (Demo Credentials)

Untuk menguji seluruh alur pelayanan klinik dan otorisasi *Role-Based Access Control (RBAC)*, gunakan akun demo berikut yang telah di-generate oleh seeder:

| Role Pengguna | Email Login | Password Default | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gmail.com` | `Admin123!` | Kelola Master Data, Poliklinik, Dokter, User, & Laporan Klinik |
| **Dokter Spesialis** | `doctor@gmail.com` | `Doctor123!` | Pemeriksaan SOAP, Tanda Vital, Resep Obat, & Dashboard Dokter |
| **Petugas Pendaftaran** | `staff@gmail.com` | `Staff123!` | Registrasi Pasien Baru, Kunjungan Poli, & Panggilan Antrean Audio |

---

## 5. Konfigurasi File `.env`

Aplikasi membaca kredensial database dan rahasia aplikasi secara aman menggunakan `process.env`. 

### A. Konfigurasi Backend (`backend/.env`)
Buat file `.env` di folder `backend/` dengan menyalin file `backend/.env.example`:

```env
# =====================================================
# APPLICATION CONFIGURATION
# =====================================================
NODE_ENV=development
PORT=5000

# =====================================================
# DATABASE CONFIGURATION (Local PostgreSQL)
# =====================================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_clinic_db
DB_USER=postgres
DB_PASSWORD=1234

# =====================================================
# DEFAULT SEED ACCOUNTS (ENVIRONMENT VARIABLES)
# =====================================================
SEED_ADMIN_EMAIL=admin@gmail.com
SEED_ADMIN_PASSWORD=Admin123!

SEED_DOCTOR_EMAIL=doctor@gmail.com
SEED_DOCTOR_PASSWORD=Doctor123!

SEED_STAFF_EMAIL=staff@gmail.com
SEED_STAFF_PASSWORD=Staff123!

# =====================================================
# JWT AUTHENTICATION
# =====================================================
JWT_SECRET=miniiclinicproject_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=8h

# =====================================================
# CORS & FRONTEND URL
# =====================================================
FRONTEND_URL=http://localhost:5173
```

### B. Konfigurasi Frontend (`frontend/.env`)
Buat file `.env` di folder `frontend/` dengan menyalin file `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. Cara Melakukan Migrasi & Seeding Database

### Langkah 1: Buat Database PostgreSQL
Buka terminal PostgreSQL / pgAdmin dan buat database baru bernama `mini_clinic_db`:

```sql
CREATE DATABASE mini_clinic_db;
```

### Langkah 2: Jalankan Migrasi & Seeder
Di dalam direktori `backend/`, jalankan perintah berikut:

```bash
# 1. Jalankan migrasi tabel database
npx sequelize-cli db:migrate

# 2. Jalankan seeder data awal dan akun login demo
npx sequelize-cli db:seed:all
```

*(Atau opsional: Impor file `database/mini_clinic_db.sql` secara langsung menggunakan pgAdmin / psql).*

---

## 7. Ketentuan Keamanan (`.env.example`)

Sesuai ketentuan tugas:
- ✅ **`.env.example` disediakan** di folder `backend/` dan `frontend/` sebagai panduan struktur konfigurasi.
- ✅ **Tidak ada kredensial sensitif di-hardcode** dalam *source code* maupun repositori Git. Kredensial dibaca secara dinamis menggunakan `process.env`.
- ✅ File `.env` sensitif yang berisi password asli telah didaftarkan dalam **`.gitignore`** sehingga aman dan tidak akan ter-commit ke repositori public/private.
