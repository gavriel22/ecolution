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
- `src/components`: Folder komponen React yang reusable, termasuk komponen tata letak utama (`layout/app-layout.tsx`) untuk sidebar navigasi dan autentikasi.
- `src/features`: Struktur modular untuk memisahkan logika UI, hooks, tipe, dan komponen berdasarkan modul bisnis. Modul `auth` (login, register, logout hooks) dan `activity` (hooks, form, list, detail, status-badge, summary) saat ini telah diimplementasikan penuh.

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
Status: ✅ Selesai
Endpoint:
- `GET /api/product` - Mendapatkan daftar produk dengan filter pencarian, harga, merchant, status, sorting, dan paginasi.
- `POST /api/product` - Menambahkan produk baru (khusus UMKM/Mitra yang disetujui).
- `GET /api/product/{id}` - Mendapatkan detail lengkap suatu produk beserta relasi gambar.
- `PUT /api/product/{id}` - Memperbarui detail produk (khusus pemilik/owner).
- `DELETE /api/product/{id}` - Menghapus produk (khusus pemilik/owner).
- `POST /api/order` - Membuat transaksi pembelian produk (checkout) secara transaksional dengan pengurangan stok otomatis.
- `GET /api/order` - Mendapatkan daftar riwayat transaksi pembelian milik user.
- `GET /api/order/{id}` - Mendapatkan detail transaksi pembelian tertentu beserta rincian produk.

===================

### Reward
Status: ✅ Selesai
Endpoint:
- `GET /api/voucher` - Mendapatkan daftar semua voucher belanja yang tersedia dengan filter.
- `POST /api/voucher` - Membuat voucher belanja baru (khusus UMKM/Mitra yang disetujui).
- `GET /api/voucher/{id}` - Mendapatkan detail lengkap voucher belanja.
- `PUT /api/voucher/{id}` - Memperbarui detail voucher belanja (khusus pemilik/owner).
- `DELETE /api/voucher/{id}` - Menghapus voucher belanja (khusus pemilik/owner).
- `POST /api/reward/redeem` - Menukar poin user dengan kode voucher digital secara transaksional (Prisma transaction) dengan pengurangan poin user, stock voucher, dan pencatatan riwayat poin.
- `GET /api/reward/history` - Mendapatkan daftar riwayat penukaran voucher milik user.

===================

### Challenge
Status: ✅ Selesai
Endpoint:
- `GET /api/challenge` - Mendapatkan daftar tantangan aktif.
- `GET /api/challenge/{id}` - Mendapatkan rincian tantangan beserta data progres user terkait.
- `POST /api/challenge/join` - Bergabung ke tantangan baru (membuat record partisipasi & progres).
- `GET /api/challenge/my` - Mendapatkan daftar tantangan yang sedang diikuti oleh pengguna.
- `POST /api/challenge/{id}/leave` - Keluar/membatalkan partisipasi dalam tantangan (dilarang jika sudah selesai).

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
Status: ✅ Selesai
Endpoint:
- `GET /api/dashboard/admin` - Agregasi analitik untuk admin (total users, total merchants, status log aktivitas, sirkulasi poin, top users).
- `GET /api/dashboard/user` - Agregasi analitik pengguna (total poin, trust score, status aktivitas, riwayat poin terbaru, tantangan aktif).
- `GET /api/dashboard/merchant` - Agregasi analitik performa penjualan merchant (total revenue, total items sold, list produk terlaris).

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
- [x] Integrasi Frontend untuk Auth & Activity: registrasi, login, logout, pengenalan sesi otomatis (silent refresh), daftar aktivitas dengan filter status dan paginasi, pelaporan aktivitas baru, serta detail status aktivitas.
- [x] Integrasi Halaman Dashboard dengan Modul Activity: visualisasi ringkasan kontribusi (Total Poin, Trust Score, status aktivitas PENDING/APPROVED/REJECTED) dan list aktivitas terbaru menggunakan hooks React Query.
- [x] Modul Marketplace (Backend): Manajemen produk UMKM (CRUD produk, list produk, detail produk) dan checkout transaksi order secara transaksional aman dengan verifikasi stok menggunakan Prisma transactions.
- [x] Modul Reward (Backend): Manajemen voucher belanja (CRUD voucher, list voucher) dan penukaran poin user menjadi kode voucher digital secara transaksional (Prisma transactions) dengan validasi poin balance.
- [x] Modul Challenge (Backend): Fitur gamifikasi bagi pengguna, termasuk join/leave tantangan, pelacakan progres secara transaksional, dan auto-progress/auto-completion saat status pelaporan aktivitas disetujui (APPROVED).
- [x] Modul Dashboard Analytics (Backend): Penyediaan data agregasi yang dioptimalkan secara terpisah untuk peran Admin, User biasa, dan UMKM/Merchant menggunakan operator agregasi/groupby Prisma.
- [x] Halaman-halaman frontend berikut telah aktif dan diimplementasikan secara visual menggunakan Tailwind CSS dan font premium:
  - Halaman Login (`/login`)
  - Halaman Register (`/register`)
  - Halaman Dashboard (`/dashboard`)
  - Halaman Daftar Aktivitas (`/activity`)
  - Halaman Lapor Aktivitas Baru (`/activity/new`)
  - Halaman Detail Aktivitas (`/activity/[id]`)
  - Halaman Profil Pengguna (`/profile`)
  - Halaman Marketplace Katalog (`/marketplace`) & Detail Produk (`/marketplace/[id]`)
  - Halaman Keranjang Belanja (`/cart`) & Form Checkout (`/checkout`)
  - Halaman Riwayat Transaksi Pesanan (`/orders`)
  - Halaman Penukaran Saldo Poin dengan Voucher (`/rewards`) & Riwayat Klaim (`/reward/history`)
  - Halaman Jelajah Tantangan (`/challenge`), Detail Tantangan (`/challenge/[id]`), dan Tantangan Diikuti (`/challenge/my`)
  - Halaman Kelola Produk UMKM (`/merchant/products`) untuk CRUD katalog produk bagi mitra UMKM
  - Halaman Verifikasi Aktivitas (`/admin/activity`) untuk persetujuan manual oleh Admin
  - Halaman Kelola Challenge (`/admin/challenge`) untuk CRUD tantangan oleh Admin
  - Halaman Kelola Kategori (`/admin/category`) untuk CRUD kategori master aktivitas oleh Admin
  - Pembagian visual dashboard dan akses navigasi secara dinamis berdasarkan role (USER, UMKM, ADMIN)

## Yang Sedang Dikerjakan

- Pemeliharaan rutin, monitoring performa query database, dan persiapan deployment.

## Progress Integrasi Frontend

Berikut adalah pemetaan menyeluruh terhadap modul frontend yang sudah selesai diintegrasikan dan beberapa area yang kurang/memerlukan peningkatan:

### 1. Modul Frontend Yang Sudah Selesai (100% Ready)
- **Landing Page (`/`)**: Berhasil memindahkan dan mengintegrasikan 8 section visual dari Versi B (Navbar, Hero, Features, Marketplace Preview, Why Recycling, Mission & Community, CTA, Footer). Navigasi tombol dan link sudah dihubungkan menggunakan routing Next.js (`/login`, `/register`, `/marketplace`, dll).
- **Halaman Tentang Kami (`/about`)**: Halaman statis yang memuat visi, misi, dan latar belakang platform Ecolution.
- **Autentikasi Pengguna**:
  - Halaman Login (`/login`) & Register (`/register`) menggunakan form interaktif utama dengan integrasi state global `AuthContext` (React Query) dan auto-refresh token.
  - Halaman Profil Pengguna (`/profile`) menampilkan ringkasan data diri.
- **Role-Based Layout & Navigation**: Sidebar navigasi terproteksi di [app-layout.tsx](file:///C:/Users/ASUS/Documents/ecolution/src/components/layout/app-layout.tsx) secara dinamis membatasi hak akses menu berdasarkan role (`USER`, `UMKM`, `ADMIN`).
- **Dashboard Multi-Role (`/dashboard`)**:
  - **User**: Menampilkan statistik kontribusi (Total Poin, Trust Score, status aksi APPROVED/PENDING/REJECTED) dan list aktivitas hijau terbaru.
  - **UMKM/Merchant**: Menampilkan total produk, total pesanan lunas, total omzet, daftar pesanan terbaru pembeli, dan list katalog produk.
  - **Admin**: Menampilkan statistik pengguna aktif, merchant aktif, total sirkulasi poin, total verifikasi, dan tabel leaderboard peringkat pengguna teraktif.
- **Pelaporan Aktivitas (`/activity`, `/activity/new`, `/activity/[id]`)**: Halaman list pelaporan pengguna lengkap dengan filter status, detail ekstraksi metadata EXIF foto, analisis verifikasi AI, serta form pelaporan aksi hijau.
- **Marketplace & Checkout (`/marketplace`, `/marketplace/[id]`, `/cart`, `/checkout`, `/orders`)**: Halaman katalog belanja produk UMKM, keranjang belanja lokal, form alamat pengiriman checkout transaksi, dan tracker riwayat transaksi pemesanan produk.
- **Rewards Voucher (`/rewards`, `/reward/history`)**: Halaman katalog penukaran poin dengan voucher mitra UMKM dan riwayat voucher yang telah diklaim.
- **Tantangan Lingkungan (`/challenge`, `/challenge/[id]`, `/challenge/my`)**: Halaman jelajah tantangan aktif, detail petunjuk tantangan, dan monitoring progres penyelesaian tantangan.
- **Kelola Produk UMKM (`/merchant/products`)**: Panel manajemen katalog produk bagi mitra UMKM yang sedang login (tambah/edit modal dialog, URL gambar preview, stok, status produk).
- **Operasional Admin (`/admin/*`)**:
  - **Verifikasi Aktivitas (`/admin/activity`)**: Panel verifikasi aksi hijau (Approve/Reject) disertai dialog input alasan penolakan dan status analisis AI.
  - **Kelola Challenge (`/admin/challenge`)**: Panel CRUD tantangan lingkungan.
  - **Kelola Kategori (`/admin/category`)**: Panel CRUD master data kategori pelaporan aksi hijau.

### 2. Modul Frontend Yang Kurang / Perlu Peningkatan (Lacking)
- **Integrasi Data Dinamis pada Landing Page**: Saat ini produk di section *Bestsellers* (`MarketplacePreview`) dan beberapa data statistik lainnya masih menggunakan data dummy hardcoded. Perlu dihubungkan ke API Query `/api/product` untuk memuat produk terlaris secara dinamis.
- **Form Pendaftaran UMKM Mitra Baru**: Tombol "Become a Merchant" pada CTA landing page saat ini mengarah ke `/merchant/products` atau halaman login. Perlu dibuat form pendaftaran terdedikasi untuk pendaftaran profil bisnis baru (`POST /api/merchant`).
- **Peta Lokasi Visual Koordinat GPS**: Pada detail laporan aktivitas, koordinat latitude dan longitude ditampilkan dalam teks mentah. Dapat ditingkatkan dengan menambahkan integrasi map visual (misalnya Leaflet/Google Maps) untuk mempermudah admin memantau lokasi aksi secara visual.
- **Integrasi Gerbang Pembayaran Mock**: Proses checkout langsung memotong stok produk secara instan. Integrasi sistem mock payment gateway (seperti simulasi Midtrans) dapat ditambahkan untuk melengkapi alur pembayaran online.

## Testing Status

Rincian hasil kompilasi dan build produksi:
- [x] TypeScript Type Check (`npx tsc --noEmit`) - Sukses, 0 Error.
- [x] Next.js Production Build (`npx next build`) - Sukses, 43 Halaman Statis & 14 API Route Handler teroptimasi sempurna.

