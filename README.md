# 🏥 Mini Clinic Information System (Clinica)

Aplikasi Sistem Informasi Manajemen Klinik Pratama berbasis web terintegrasi yang dibangun menggunakan **React.js**, **Node.js (Express.js)**, **PostgreSQL (Sequelize ORM)**, dan **JSON Web Token (JWT) Authentication**.

---

## 📌 Daftar Isi
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Keamanan Credential & Rahasia Data](#-keamanan-credential--rahasia-data)
- [Fitur Utama & Alur Kerja Aplikasi (*App Flow*)](#-fitur-utama--alur-kerja-aplikasi-app-flow)
- [Struktur Project](#-struktur-project)
- [Template Konfigurasi `.env.example`](#-template-konfigurasi-envexample)
- [Cara Instalasi Aplikasi](#-cara-instalasi-aplikasi)
- [Migrasi & Seeding Database](#-migrasi--seeding-database)
- [Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi)
- [Akun Login (Demo Roles)](#-akun-login-demo-roles)
- [Postman Collection](#-postman-collection)

---

## 🚀 Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Lucide React, Context API, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL, Sequelize ORM |
| **Autentikasi** | JSON Web Token (JWT), bcryptjs (Role-Based Access Control / RBAC) |
| **Version Control** | Git |

## 🔄 Fitur Utama & Alur Kerja Aplikasi (*App Flow*)

```
[1. Master Data Admin] ➔ [2. Pendaftaran Pasien & Antrean] ➔ [3. Pemanggilan Antrean Audio]
                                                                        │
[6. Laporan Klinik & Cetak] ◄─ [5. Pembayaran Kasir & Kuitansi] ◄─ [4. Pemeriksaan SOAP & Resep Dokter]
```

### 1. **Autentikasi & Authorization (RBAC)**
- Login multi-role: **ADMIN**, **DOCTOR**, **REGISTRATION_OFFICER (Petugas)**, **PHARMACIST**, dan **CASHIER**.
- Keamanan rahasia JWT & database menggunakan variabel lingkungan (`process.env`).

### 2. **Master Data Pasien**
- Pencatatan NIK (Validasi Unik), Nama, Gender, Tgl Lahir, HP, Alamat.
- **Nomor Rekam Medis (No. RM)** otomatis ter-generate (`RM-YYYYMMDD-XXX`).
- Pencarian *real-time*, *pagination*, dan modal riwayat pemeriksaan medis.

### 3. **Pendaftaran & Antrean Pasien**
- Pendaftaran kunjungan ke Poliklinik & Dokter tujuan.
- Penerbitan **Nomor Antrean Otomatis** (misal: `A001`).
- Layar Antrean Live dengan **Panggilan Suara Otomatis (Text-to-Speech)** dalam Bahasa Indonesia.

### 4. **Pemeriksaan Dokter (SOAP & Resep Obat)**
- Pencatatan Medis Berbasis **SOAP**:
  - **Subjective (S)**: Keluhan Pasien.
  - **Objective (O) & Vital Signs**: Tanda-tanda vital lengkap (TD, Suhu, Nadi, Berat, Tinggi Badan, & Catatan Alergi).
  - **Assessment (A)**: Diagnosa Medis.
  - **Plan (P)**: Rencana Terapi & Edukasi.
- **Resep Obat**: Pemilihan sediaan obat, dosis, frekuensi, dan jumlah unit.
- Alur runtut: Tombol **Selesaikan Pemeriksaan** aktif setelah resep disimpan.

### 5. **Kasir, Pembayaran & Pelaporan**
- Pelunasan pembayaran tagihan konsultasi & obat.
- Cetak Kuitansi Pembayaran Resmi.
- Laporan Klinik: Filter Periode Cepat (**Harian**, **Mingguan**, **Bulanan**, **Custom**), Omzet, Pemakaian Obat, dan **Cetak Laporan PDF Resmi**.

---

## 📂 Struktur Project

```
mini-clinic-information-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Konfigurasi database & Sequelize via process.env
│   │   ├── controllers/     # Controller handler REST API
│   │   ├── middlewares/    # Auth, JWT, & Role Validation middlewares
│   │   ├── models/         # Model Sequelize (User, Patient, Doctor, Policlinic, etc.)
│   │   ├── routes/         # Router Express (/api/auth, /api/patients, /api/queues, etc.)
│   │   ├── services/       # Service layer logika bisnis
│   │   ├── utils/          # Helper response & pagination
│   │   ├── validators/     # Express validator & data sanitizer
│   │   ├── app.js          # Inisialisasi Express & CORS
│   │   └── server.js       # Entry point server HTTP backend
│   ├── migrations/         # Migration database Sequelize
│   ├── seeders/            # Seeder data awal (Membaca kredensial dari process.env)
│   ├── .env.example        # Template variabel lingkungan backend
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Components (Sidebar, Navbar, Modal, FormField, Toast, etc.)
│   │   ├── context/        # AuthContext & ToastContext (Toast Confirm System)
│   │   ├── pages/          # Pages (LoginPage, DashboardPage, PatientsPage, etc.)
│   │   ├── services/       # API Axios client Instance
│   │   ├── App.jsx         # Router & Guarded Routes
│   │   └── main.jsx        # Entry point React Vite
│   ├── .env.example        # Template variabel lingkungan frontend
│   └── package.json
├── database/               # File export database (.sql)
├── postman/                # File Postman Collection (.json)
├── .gitignore              # Memastikan file .env tidak ter-commit
└── README.md               # Dokumentasi utama proyek
```

---

## ⚙️ Template Konfigurasi `.env.example`

Salin file `.env.example` menjadi `.env` pada folder `backend/` dan sesuaikan nilainya di mesin lokal Anda:

### Backend `backend/.env.example`
```env
# =====================================================
# APPLICATION
# =====================================================
NODE_ENV=development
PORT=5000

# =====================================================
# DATABASE (Local PostgreSQL)
# =====================================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_clinic_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

# =====================================================
# DEFAULT SEED ACCOUNTS (ENVIRONMENT VARIABLES)
# =====================================================
SEED_ADMIN_EMAIL=admin@gmail.com
SEED_ADMIN_PASSWORD=your_secure_admin_password

SEED_DOCTOR_EMAIL=doctor@gmail.com
SEED_DOCTOR_PASSWORD=your_secure_doctor_password

SEED_STAFF_EMAIL=staff@gmail.com
SEED_STAFF_PASSWORD=your_secure_staff_password

# =====================================================
# JWT AUTHENTICATION
# =====================================================
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=8h

# =====================================================
# CORS
# =====================================================
FRONTEND_URL=http://localhost:5173
```

### Frontend `frontend/.env.example`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Cara Instalasi Aplikasi

### 1. Clone Repositori Git
```bash
git clone https://github.com/rizallfrm/Mini-Clinic-Apps.git
cd mini-clinic-information-system
```

### 2. Buat File `.env` Lokal
- Di folder `backend/`: salin `.env.example` ke `.env` dan isi password/kunci rahasia lokal Anda.
- Di folder `frontend/`: salin `.env.example` ke `.env`.

### 3. Install Dependensi Backend & Frontend
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 🗄️ Migrasi & Seeding Database

Pastikan database PostgreSQL `mini_clinic_db` telah dibuat di lokal Anda:

```sql
CREATE DATABASE mini_clinic_db;
```

Jalankan perintah berikut di folder `backend/`:

```bash
# 1. Jalankan create tabel database
npx sequelize-cli db:create

# 2. Jalankan migrasi tabel database
npx sequelize-cli db:migrate

# 2. Jalankan seeder data awal (Membaca password admin/dokter dari .env lokal)
npx sequelize-cli db:seed:all
```

---

## 💻 Cara Menjalankan Aplikasi

### 1. Jalankan Backend Server
```bash
cd backend
npm run dev
```
*Backend server berjalan pada `http://localhost:5000`*.

### 2. Jalankan Frontend Client
```bash
cd frontend
npm run dev
```
*Frontend React client berjalan pada `http://localhost:5173`*.

---

## 🔐 Akun Login (Demo Roles)

Email akun demo dan nilai password dikonfigurasi melalui variabel lingkungan (`.env`):

| Role Pengguna | Email Login | Password (Konfigurasi `.env`) | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gmail.com` | `SEED_ADMIN_PASSWORD` | Akses penuh (Master Data, User, Laporan, Poli, Dokter) |
| **Dokter Spesialis** | `doctor@gmail.com` | `SEED_DOCTOR_PASSWORD` | Pemeriksaan SOAP, Resep Obat, Dashboard Dokter |
| **Petugas Pendaftaran** | `staff@gmail.com` | `SEED_STAFF_PASSWORD` | Master Pasien, Pendaftaran Kunjungan, Antrean Live |

---

## 📬 Postman Collection

Dokumentasi REST API lengkap dapat ditemukan pada file `postman/mini_clinic_postman_collection.json`. 
Impor file tersebut ke aplikasi **Postman** untuk melakukan pengujian seluruh endpoint API.
