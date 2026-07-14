# 📦 Panduan Instalasi KampusX

Dokumen ini berisi langkah-langkah lengkap untuk menginstal dan menjalankan project **KampusX** dari file `kampusx-main.zip`.

---

## 📋 Prasyarat (Prerequisites)

Pastikan software berikut sudah terinstal di komputer kamu:

| Software        | Versi Minimum | Keterangan                              |
|-----------------|---------------|-----------------------------------------|
| **PHP**         | 8.2+          | Wajib untuk Laravel 12                  |
| **Composer**    | 2.x           | Package manager PHP                     |
| **Node.js**     | 18+           | Runtime JavaScript (disarankan v20 LTS) |
| **npm**         | 9+            | Sudah terinstal bersama Node.js         |
| **MySQL**       | 8.0+          | Database (atau MariaDB 10.6+)           |
| **Git**         | 2.x           | Opsional, untuk version control         |

### 💡 Rekomendasi: Gunakan Laragon (Windows)

Jika kamu menggunakan **Windows**, kami sangat merekomendasikan **[Laragon](https://laragon.org/download/)**. Laragon sudah termasuk PHP, MySQL, Composer, dan Node.js dalam satu paket.

---

## 🚀 Langkah-Langkah Instalasi

### Step 1: Extract File ZIP

1. Download atau terima file `kampusx-main.zip`
2. Extract file ke folder yang diinginkan, contoh:
   ```
   D:\laragon\www\kampusx
   ```
3. Setelah extract, struktur folder seharusnya seperti ini:
   ```
   kampusx/
   ├── backend/          ← Laravel API (PHP)
   ├── frontend/         ← React + Vite (JavaScript)
   ├── README.md
   ├── package.json
   └── .gitignore
   ```

---

### Step 2: Setup Backend (Laravel)

Buka **Terminal / Command Prompt / PowerShell**, lalu jalankan perintah berikut secara berurutan:

#### 2.1 — Masuk ke folder backend

```bash
cd kampusx/backend
```

#### 2.2 — Install dependencies PHP

```bash
composer install
```

> ⏳ Proses ini akan mengunduh semua package PHP yang diperlukan ke folder `vendor/`. Tunggu sampai selesai.

#### 2.3 — Buat file `.env`

Salin file `.env.example` menjadi `.env`:

```bash
# Windows (CMD)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

#### 2.4 — Konfigurasi `.env`

Buka file `backend/.env` dengan text editor, lalu sesuaikan bagian **database**:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kampusx
DB_USERNAME=root
DB_PASSWORD=
```

> **Catatan:**
> - `DB_DATABASE=kampusx` → nama database yang akan dibuat di Step 3
> - `DB_USERNAME=root` & `DB_PASSWORD=` → default untuk Laragon/XAMPP
> - Jika kamu punya password MySQL, isi di `DB_PASSWORD`

Pastikan juga bagian **CORS & Frontend URL** sesuai untuk development:

```env
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### 2.5 — Generate Application Key

```bash
php artisan key:generate
```

#### 2.6 — Buat Storage Link

```bash
php artisan storage:link
```

> Ini membuat symlink dari `public/storage` ke `storage/app/public` agar file upload bisa diakses via URL.

---

### Step 3: Setup Database

#### 3.1 — Buat Database

Buat database baru bernama `kampusx` menggunakan salah satu cara berikut:

**Cara A — Via Terminal (MySQL CLI):**
```bash
mysql -u root -p
```
```sql
CREATE DATABASE kampusx;
EXIT;
```

**Cara B — Via phpMyAdmin (Laragon/XAMPP):**
1. Buka browser → akses `http://localhost/phpmyadmin`
2. Klik tab **"Database"** / **"Basis Data"**
3. Ketik `kampusx` di kolom nama database
4. Klik **"Create"** / **"Buat"**

**Cara C — Via Laragon (Paling Mudah):**
1. Klik kanan icon **Laragon** di system tray
2. Pilih **MySQL** → **Create database**
3. Ketik `kampusx` → OK

#### 3.2 — Jalankan Migration

Kembali ke terminal (pastikan masih di folder `backend`):

```bash
php artisan migrate
```

> Perintah ini akan membuat semua tabel yang diperlukan di database `kampusx`.

#### 3.3 — Jalankan Seeder (Data Awal)

```bash
php artisan db:seed
```

> Perintah ini akan mengisi database dengan data dummy (akun demo, kategori, institusi, event contoh, dll).

> **💡 Shortcut:** Kamu bisa menjalankan migration + seeder sekaligus dengan:
> ```bash
> php artisan migrate --seed
> ```

---

### Step 4: Setup Frontend (React + Vite)

Buka **terminal baru** (jangan tutup terminal backend), lalu:

#### 4.1 — Masuk ke folder frontend

```bash
cd kampusx/frontend
```

#### 4.2 — Install dependencies JavaScript

```bash
npm install
```

> ⏳ Proses ini akan mengunduh semua package JavaScript ke folder `node_modules/`. Tunggu sampai selesai.

#### 4.3 — Konfigurasi `.env` Frontend

Buat file `.env` di folder `frontend/` dengan isi berikut:

```env
VITE_MIDTRANS_CLIENT_KEY=Mid-client-DDYahHeTEDftdeVG
VITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js

# Development (Local)
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_STORAGE_URL=http://127.0.0.1:8000/storage
```

> **Penting:** Pastikan URL mengarah ke `http://127.0.0.1:8000` (port default Laravel).

---

### Step 5: Jalankan Aplikasi 🎉

Kamu perlu menjalankan **2 server** secara bersamaan (backend & frontend). Gunakan **2 terminal terpisah**:

#### Terminal 1 — Backend (Laravel)

```bash
cd kampusx/backend
php artisan serve
```

> ✅ Backend akan berjalan di: **http://127.0.0.1:8000**

#### Terminal 2 — Frontend (React + Vite)

```bash
cd kampusx/frontend
npm run dev
```

> ✅ Frontend akan berjalan di: **http://localhost:5173**

#### 🌐 Buka Aplikasi

Buka browser dan akses:

```
http://localhost:5173
```

**Selamat! KampusX sudah berjalan di komputer kamu! 🎓🎉**

---

## ⚡ Quick Start (Ringkasan Cepat)

Bagi yang sudah paham, berikut ringkasan semua perintah:

```bash
# ── Backend ──────────────────────────────
cd kampusx/backend
composer install
copy .env.example .env          # Windows CMD
php artisan key:generate
php artisan storage:link

# Buat database "kampusx" via phpMyAdmin/CLI

php artisan migrate --seed
php artisan serve

# ── Frontend (terminal baru) ─────────────
cd kampusx/frontend
npm install
# Buat file .env (lihat panduan di atas)
npm run dev

# ── Buka browser ─────────────────────────
# http://localhost:5173
```

---

## 🔧 Queue Worker (Opsional — Untuk Fitur Email & Notifikasi)

KampusX menggunakan **queue** untuk mengirim email dan notifikasi. Jika ingin fitur ini berfungsi, buka **terminal ketiga**:

```bash
cd kampusx/backend
php artisan queue:listen --tries=1 --timeout=0
```

---

## 🐛 Troubleshooting

### ❌ `composer install` gagal
- Pastikan PHP versi 8.2+ → cek dengan `php -v`
- Pastikan extension PHP aktif: `mbstring`, `xml`, `curl`, `zip`, `gd`, `mysql`
- Di Laragon, klik **Menu** → **PHP** → pilih versi 8.2+

### ❌ `npm install` gagal
- Pastikan Node.js versi 18+ → cek dengan `node -v`
- Hapus `node_modules` dan `package-lock.json`, lalu jalankan ulang `npm install`

### ❌ `php artisan migrate` gagal — "Access denied" atau "Connection refused"
- Pastikan MySQL sudah berjalan (cek di Laragon/XAMPP)
- Pastikan kredensial database di `.env` sudah benar
- Pastikan database `kampusx` sudah dibuat

### ❌ Frontend tidak bisa konek ke backend — "Network Error" atau CORS error
- Pastikan backend (`php artisan serve`) sudah berjalan
- Pastikan `.env` frontend mengarah ke `http://127.0.0.1:8000`
- Pastikan `.env` backend memiliki `CORS_ALLOWED_ORIGINS=http://localhost:5173`

### ❌ Gambar/file tidak muncul
- Jalankan `php artisan storage:link` di folder backend
- Pastikan folder `storage/app/public` bisa diakses

### ❌ Port sudah dipakai
- Backend: `php artisan serve --port=8001` (ganti port)
- Frontend: Vite otomatis pindah ke port lain jika 5173 sudah terpakai

---

## 📂 Struktur Project

```
kampusx/
├── backend/                 ← Laravel 12 (REST API)
│   ├── app/                 ← Logic aplikasi (Controllers, Models, dll)
│   ├── config/              ← Konfigurasi Laravel
│   ├── database/
│   │   ├── migrations/      ← Skema tabel database
│   │   └── seeders/         ← Data awal (dummy data)
│   ├── routes/              ← Definisi API routes
│   ├── storage/             ← File upload & cache
│   ├── .env                 ← Konfigurasi environment (JANGAN commit!)
│   ├── composer.json        ← Dependencies PHP
│   └── artisan              ← CLI tool Laravel
│
├── frontend/                ← React 19 + Vite 7 (SPA)
│   ├── src/                 ← Source code React
│   ├── public/              ← Static assets
│   ├── .env                 ← Konfigurasi environment (JANGAN commit!)
│   ├── package.json         ← Dependencies JavaScript
│   └── vite.config.ts       ← Konfigurasi Vite
│
├── README.md                ← Deskripsi project
└── INSTALLATION.md          ← File ini!
```

---

## 📌 Catatan Penting

1. **Jangan commit file `.env`** — File ini berisi kredensial sensitif dan sudah dimasukkan ke `.gitignore`
2. **Folder `node_modules/` dan `vendor/`** tidak perlu di-commit — Sudah di-`.gitignore`, tinggal jalankan `composer install` dan `npm install`
3. **Midtrans** menggunakan mode **Sandbox** (testing) — Tidak ada transaksi uang sungguhan
4. **Queue Worker** diperlukan agar email (verifikasi, reset password) dan notifikasi berfungsi
