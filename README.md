# 🏥 Mini Clinic Information System (Clinica)

Aplikasi Sistem Informasi Manajemen Klinik Pratama berbasis web terintegrasi yang dibangun menggunakan **React.js**, **Node.js (Express.js)**, **PostgreSQL (Sequelize ORM)**, dan **JSON Web Token (JWT) Authentication**.

---

## 📋 Daftar Isi
1. [Cara Instalasi Aplikasi](#1-cara-instalasi-aplikasi)
2. [Cara Menjalankan Aplikasi](#2-cara-menjalankan-aplikasi)
3. [Struktur Project](#3-struktur-project)
4. [Akun Login](#4-akun-login)
5. [Konfigurasi File `.env`](#5-konfigurasi-file-env)
6. [Cara Melakukan Migrasi Database](#6-cara-melakukan-migrasi-database)
7. [Ketentuan Keamanan (`.env.example`)](#7-ketentuan-keamanan-envexample)

---

## 1. Cara Instalasi Aplikasi

### Prasyarat Sistem
- **Node.js**: v18.x atau versi lebih baru
- **PostgreSQL**: v14.x atau versi lebih baru
- **Git**

### Langkah Instalasi

```bash
# 1. Clone repositori Git
git clone https://github.com/rizallfrm/Mini-Clinic-Apps.git
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

### Terminal 1: Jalankan Backend Server (Port 5000)
```bash
cd backend
npm run dev
```
> REST API Backend berjalan pada: **`http://localhost:5000`**

### Terminal 2: Jalankan Frontend Client (Port 5173)
```bash
cd frontend
npm run dev
```
> Web Client React berjalan pada: **`http://localhost:5173`**

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
├── README.md                 # Dokumentasi utama proyek
└── README_DEMO.md            # Duplikat dokumentasi & referensi demo akun
```

---

## 4. Akun Login

Gunakan akun demo berikut untuk menguji otorisasi *Role-Based Access Control (RBAC)* pada halaman Login (`http://localhost:5173/login`):

| Role Pengguna | Email Login | Password Default | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gmail.com` | `Admin123!` | Kelola Master Data, Poliklinik, Dokter, User, & Laporan Klinik |
| **Dokter Spesialis** | `doctor@gmail.com` | `Doctor123!` | Pemeriksaan Medis SOAP, Vital Signs, Resep Obat, & Dashboard Dokter |
| **Petugas Pendaftaran** | `staff@gmail.com` | `Staff123!` | Registrasi Pasien Baru, Kunjungan Poli, & Panggilan Antrean Audio |

---

## 5. Konfigurasi File `.env`

Aplikasi membaca kredensial database dan rahasia aplikasi secara aman menggunakan `process.env`.

### A. Konfigurasi Backend (`backend/.env`)
Salin file `backend/.env.example` menjadi `backend/.env` dan atur nilainya:

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
DB_PASSWORD=postgres

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
Salin file `frontend/.env.example` menjadi `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. Cara Melakukan Migrasi Database

### Langkah 1: Buat Database PostgreSQL
Buka PostgreSQL / pgAdmin dan buat database baru bernama `mini_clinic_db`:

```sql
CREATE DATABASE mini_clinic_db;
```

### Langkah 2: Jalankan Migrasi & Seeder
Di dalam direktori `backend/`, jalankan perintah berikut:

```bash
# 1. Jalankan pembuatan database
npx sequelize-cli db:create

# 2. Jalankan migrasi tabel database
npx sequelize-cli db:migrate

# 3. Jalankan seeder data awal dan akun login demo
npx sequelize-cli db:seed:all
```

*(Atau opsional: Impor file `database/mini_clinic_db.sql` secara langsung menggunakan pgAdmin / psql).*

---

## 7. Ketentuan Keamanan (`.env.example`)

- ✅ **Wajib Menyertakan File `.env.example`**: Tersedia di direktori `backend/.env.example` dan `frontend/.env.example`.
- ✅ **Tidak Ada Kredensial Hardcode**: Konfigurasi database, JWT Secret, dan password pengguna dibaca secara dinamis melalui `process.env`.
- ✅ **Proteksi File `.env`**: File `.env` asli yang berisi password lokal didaftarkan dalam `.gitignore` sehingga aman dan tidak ter-commit ke repositori Git.