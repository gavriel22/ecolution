# ECOLUTION PROJECT STATUS

## Project Overview

Ecolution adalah platform pelacakan dan manajemen aktivitas lingkungan hidup berbasis web yang dibangun menggunakan Next.js 16 (App Router), TypeScript, Prisma ORM, dan PostgreSQL. Platform ini bertujuan untuk mendorong masyarakat melakukan aksi ramah lingkungan seperti daur ulang sampah dengan memberikan sistem penghargaan berupa poin. 

Fitur utama yang sudah siap saat ini berfokus pada **Autentikasi Pengguna** dan **Manajemen Aktivitas Lingkungan**, di mana sistem dapat memproses upload foto aktivitas serta mengekstrak metadata EXIF (GPS dan waktu pengambilan foto) secara otomatis untuk memverifikasi keaslian aksi sebelum disetujui oleh Administrator.

## Tech Stack

Teknologi dan library yang digunakan dalam project Ecolution saat ini adalah:
- **Next.js (v16.2.9)** - Framework React untuk App Router dan Route Handlers (API).
- **React (v19.2.4)** - Library UI utama.
- **TypeScript (v5)** - Superset JavaScript untuk pengetikan statis yang aman.
- **Prisma ORM (v6.19.3)** - Toolkit database untuk pemodelan skema dan akses data.
- **PostgreSQL** - Database relasional untuk menyimpan seluruh data platform.
- **Jose (v6.2.3)** - Pustaka penandatanganan dan verifikasi JSON Web Token (JWT).
- **Jsonwebtoken (v9.0.3)** & **@types/jsonwebtoken** - Penanganan token JWT tambahan.
- **Bcrypt (v6.0.0)** - Hashing password pengguna untuk keamanan database.
- **Exifr (v7.1.3)** - Ekstraksi metadata EXIF gambar (untuk data koordinat GPS dan tanggal asli foto).
- **Zod (v4.4.3)** - Validasi skema input untuk data request body.
- **TailwindCSS (v4)** - Framework CSS untuk styling antarmuka.
- **TanStack React Query (v5.101.2)** - Library manajemen state dan fetch data di frontend.

## Folder Structure

Struktur folder penting di dalam `src/` memiliki fungsi sebagai berikut:

- `src/app/api`: Tempat mendefinisikan API Route Handlers menggunakan Next.js App Router (contoh: `/api/auth` dan `/api/activity`).
- `src/services`: Menyimpan logika bisnis (Business Logic Layer) aplikasi yang menjembatani API routes dengan data layer (repositories) serta memvalidasi data request.
- `src/repositories`: Lapisan akses database (Data Access Layer) yang berinteraksi langsung dengan database PostgreSQL melalui client Prisma.
- `src/lib`: Menyimpan instansiasi dan konfigurasi library pihak ketiga maupun instansi singleton (seperti Prisma Client, Logger, EXIF helper, JWT helper, dan in-memory Rate Limiter).
- `src/utils`: Menyimpan fungsi utilitas umum global seperti penanganan custom HTTP errors (`errors.ts`), paginasi standar (`pagination.ts`), dan format respon API terstandarisasi (`response.ts`).
- `src/components`: Folder komponen React yang reusable (saat ini terbagi menjadi folder terstruktur seperti `common`, `forms`, `layout`, dan `ui` tetapi belum memiliki file implementasi).
- `src/features`: Struktur modular untuk memisahkan logika UI, hooks, dan halaman berdasarkan modul bisnis (seperti `auth`, `activity`, `challenge`, `marketplace`, `profile`, dan `reward` yang saat ini folder-foldernya masih kosong).

## Database

Berikut adalah seluruh model Prisma yang terdefinisi di dalam `prisma/schema.prisma` beserta fungsinya:

- **User**: Menyimpan data pengguna platform termasuk informasi autentikasi, status aktif, skor kepercayaan (`trustScore`), total poin (`totalPoint`), serta peran pengguna (`USER`, `UMKM`, `ADMIN`).
- **ActivityCategory**: Kategori aksi ramah lingkungan yang aktif beserta poin hadiah standar yang diberikan per aksi (misal: "Recycling Plastic").
- **Activity**: Menyimpan data log aksi lingkungan yang dikirimkan oleh pengguna (judul, deskripsi, tanggal, lokasi, status verifikasi `PENDING`/`APPROVED`/`REJECTED`, catatan admin).
- **ActivityPhoto**: Menyimpan foto unggahan aktivitas beserta hasil ekstraksi data EXIF (koordinat GPS `latitude` dan `longitude`, timestamp `takenAt`, status kelengkapan EXIF `hasExif`).
- **ActivityVerification**: Menyimpan metadata verifikasi aktivitas (metode verifikasi `MANUAL` atau `AI`, tingkat kepercayaan `confidence`, admin yang memverifikasi, catatan verifikasi).
- **PointHistory**: Mencatat riwayat mutasi poin pengguna (transaksi tipe `EARN`, `REDEEM`, `BONUS`, atau `PENALTY`).
- **ChallengeCategory**: Kategori untuk mengelompokkan tantangan lingkungan.
- **Challenge**: Menyimpan daftar tantangan berhadiah poin dengan status `DRAFT`/`ACTIVE`/`COMPLETED` dan periode waktu tertentu.
- **ChallengeParticipant**: Menyimpan data partisipasi pengguna dalam suatu tantangan serta status penyelesaiannya (`JOINED`/`COMPLETED`/`FAILED`).
- **ChallengeProgress**: Melacak progres nilai aksi pengguna terhadap target dari tantangan yang diikuti.
- **VoucherCategory**: Kategori untuk mengelompokkan jenis voucher belanja.
- **Voucher**: Voucher belanja yang disediakan oleh Merchant yang dapat ditukar dengan poin pengguna.
- **VoucherRedemption**: Catatan penukaran poin pengguna menjadi voucher belanja.
- **Merchant**: Profil bisnis/UMKM yang dimiliki oleh pengguna dengan role `UMKM` atau `ADMIN`.
- **Product**: Produk jualan yang didaftarkan oleh Merchant di marketplace Ecolution.
- **ProductImage**: Foto-foto produk di marketplace.
- **Order**: Data transaksi pembelian produk merchant oleh pengguna.
- **OrderItem**: Rincian produk dan jumlah barang dalam sebuah transaksi order.
- **Account**, **Session**, **RefreshToken**, **VerificationToken**: Menyimpan token sesi dan token refresh untuk autentikasi yang aman.

## Authentication

Sistem autentikasi yang digunakan pada project ini berbasis token JWT dengan detail sebagai berikut:
- **Bearer JWT**: Pengguna mengirimkan token akses JWT melalui header HTTP `Authorization: Bearer <token>` untuk mengakses API yang dilindungi.
- **Access Token**: Dibuat menggunakan library `jose` dengan durasi aktif selama 15 menit. Payload berisi data aman (`id`, `email`, `role`, `username`).
- **Refresh Token**: Dibuat menggunakan library `jose` dengan durasi aktif selama 30 hari. Token disimpan di database pada model `RefreshToken` lengkap dengan info IP address dan User Agent saat login.
- **HttpOnly Cookie**: Token refresh disimpan di peramban sebagai cookie HttpOnly bernama `refresh_token` pada path `/api/auth` untuk keamanan dari serangan XSS.
- **Middleware**: File `src/middleware.ts` mendeteksi rute-rute terproteksi, memvalidasi JWT token dari header Authorization, dan menyuntikkan data pengguna ke dalam header request (`x-user-id`, `x-user-role`, `x-user-email`, `x-user-username`) agar dapat diakses oleh route handler.
- **Authorization & Role**: Melakukan pengecekan role di middleware. Rute `/admin/*` memerlukan role `ADMIN`, dan rute `/merchant/*` memerlukan role `UMKM` atau `ADMIN`. Pada logic endpoint `/approve` dan `/reject`, peran `ADMIN` juga diverifikasi secara ketat.

## API Progress

Perkembangan API Route Handlers saat ini:

### Auth
Status: ✅ Selesai
Endpoint:
- `POST /api/auth/register` - Pendaftaran akun pengguna baru.
- `POST /api/auth/login` - Autentikasi kredensial (dengan rate limit 5x per 15 menit) dan pengembalian token serta set cookie refresh token.
- `POST /api/auth/logout` - Penghapusan token refresh aktif dari database dan penghapusan cookie.
- `POST /api/auth/refresh` - Pengeluaran access token baru menggunakan token refresh yang valid dari cookie.
- `GET /api/auth/me` - Pengambilan data profil pengguna saat ini.

Testing:
- ✅ Sudah lolos Postman (uji coba registrasi, rate limit login, refresh token, dan me profile).

===================

### Activity
Status: ✅ Selesai
Endpoint:
- `GET /api/activity` - Mendapatkan daftar aktivitas milik pengguna dengan paginasi, filter pencarian teks, kategori, status, sorting, dan filter userId (khusus admin).
- `POST /api/activity` - Membuat aktivitas baru dengan upload gambar (multipart) beserta ekstraksi EXIF.
- `GET /api/activity/{id}` - Mendapatkan detail aktivitas tertentu beserta relasi kategori, foto, verifikasi, dan riwayat poin.
- `PUT /api/activity/{id}` - Memperbarui detail aktivitas (hanya jika statusnya masih `PENDING`).
- `DELETE /api/activity/{id}` - Menghapus aktivitas (hanya jika statusnya masih `PENDING`).
- `POST /api/activity/{id}/photo` - Mengunggah/menambahkan URL foto tambahan ke aktivitas yang berstatus `PENDING`.
- `POST /api/activity/{id}/submit` - Mengirimkan aktivitas untuk diproses verifikasi otomatis oleh sistem AI mock.
- `POST /api/activity/{id}/approve` - Menyetujui aktivitas dan memberikan poin reward ke pembuat aktivitas (khusus admin).
- `POST /api/activity/{id}/reject` - Menolak aktivitas dengan menyertakan alasan penolakan (khusus admin).
- `GET /api/activity/categories` - Mendapatkan daftar semua kategori aktivitas lingkungan yang aktif.

Testing:
- ✅ Sudah lolos Postman (uji coba upload foto, ekstraksi GPS/waktu, update, delete, submit, manual approval, dan rejection).

===================

### Marketplace
Status: 🔴 Belum Dibuat
Endpoint:
- Belum ada API route handler yang diimplementasikan.

===================

### Reward
Status: 🔴 Belum Dibuat
Endpoint:
- Belum ada API route handler yang diimplementasikan.

===================

### Challenge
Status: 🔴 Belum Dibuat
Endpoint:
- Belum ada API route handler yang diimplementasikan.

===================

### Merchant
Status: ✅ Selesai
Endpoint:
- `GET /api/merchant` - Mendapatkan daftar merchant berdasarkan role (Admin melihat semua, user biasa melihat approved saja).
- `POST /api/merchant` - Registrasi merchant baru untuk pengguna aktif (default status PENDING).
- `GET /api/merchant/{id}` - Mendapatkan rincian profil merchant.
- `PUT /api/merchant/{id}` - Mengupdate profil merchant (hanya owner).
- `DELETE /api/merchant/{id}` - Menghapus merchant (hanya owner, dilarang jika sudah memiliki produk).
- `POST /api/merchant/{id}/approve` - Menyetujui pendaftaran merchant dan mengubah role owner ke UMKM (Admin only).

Testing:
- ✅ Sudah lolos Postman (registrasi merchant, list, update, delete, dan approval admin).

===================

### Dashboard
Status: 🔴 Belum Dibuat
Endpoint:
- Belum ada API route handler yang diimplementasikan.

## Yang Sudah Berhasil

Fitur-fitur yang sudah diimplementasikan di sisi backend API:
- [x] Registrasi pengguna (`POST /api/auth/register`) dengan validasi email/username unik.
- [x] Login pengguna (`POST /api/auth/login`) dengan hashing password bcrypt.
- [x] Rate limiting login (maksimal 5 kali percobaan per IP per 15 menit).
- [x] Manajemen session via HTTP-Only cookie untuk refresh token.
- [x] Refresh access token (`POST /api/auth/refresh`) dan logout (`POST /api/auth/logout`).
- [x] Verifikasi otentikasi token via Next.js Middleware.
- [x] Pengambilan detail profile user login (`GET /api/auth/me`).
- [x] Seeding database untuk data awal (Admin, Users, Activity Categories, Challenge Categories, Voucher Categories, Merchants, Products).
- [x] Listing aktivitas dengan filter pencarian, status, kategori, dan paginasi standar (`GET /api/activity`).
- [x] Listing kategori aktivitas ramah lingkungan (`GET /api/activity/categories`).
- [x] Unggah aktivitas ramah lingkungan baru dengan ekstraksi GPS metadata EXIF (`POST /api/activity`).
- [x] Ambil detail aktivitas spesifik beserta relasi data terkait (`GET /api/activity/{id}`).
- [x] Update dan Hapus aktivitas jika status masih `PENDING`.
- [x] Unggah URL foto tambahan untuk aktivitas (`POST /api/activity/{id}/photo`).
- [x] Mock AI Verification saat melakukan submit aktivitas (`POST /api/activity/{id}/submit`).
- [x] Persetujuan aktivitas oleh Admin dan penambahan poin reward secara transaksional (`POST /api/activity/{id}/approve`).
- [x] Penolakan aktivitas oleh Admin disertai input alasan penolakan (`POST /api/activity/{id}/reject`).
- [x] Pendaftaran Merchant baru (`POST /api/merchant`) dengan validasi keunikan profil per user.
- [x] Listing Merchant (`GET /api/merchant`) terproteksi role (Admin melihat semua, user biasa melihat approved saja).
- [x] Detail profil Merchant (`GET /api/merchant/{id}`) untuk owner/admin/approved.
- [x] Update profil Merchant (`PUT /api/merchant/{id}`) hanya oleh owner (dilarang merubah ownerId / status).
- [x] Hapus merchant (`DELETE /api/merchant/{id}`) hanya oleh owner (dilarang jika sudah memiliki produk).
- [x] Persetujuan Merchant oleh Admin (`POST /api/merchant/{id}/approve`) serta otomatis meng-upgrade role user terkait ke UMKM.


## Yang Sedang Dikerjakan

- **Integrasi Frontend untuk Auth & Activity**: Menyiapkan struktur halaman dan hooks TanStack Query di folder `src/features/auth` dan `src/features/activity` untuk terhubung dengan API endpoint yang sudah selesai dibuat.

## Yang Belum Dibuat

Modul-modul berikut belum memiliki implementasi endpoint API (Route Handlers), Services, maupun Repositories:
- **Modul Marketplace**: Manajemen produk UMKM (CRUD produk, list produk, detail produk) dan transaksi pembelian produk (order & order items).
- **Modul Reward**: Manajemen voucher belanja dari merchant (CRUD voucher) dan penukaran poin user untuk mendapatkan kode voucher belanja.
- **Modul Challenge**: List tantangan aktif, bergabung ke tantangan, tracking progres tantangan secara berkala saat aktivitas disetujui.
- **Modul Dashboard**: Perhitungan analitik dashboard (total aktivitas, poin beredar, total merchant, dll.) untuk user, UMKM, dan admin.
- **Halaman UI/Frontend**: Seluruh UI di `src/features/` (termasuk modul Auth, Activity, dan Merchant yang masih berupa folder kosong).

## Testing Status

Rincian hasil pengujian manual API Backend menggunakan Postman:

- [x] Register (`POST /api/auth/register`)
- [x] Login (`POST /api/auth/login`)
- [x] Refresh Token (`POST /api/auth/refresh`)
- [x] Logout (`POST /api/auth/logout`)
- [x] Get Profile (`GET /api/auth/me`)
- [x] List Activities (`GET /api/activity`)
- [x] List Activity Categories (`GET /api/activity/categories`)
- [x] Create Activity & Upload (`POST /api/activity`)
- [x] Get Activity Detail (`GET /api/activity/{id}`)
- [x] Update Activity (`PUT /api/activity/{id}`)
- [x] Delete Activity (`DELETE /api/activity/{id}`)
- [x] Add Photo (`POST /api/activity/{id}/photo`)
- [x] Submit Activity (`POST /api/activity/{id}/submit`)
- [x] Approve Activity (`POST /api/activity/{id}/approve`)
- [x] Reject Activity (`POST /api/activity/{id}/reject`)
- [x] Register Merchant (`POST /api/merchant`)
- [x] Get Merchant List (`GET /api/merchant`)
- [x] Get Merchant Detail (`GET /api/merchant/{id}`)
- [x] Update Merchant Profile (`PUT /api/merchant/{id}`)
- [x] Delete Merchant (`DELETE /api/merchant/{id}`)
- [x] Approve Merchant (`POST /api/merchant/{id}/approve`)

## Next Sprint Recommendation

Berikut adalah usulan prioritas pengerjaan modul berikutnya berdasarkan ketergantungan antar modul dalam codebase saat ini:

### Sprint 1: Frontend Auth & Activity & Merchant Integration
*Fokus pada penyelesaian visual agar API yang sudah selesai dapat langsung dicoba secara visual oleh pengguna.*
- Membuat UI Register & Login di `src/features/auth`.
- Membuat UI Dashboard Aktivitas Lingkungan, form upload, dan detail aktivitas di `src/features/activity`.
- Membuat UI Profil Merchant & Dashboard Merchant di `src/features/merchant`.
- Integrasi middleware autentikasi Next.js untuk proteksi rute halaman client.

### Sprint 2: Merchant Module & Profiling UMKM (Selesai - Backend)
*Pemberian verifikasi merchant oleh admin serta manajemen profil merchant sudah selesai diimplementasikan.*

### Sprint 3: Marketplace & Products Module
*UMKM yang tervalidasi dapat menjual produk.*
- Membuat repository dan service untuk `Product` & `Order`.
- Membuat API route CRUD produk dan upload gambar produk merchant.
- Membuat API route checkout transaksi produk (Order & OrderItems).

### Sprint 4: Reward & Vouchers Module
*Menghubungkan poin yang didapatkan dari aktivitas dengan voucher merchant.*
- Membuat repository dan service untuk `Voucher` & `VoucherRedemption`.
- Membuat API route manajemen voucher merchant.
- Membuat API route penukaran poin menjadi voucher belanja (`POST /api/rewards/redeem`).

### Sprint 5: Challenge Module
*Menambah gamifikasi sistem agar pengguna mendapatkan bonus poin.*
- Membuat repository dan service untuk `Challenge` & `ChallengeParticipant`.
- Membuat API route partisipasi tantangan dan kalkulasi progres aktivitas user secara otomatis ketika status aktivitas berubah menjadi `APPROVED`.

### Sprint 6: Analytics & Dashboard Module
*Pelaporan data keseluruhan untuk admin dan merchant.*
- Membuat API route untuk agregasi dashboard (jumlah poin, aksi disetujui, penjualan merchant, statistik kepercayaan pengguna).
