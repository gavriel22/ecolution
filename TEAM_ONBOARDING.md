# TEAM ONBOARDING - ECOLUTION

Dokumentasi ini dibuat khusus untuk mempermudah onboarding anggota tim baru yang bergabung ke dalam project Ecolution. Seluruh informasi di bawah ini disesuaikan dengan kondisi source code dan arsitektur rill yang digunakan saat ini.

---

## 1. Gambaran Project

Ecolution adalah platform berbasis web untuk melacak dan memverifikasi aksi pelestarian lingkungan (misalnya pengumpulan sampah plastik, penanaman pohon) oleh pengguna dengan imbalan poin reward. Poin ini nantinya dapat ditukarkan dengan produk atau voucher belanja yang disediakan oleh UMKM (Merchant) lokal.

### Tech Stack Utama
- **Framework**: Next.js 16.2.9 (App Router)
- **Library UI**: React 19.2.4 & TailwindCSS 4
- **Bahasa Pemrograman**: TypeScript (strict types)
- **Database & ORM**: PostgreSQL & Prisma ORM v6.19.3
- **Autentikasi**: JWT (JSON Web Tokens) menggunakan library `jose` & `jsonwebtoken`
- **Keamanan**: Bcrypt (password hashing) & Rate Limiting (in-memory)
- **Validasi Data**: Zod
- **Ekstraksi Metadata Gambar**: Exifr (untuk validasi EXIF GPS & waktu foto)
- **State Management (Client)**: TanStack React Query v5

---

## 2. Struktur Folder

Project Ecolution terbagi menjadi struktur direktori berikut di dalam root folder:

- **`src/app`**: Folder utama Next.js App Router untuk routing halaman frontend.
- **`src/app/api`**: Rute backend (Route Handlers) yang memproses request API dari client (misal: `/api/auth` dan `/api/activity`).
- **`src/services`**: Lapisan Logika Bisnis (Business Logic Layer). Berfungsi memproses logika inti, melakukan validasi schema Zod, mengekstrak data EXIF gambar, dan mengelola alur poin.
- **`src/repositories`**: Lapisan Akses Database (Data Access Layer). Berisi query terisolasi ke database PostgreSQL menggunakan Prisma Client.
- **`src/lib`**: Konfigurasi library instansi tunggal (singleton) seperti client database (`prisma.ts`), parser EXIF (`exif.ts`), utilitas JWT (`jwt.ts`), logger (`logger.ts`), dan rate-limiter (`rate-limit.ts`).
- **`src/utils`**: Utilitas global yang berisi definisi custom error (`errors.ts`), perhitungan paginasi (`pagination.ts`), dan format standarisasi respon JSON (`response.ts`).
- **`prisma`**: Konfigurasi database Prisma yang memuat `schema.prisma`, file-file migrasi, serta folder seed (`seed.ts` dan `seeds/*`) untuk menginisialisasi database dengan data awal.
- **`public`**: Menyimpan aset statis global (seperti logo SVG) yang dapat diakses langsung oleh peramban.
- **`assets`**: Direktori penyimpanan aset desain mentah atau dokumentasi visual.
- **`docs`**: Dokumentasi internal tim (proposal, SDD, riset keputusan teknis) dan folder `docs/openapi` / `openapi` yang memuat OpenAPI spec.
- **`design`**: Berisi aset desain UI/UX.

> [!NOTE]
> Folder `src/components` ( common, forms, layout, ui ) dan subfolder di `src/features` ( auth, activity, dll. ) saat ini masih berupa folder kosong/placeholder untuk pengerjaan frontend di masa mendatang. Validasi input API dilakukan di dalam lapisan **Service** menggunakan library Zod, sehingga folder `src/validations` secara terpisah tidak digunakan dalam project ini.

---

## 3. Cara Setup Project

Ikuti langkah-langkah berikut untuk menjalankan project di perangkat lokal Anda:

### Langkah 1: Clone Repository
```bash
git clone <repo-url>
cd ecolution
```

### Langkah 2: Install Dependencies
```bash
npm install
```

### Langkah 3: Konfigurasi Environment Variables
Salin file `.env` dan sesuaikan nilainya (lihat bagian [4. Environment Variable](#4-environment-variable)).
```bash
cp .env.example .env
```

### Langkah 4: Generate Prisma Client
Generate tipe TypeScript dari database schema Prisma agar dapat digunakan oleh IDE Anda.
```bash
npx prisma generate
```

### Langkah 5: Jalankan Migrasi Database
Jalankan migrasi untuk membuat tabel-tabel database di PostgreSQL lokal/cloud Anda.
```bash
npx prisma migrate dev
```

### Langkah 6: Seeding Database
Isi database dengan data awal (data Admin, User dummy, Kategori Aktivitas, Tantangan, dan Kategori Voucher).
```bash
npm run prisma:seed
```

### Langkah 7: Jalankan Development Server
```bash
npm run dev
```
Aplikasi backend/frontend akan berjalan di [http://localhost:3000](http://localhost:3000).

### Perintah Penting Lainnya:
- **Build untuk Production**: `npm run build`
- **Linting & Kode**: `npm run lint`
- **Check TypeScript Compile**: `npx tsc --noEmit`

---

## 4. Environment Variable

Aplikasi membutuhkan file `.env` di root direktori dengan variabel-variabel berikut:

- `DATABASE_URL`: URI koneksi database PostgreSQL (wajib valid).
- `JWT_ACCESS_SECRET`: Kunci rahasia untuk menandatangani Access Token JWT.
- `JWT_REFRESH_SECRET`: Kunci rahasia untuk menandatangani Refresh Token JWT.
- `ACCESS_TOKEN_EXPIRES`: Durasi kedaluwarsa Access Token (opsional, bawaan: `15m`).
- `REFRESH_TOKEN_EXPIRES`: Durasi kedaluwarsa Refresh Token (opsional, bawaan: `30d`).
- `NODE_ENV`: Mode server, bernilai `development`, `production`, atau `test` (bawaan: `development`).

---

## 5. Arsitektur Backend

Project ini mengadopsi pola arsitektur berlapis (layered architecture) dengan alur data sebagai berikut:

```
[Request HTTP]
      ↓
[Middleware] ──────────── Validasi token JWT & injeksi header pengguna
      ↓
[Route Handler] ───────── Parsing URL parameter & body request
      ↓
[Service Layer] ───────── Validasi Zod schema, ekstraksi EXIF, logika bisnis
      ↓
[Repository Layer] ────── Eksekusi query database menggunakan Prisma Client
      ↓
[Database PostgreSQL]
```

### Penanganan Respon
Seluruh endpoint di rute API harus membungkus responnya menggunakan fungsi utilitas terpusat:
- Respon Sukses: `successResponse(data, statusCode, meta)` (akan menghasilkan JSON `{ success: true, data: ... }`).
- Respon Error: Ditangkap di blok `catch` pada Route Handler dan diteruskan ke `errorResponse(error)`. Fungsi ini akan otomatis membaca tipe error (misal: `AppError`, `ValidationError`, `NotFoundError`) dan menghasilkan JSON `{ success: false, error: { code, message, details } }`.

---

## 6. Authentication & Authorization

Autentikasi di platform Ecolution didesain secara hibrida menggunakan Token JWT:

1. **Access Token (JWT)**: Token berumur pendek (15 menit) yang dikirimkan client melalui header HTTP `Authorization: Bearer <token>` untuk mengakses API terproteksi.
2. **Refresh Token**: Token berumur panjang (30 hari) yang disimpan di database (model `RefreshToken`) dan dikirimkan oleh browser secara otomatis melalui cookie HttpOnly berlabel `refresh_token` ke jalur `/api/auth/*`.
3. **Middleware**: File `src/middleware.ts` memproteksi rute `/admin`, `/merchant`, `/dashboard`, `/api/auth/me`, dan `/api/activity/*`. Jika token valid, middleware akan menyuntikkan informasi pengguna ke dalam header request:
   - `x-user-id` (ID pengguna)
   - `x-user-role` (Role pengguna: `USER`, `UMKM`, `ADMIN`)
   - `x-user-email` (Email pengguna)
   - `x-user-username` (Username pengguna)
4. **Otorisasi Berbasis Peran**: Middleware menolak akses rute `/admin` jika role bukan `ADMIN`, dan menolak rute `/merchant` jika role bukan `UMKM` atau `ADMIN`.

---

## 7. Database Skema & Relasi

Platform ini memiliki skema database yang memetakan hubungan entitas utama:

- **Pengguna (`User`) & Sesi**: Memiliki relasi ke `RefreshToken` (1-to-many), `Session`, dan `Account`.
- **Aktivitas & Kategori**:
  - `ActivityCategory` memiliki relasi 1-to-many ke `Activity`.
  - `Activity` terhubung ke pembuatnya (`User`) dan kategori (`ActivityCategory`).
  - `Activity` memiliki relasi 1-to-many ke `ActivityPhoto` (menyimpan URL foto serta koordinat GPS).
  - `Activity` memiliki relasi 1-to-1 ke `ActivityVerification` (data review AI/Manual) dan `PointHistory` (riwayat perolehan poin).
- **Merchant & Toko**:
  - `Merchant` terhubung 1-to-1 dengan pemiliknya (`User` dengan role `UMKM`).
  - `Merchant` memiliki relasi 1-to-many ke `Product` (produk jualan) dan `Voucher` (penukaran poin).
- **Transaksi & Pembelian**:
  - `Order` mencatat pembelian barang oleh `User` dan terhubung ke `OrderItem`.
  - `VoucherRedemption` mencatat klaim voucher oleh `User`.
- **Tantangan (`Challenge`)**:
  - `Challenge` dikelompokkan oleh `ChallengeCategory` dan memiliki relasi ke `ChallengeParticipant` dan `ChallengeProgress`.

---

## 8. API Module

Berikut adalah seluruh endpoint API Backend yang **benar-benar ada** dan aktif di project saat ini:

### Module: Auth
- `POST /api/auth/register` - Registrasi pengguna baru.
- `POST /api/auth/login` - Login pengguna (mengembalikan Access Token & set cookie Refresh Token).
- `POST /api/auth/logout` - Logout pengguna (menghapus cookie & mencabut refresh token).
- `POST /api/auth/refresh` - Refresh access token menggunakan refresh token cookie.
- `GET /api/auth/me` - Mendapatkan informasi profil pengguna aktif.

### Module: Activity
- `GET /api/activity` - List semua aktivitas (Mendukung paginasi, filter kategori, status, dan pencarian).
- `POST /api/activity` - Membuat aktivitas baru dengan upload file gambar (form-data).
- `GET /api/activity/{id}` - Mendapatkan detail lengkap satu aktivitas beserta relasi fotonya.
- `PUT /api/activity/{id}` - Memperbarui teks judul/deskripsi aktivitas yang masih berstatus `PENDING`.
- `DELETE /api/activity/{id}` - Menghapus aktivitas yang masih berstatus `PENDING`.
- `POST /api/activity/{id}/photo` - Menambahkan URL foto tambahan ke aktivitas yang berstatus `PENDING`.
- `POST /api/activity/{id}/submit` - Mengirim aktivitas untuk dievaluasi oleh sistem Mock AI.
- `POST /api/activity/{id}/approve` - Menyetujui aktivitas dan mencairkan poin reward (Khusus Admin).
- `POST /api/activity/{id}/reject` - Menolak aktivitas dengan menyertakan alasan (Khusus Admin).

### Module: Category
- `GET /api/activity/categories` - Mendapatkan semua kategori aktivitas aktif.

---

## 9. Cara Testing

### Pengujian dengan Postman
1. **Jalankan Aplikasi**: Pastikan server lokal berjalan (`npm run dev`).
2. **Import Dokumentasi**: Import file dokumentasi OpenAPI yang terletak di `openapi/openapi.yaml` atau `docs/openapi.yaml` ke aplikasi Postman Anda.
3. **Pengujian Endpoint Terproteksi**:
   - Jalankan request **Login** terlebih dahulu untuk mendapatkan `accessToken`.
   - Copy token tersebut, lalu pada endpoint terproteksi (seperti `GET /api/auth/me`), masuk ke tab **Authorization**, pilih tipe **Bearer Token**, dan tempelkan token Anda di sana.
4. **Pengujian Upload Foto**:
   - Pada request `POST /api/activity`, gunakan tab **Body -> form-data**.
   - Set key `image` dengan tipe **File**, lalu pilih gambar JPEG/PNG yang memiliki metadata GPS (jika ingin berstatus `PENDING`), atau tanpa metadata (jika ingin menguji status otomatis `REJECTED`).

---

## 10. Git Workflow

Seluruh anggota tim wajib mematuhi workflow kolaborasi Git berikut:

1. **Sinkronisasi**: Pastikan branch utama Anda selalu ter-update dengan perubahan terbaru di server:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Buat Branch Baru**: Buat branch kerja lokal dengan penamaan konvensi `feature/nama-fitur` atau `bugfix/nama-bug`:
   ```bash
   git checkout -b feature/auth-forgot-password
   ```
3. **Commit Perubahan**: Komit perubahan Anda dengan pesan yang jelas menggunakan format Conventional Commits:
   ```bash
   git add .
   git commit -m "feat(auth): add forgot password endpoint logic"
   ```
4. **Push & Buat Pull Request**: Push branch lokal Anda ke server remote dan buka Pull Request (PR) di GitHub:
   ```bash
   git push origin feature/auth-forgot-password
   ```
5. **Code Review**: PR harus ditinjau dan disetujui minimal oleh 1 developer lain sebelum di-merge ke branch `main`.

---

## 11. Coding Convention

- **TypeScript Strict**: Hindari penggunaan tipe data `any`. Tulis tipe kembalian fungsi dan gunakan interface Prisma yang sudah di-generate secara otomatis.
- **Pemisahan Tanggung Jawab**: Jangan menuliskan logika bisnis atau query database langsung di dalam rute API (`src/app/api`).
  - Request parsing & respon format: **Route Handler**
  - Validasi schema, data parsing, kalkulasi: **Service**
  - Operasi insert/update/delete database: **Repository**
- **Error Handling**: Gunakan class error terpusat dari `src/utils/errors.ts` (contoh: `throw new ValidationError("Pesan error")`). Middleware/handler akan otomatis mengonversinya menjadi respon HTTP yang tepat.
- **Konvensi Nama File**:
  - Services: `nama-modul.service.ts` (contoh: `auth.service.ts`)
  - Repositories: `nama-modul.repository.ts` (contoh: `user.repository.ts`)
  - Route files Next.js: `route.ts`

---

## 12. Status Project

Berikut adalah rangkuman kesiapan project Ecolution saat ini:

- **Fitur yang Sudah Selesai (Backend API)**:
  - Autentikasi Pengguna lengkap (Register, Login, Rate Limiting Login, Logout, Refresh Token cookie, Get Profile).
  - Manajemen Aktivitas lingkungan (Create dengan EXIF extractor, Get detail, List dengan filter & paginasi, Update/Delete PENDING activity).
  - Verifikasi aktivitas (AI Mock verification, manual approval & rejection oleh Admin, serta penambahan poin reward).
  - Skema Relasi Database Prisma & Seeder lengkap.
- **Fitur yang Sedang Dikerjakan**:
  - Persiapan UI/Frontend di dalam Next.js client-side untuk modul Autentikasi & Aktivitas.
- **Fitur yang Belum Ada**:
  - Backend API & UI Frontend untuk modul Merchant/UMKM.
  - Backend API & UI Frontend untuk modul Marketplace Produk.
  - Backend API & UI Frontend untuk modul Rewards & Penukaran Voucher.
  - Backend API & UI Frontend untuk modul Tantangan (Challenge).
  - Visual dashboard analitik pengguna, UMKM, dan Admin.

---

## 13. Troubleshooting

### 1. Error: Prisma Client Out of Sync
*Gejala*: TypeScript error atau Prisma mengeluh skema tidak cocok saat query.
*Solusi*: Jalankan generate ulang client:
```bash
npx prisma generate
```

### 2. Error: Koneksi Database Gagal / Migrasi Nyangkut
*Gejala*: Server crash dengan pesan error database connection timeout atau migrasi gagal diaplikasikan.
*Solusi*: Periksa apakah `DATABASE_URL` di `.env` sudah benar dan database PostgreSQL lokal/cloud Anda aktif. Jika database kotor saat development, Anda bisa meresetnya dengan:
```bash
npx prisma migrate reset
```

### 3. Error: Token Validasi Gagal / Selalu Unauthorized
*Gejala*: Request API terproteksi mengembalikan error status 401 secara terus-menerus.
*Solusi*: Pastikan Anda melampirkan token di header `Authorization` dengan format `Bearer <token>`. Pastikan pula nilai `JWT_ACCESS_SECRET` di `.env` tidak berubah. Jika masa aktif access token habis, kirim request `/api/auth/refresh` untuk memperbarui token.

### 4. Error: Pengecekan Rate Limit Login Diblokir
*Gejala*: Endpoint login mengembalikan status 429 (Too Many Requests).
*Solusi*: Ini adalah fitur keamanan login (maksimal 5 kali percobaan per IP per 15 menit). Untuk testing lokal, Anda dapat menunggu waktu cooldown habis, mengganti IP, atau menyesuaikan sementara variabel window rate limit di file `src/app/api/auth/login/route.ts` saat pengembangan lokal.
