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
- **Bcryptjs (v2.x)** - Hashing password pengguna untuk keamanan database *(pure-JavaScript, menggantikan native `bcrypt` C++ addon untuk kompatibilitas penuh dengan Next.js runtime & Vercel Edge)*.
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
- **Voucher**: Voucher belanja yang dapat ditukar dengan poin pengguna, dikelola terpusat oleh Admin.
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
- `POST /api/voucher` - Membuat voucher belanja baru (khusus Admin).
- `GET /api/voucher/{id}` - Mendapatkan detail lengkap voucher belanja.
- `PUT /api/voucher/{id}` - Memperbarui detail voucher belanja (khusus Admin).
- `DELETE /api/voucher/{id}` - Menghapus voucher belanja (khusus Admin).
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
  - Halaman Kelola Pesanan UMKM (`/merchant/orders`) untuk melihat dan memperbarui status pesanan masuk bagi mitra UMKM
  - Halaman Pendaftaran Mitra UMKM (`/merchant/register`) untuk mendaftarkan profil toko bagi pengguna biasa
  - Halaman Profil Publik Toko (`/merchant/[merchantId]`) untuk menampilkan info toko dan daftar produknya
  - Halaman Profil Toko Mitra (`/merchant/profile`) untuk detail usaha dan performa toko bagi mitra UMKM
  - Halaman Analitik Statistik Penjualan (`/merchant/statistics`) untuk visualisasi keuangan dan pemeringkatan produk terlaris mitra UMKM
  - Halaman Verifikasi Aktivitas (`/admin/activity`) untuk persetujuan manual oleh Admin
  - Halaman Kelola Challenge (`/admin/challenge`) untuk CRUD tantangan oleh Admin
  - Halaman Kelola Kategori (`/admin/category`) untuk CRUD kategori master aktivitas oleh Admin
  - Halaman Persetujuan Pendaftaran UMKM (`/admin/merchant`) untuk admin menyetujui/menolak mitra baru
  - Halaman Kelola User (`/admin/users`) untuk admin mengelola role dan status aktif pengguna
  - Pembagian visual dashboard dan akses navigasi secara dinamis berdasarkan role (USER, UMKM, ADMIN)

## 🚧 Frontend Update (Landing Page Integration & Routing Fix)

### ✅ Completed

- Fixed routing pada landing page agar tidak redirect ke dashboard secara default
- Memastikan seluruh konten publik (marketplace, challenge, dll) tetap di landing page
- Mengubah konsep landing page menjadi seperti e-commerce (Shopee-style)
- Memisahkan fungsi dashboard sebagai halaman khusus CRUD & management
- Menyesuaikan navbar landing page:
  - Marketplace → landing page (bukan dashboard)
  - Challenge → landing page
- Membersihkan hasil merge conflict
- Menghapus redirect yang tidak sesuai
- Merapikan struktur UI tanpa mengubah arsitektur
- **[BARU]** Memisahkan layout Halaman Checkout (`/checkout`) dan Riwayat Pesanan (`/orders`) dari layout Dashboard ke layout Landing Page (Navbar & Footer publik) demi menjaga konsistensi area marketplace.
- **[BARU]** Mengimplementasikan pengecekan otorisasi pada Checkout & Pesanan dengan redirect callback (`/login?callbackUrl=...`) sehingga alur pembelian berjalan mulus setelah login.
- **[BARU]** Memperbaiki alur login (`LoginForm`) agar memprioritaskan parameter `callbackUrl` jika tersedia, sehingga pengguna kembali ke alur transaksi sebelumnya (bukan dipaksa ke dashboard).
- **[BARU]** Menambahkan tombol `← Kembali ke Landing Page` pada Sidebar Dashboard (`AppLayout`) untuk memudahkan seluruh role (USER, UMKM, ADMIN) berpindah ke halaman publik utama.
- **[BARU]** Menyinkronkan tombol login/masuk di Navbar dan Footer untuk menyertakan callback URL berdasarkan halaman aktif saat itu.
- **[BARU]** Sistem Akun UMKM: Alur pendaftaran mandiri UMKM (`/merchant/register`) dari halaman Profil dengan validasi status pendaftaran (`PENDING`, `APPROVED`, `SUSPENDED`).
- **[BARU]** Admin Approval Flow: Halaman persetujuan pendaftaran UMKM (`/admin/merchant`) terintegrasi penuh dengan backend untuk menyetujui (approve) atau menolak (reject) pendaftaran toko baru.
- **[BARU]** Halaman Toko UMKM (`/merchant/[merchantId]`): Halaman profil publik toko yang memuat logo, deskripsi, kontak, dan katalog produk dinamis milik mitra terkait, dapat diakses oleh tamu (guest).
- **[BARU]** Manajemen Pesanan UMKM (`/merchant/orders`): Seller orders management dashboard untuk melihat daftar pesanan masuk dan mengubah status transaksi.
- **[BARU]** Manajemen User oleh Admin (`/admin/users`): Halaman kontrol untuk admin memantau daftar pengguna, mengubah role akses (USER, UMKM, ADMIN), serta memblokir/mengaktifkan status akun.
- **[BARU]** Restrukturisasi layout navigasi sidebar dan link dashboard multi-role secara dinamis, serta pelabelan tombol "Dashboard UMKM" pada Navbar utama jika pengguna ber-role UMKM.
- **[BARU]** Pemisahan Keranjang Belanja per-User (Cart Isolation): Mengaitkan keranjang belanja di Local Storage dengan ID pengguna masing-masing, memastikan keranjang belanja antar pengguna yang menggunakan perangkat/browser yang sama tidak saling tercampur.
- **[BARU]** Ikon Akses Cepat Keranjang Belanja: Menambahkan ikon keranjang belanja pada Navbar Utama (desktop & mobile) yang akan otomatis mengarahkan ke halaman login bagi pengguna tamu, atau ke halaman keranjang bagi pengguna terautentikasi.
- **[BARU]** Penyederhanaan Mekanisme Reward Voucher: Menghapus kategori voucher dan peran UMKM pada voucher. Seluruh mekanisme hadiah/voucher kini dikelola secara terpusat oleh Admin.
- **[BARU]** Perhitungan Level Pengguna via Poin Akumulasi: Level pengguna pada Dashboard Reward kini dihitung menggunakan poin historis terakumulasi (`accumulatedPoint`) hasil gabungan transaksi riwayat bertipe `EARN`, mencegah turunnya level pengguna saat poin ditukarkan.
- **[BARU]** Integrasi Diskon Checkout Real-Time: Tagihan akhir saat checkout otomatis terpotong (dikalkulasi secara akurat dan dikirimkan ke backend) berdasarkan nominal diskon dari voucher yang diaplikasikan pengguna.
- **[BARU]** Pemisahan Layout Landing Page & Dashboard: Memperbaiki bug di mana Landing Navbar muncul di halaman dashboard (`/activity`, `/profile`, dan rute privat `/merchant/*`). Sekarang, Navbar hanya dirender pada halaman publik, sementara Dashboard fokus menggunakan tata letak `AppLayout` (Sidebar) tanpa kebocoran visual dari Landing Page.
- **[BARU]** Alur Autentikasi Terintegrasi & Auto-Redirect: Memodifikasi LoginForm agar mendeteksi session aktif pengguna. Jika token masih valid, pengguna otomatis dialihkan ke Dashboard tanpa perlu login ulang. Login tunggal kini mendukung auto-redirect tampilan dashboard secara dinamis berdasarkan peran (USER, UMKM, ADMIN).
- **[BARU]** Perbaikan Approve & Reject Aktivitas Admin: Mengubah mekanisme ekstraksi data verifikator pada API `/approve` dan `/reject` untuk memverifikasi token JWT secara langsung (menggunakan `getAuthContext`), menghindari kegagalan penyimpanan akibat malformed UUID dari middleware header.
- **[BARU]** Halaman Statistik Penjualan Toko (`/merchant/statistics`): Halaman khusus dan terpisah bagi Mitra UMKM untuk menganalisis omzet, unit terjual, pesanan masuk, dan pemeringkatan produk terlaris (Top Selling Products) secara real-time.
- **[BARU]** Redesain & Diferensiasi Profil User (`/profile`) vs Profil Toko (`/merchant/profile`): Memisahkan halaman profil menjadi dua entitas yang berbeda. Profil User berfokus pada statistik kontribusi lingkungan, poin reward, dan biodata pribadi, sementara Profil Toko berfokus pada informasi operasional bisnis, kontak resmi, dan metrik penjualan toko.
- **[BARU]** Fitur Edit Profil User & Integrasi API: Menambahkan dukungan database untuk kolom `bio` dan `address` pada model `User`, serta mengimplementasikan API endpoint `PUT /api/auth/me` untuk menyimpan perubahan data diri pengguna lengkap dengan validasi format, penanganan status loading/preview gambar, dan notifikasi toast sukses/gagal di UI.
- **[BARU]** **Peningkatan UX & Feedback Form Login**: Menambahkan loading state dengan visual spinner animasi pada tombol login, mengubah teks tombol menjadi "Sedang masuk...", menonaktifkan seluruh input field selama request berlangsung, serta mengintegrasikan custom Toast alert (Sonner) sukses/gagal berbahasa Indonesia berdasarkan pemetaan kode status HTTP API.
- **[BARU]** **Optimasi Kecepatan Autentikasi Login**: Backend `/api/auth/login` disetel agar memproses penandatanganan access/refresh tokens JWT secara paralel dengan query metadata `toSafeUser` database via `Promise.all` guna memotong latency loading.
- **[BARU]** **Hapus Border Kiri Card Dashboard**: Redesain visual card statistik kontribusi user (Disetujui, Menunggu, Ditolak) pada halaman Dashboard dengan membuang border kiri tebal dan menggantinya dengan dot indicator kustom (merah/kuning/hijau) di sudut kanan atas untuk mempertahankan diferensiasi status tanpa merusak estetika modern.
- **[BARU]** **Aksesibilitas & Pointer Cursor Global**: Menambahkan konfigurasi CSS kustom pada file global stylesheet (`globals.css`) untuk memaksakan perubahan kursor pointer saat melayang di atas elemen interaktif (button, anchor link, dropdown, role button, tabindex) dan cursor `not-allowed` jika tombol dinonaktifkan (disabled).
- **[BARU]** **Alur Upload Aktivitas Mandiri EXIF & Reverse Geocoding**: Mengubah form unggah aktivitas agar mengambil tanggal dari EXIF `DateTimeOriginal` dan alamat ter-geocode dari koordinat GPS (`GPSLatitude`, `GPSLongitude`) via Nominatim API. Input manual tanggal/lokasi ditutup. Sistem menolak foto non-kamera/tanpa EXIF serta otomatis menandai foto hasil edit (dari Photoshop, Canva, Snapseed, dll.) untuk verifikasi manual.
- **[BARU]** **Responsive Fix Mobile Landing Page & Akun Menu**: Memperbaiki tabrakan dropdown profil dan hamburger menu pada ukuran layar mobile dengan memindahkan panel dropdown desktop menjadi laci collapsible "Akun Saya" yang di-render di bagian paling bawah hamburger drawer mobile.
- **[BARU]** Fitur CRUD Lengkap Profil Toko (`/merchant/profile`): Mengimplementasikan dukungan penuh CRUD untuk Profil Toko UMKM. Merchant dapat membuat toko baru (Create), melihat rincian toko (Read), memodifikasi info seperti logo, nama, kategori, telepon, email, website, alamat, dan jam operasional (Update), serta menghapus profil toko jika tidak ada produk (Delete) dengan konfirmasi dialog dan update real-time di UI.
- **[BARU]** Mode Login Dual-Dashboard (USER & UMKM): Menambahkan tab pilihan "Masuk Sebagai User" atau "Masuk Sebagai UMKM" pada halaman login. Alur login memvalidasi role backend dan menerbitkan token JWT dengan session role yang sesuai, sehingga user dengan status UMKM tetap dapat mengakses Dashboard User tanpa menghapus dashboard user miliknya.
- **[BARU]** Revamp Landing Page & Penyempurnaan Visi Gamifikasi:
  - Hero Section: Update headline & subheadline bernilai ekonomi sirkular dan gamifikasi, ditunjang 3 CTA utama yang jelas ("Mulai Berkontribusi", "Upload Aktivitas", "Jelajahi Marketplace").
  - Card Hero Mockup: Mengisi card kosong dengan visualisasi interaktif mobile dashboard mockup HTML/CSS statis yang memuat Poin, Trust Score, progres misi mingguan, dan tombol lapor aksi.
  - Dampak Nyata PlatformStats: Menambahkan statistik kontribusi platform (User Aktif, Mitra UMKM, Aksi Terverifikasi, Sampah Terdaur Ulang, Reward Ditukar) dengan fallback data yang mulus.
  - Eco Champions Leaderboard: Menambahkan endpoint `GET /api/leaderboard` untuk mengambil data top 3 user secara live dari database, serta mengkalkulasi posisi peringkat spesifik user yang sedang login saat itu (misal: #17).
  - Weekly Challenge: Menampilkan misi mingguan dinamis dengan progres misi saat ini, indikator progress bar, detail reward poin, dan integrasi tombol aksi.
  - Marketplace Catalog: Mendesain ulang kartu produk agar memuat detail visual terperinci (Nama, Toko Merchant, Rating Bintang, Harga dalam Poin, dan Badge status: Baru/Terlaris/Diskon) lengkap dengan fallback penanganan error pemuatan gambar.
  - Informasi Footer Lengkap: Menyediakan tautan navigasi dan kontak lengkap, termasuk Contact WhatsApp, Email, Instagram, FAQ/Bantuan, Syarat & Ketentuan, Kebijakan Privasi, dan info Hak Cipta dinamis.
  - Dropdown Akun Navbar Sesuai Role: Menambahkan dropdown menu akun pada Navbar Landing Page yang secara adaptif menampilkan link menu berdasarkan mode session role aktif pengguna (USER, UMKM, ADMIN) serta opsi Keluar/Logout yang aman.
- **[BARU]** Penyederhanaan Autentikasi Single Login & Dashboard Switcher:
  - Dropdown Navbar Adaptif: Modifikasi Navbar dropdown agar bertindak murni sebagai pemilih dashboard (Dashboard User, Dashboard UMKM, Dashboard Admin) dan Logout. Menghilangkan tautan Profil User dan Profil Toko dari dropdown karena sudah tersedia di sidebar masing-masing.
  - Client-Side Role Toggling: Menambahkan `activeRole` state ke `AuthContext` yang disimpan di `localStorage`. User dengan peran `UMKM` dapat beralih secara langsung antara tampilan Dashboard User dan Dashboard UMKM secara instan di sisi klien tanpa perlu login ulang.
  - Penyelarasan Menu Sidebar: Merapikan sidebar `AppLayout` untuk user biasa agar hanya memuat menu esensial: Dashboard, Upload Aktivitas, dan Profil, guna menghindari duplikasi dengan navigasi publik di Landing Page.
  - Proteksi Rute Merchant Terintegrasi: Menyesuaikan aturan redirect middleware `src/middleware.ts` untuk pengguna dengan role `USER` yang mencoba mengakses rute internal `/merchant/*`. Alih-alih di-redirect ke halaman utama `/`, mereka sekarang otomatis diarahkan ke halaman pendaftaran UMKM `/merchant/register` dengan dialog penawaran yang informatif.
- **[BARU]** Integrasi & Pemisahan Halaman Reward dan Riwayat Ke Landing Page:
  - Halaman Reward Publik (`/rewards`): Didesain ulang agar konsisten dengan Landing Page layout (Navbar & Footer) dengan perlindungan otentikasi. Menampilkan ringkasan poin, kalkulasi level otomatis, bar kemajuan level berikutnya, daftar voucher tersedia, dan tab daftar voucher yang sudah ditukar (lengkap dengan kode voucher, status penggunaan, dan copy action).
  - Halaman Riwayat Publik (`/riwayat`): Membuat halaman riwayat aktivitas baru di area publik (memerlukan login). Dilengkapi dengan pencarian judul, filter status (Semua, Menunggu, Disetujui, Ditolak), filter tanggal, foto thumbnail, dan poin perolehan.
  - Shortcut Dashboard User: Memodifikasi navigasi di dalam Dashboard User (`AppLayout`) agar bertindak sebagai shortcut langsung menuju halaman `/rewards` dan `/riwayat` di Landing Page untuk mencegah duplikasi kode/halaman.
  - Perbaikan Alur Keluar (Logout) Terproteksi: Memperbarui hook `useLogout` dan handler Navbar untuk membersihkan status autentikasi klien, menghapus riwayat browser cache, dan mengarahkan pengguna secara paksa ke Landing Page utama (`/`) menggunakan `window.location.replace("/")`. Hal ini mencegah pengguna menekan tombol Back Browser untuk kembali ke dashboard setelah keluar.
- **[BARU]** Audit Responsiveness & Penyesuaian Layout Multi-Screen:
  - Mobile Navbar Hamburger Drawer: Memodifikasi `Navbar.tsx` dengan menambahkan state `isMobileMenuOpen` dan rendering tombol hamburger pada resolusi mobile/tablet. Saat diklik, laci navigasi (drawer) interaktif akan terbuka menampilkan link navigasi lengkap beserta opsi masuk/daftar khusus pengunjung tamu.
  - Sidebar Dashboard Off-Canvas: Memperbarui sidebar `AppLayout` agar otomatis menyembunyikan drawer menu setelah pengguna mengeklik salah satu tautan di perangkat seluler demi kenyamanan navigasi satu sentuhan.
  - Pencegahan Table Overflow: Membungkus tabel Eco Champions Leaderboard di halaman Dashboard utama (`/dashboard`) dalam kontainer `overflow-x-auto` agar tetap scrollable secara horizontal di perangkat beresolusi rendah (seperti 320px–480px) tanpa merusak keselarasan kolom visual.
- **[BARU]** Refaktor Pop-up Native ke Custom UI: Menghilangkan seluruh `window.alert()` dan `window.confirm()` bawaan browser yang memunculkan "localhost says..." dengan menggunakan komponen Toast kustom (`sonner`) dan *Global Confirm Dialog Modal*. Seluruh *event handler* yang memanggil tombol konfirmasi telah direfaktor menjadi asinkronus (`await confirm()`).

- **[FIX KRITIS]** Perbaikan Skema Pembuatan Kategori Aktivitas: Menambahkan kolom tipe data Text `imageUrl` pada entitas `ActivityCategory` di Prisma Schema dan menyesuaikan skema validasi Zod agar mendukung pengunggahan URL gambar panjang (tanpa batas *VarChar* 255 karakter), memperbaiki isu HTTP 500 saat membuat kategori dari panel Admin.

- **[FIX KRITIS]** Bug HTTP 500 pada `/api/auth/register` dan `/api/auth/login` diselesaikan:
  - **Penyebab Root Cause**: Library `bcrypt` (v6.0.0) menggunakan C++ native addon (`.node` binary) yang **gagal dimuat** oleh Next.js App Router runtime di lingkungan tertentu (termasuk Windows saat proses masih mengunci file `.bcrypt-*.node`).
  - **Solusi**: Mengganti seluruh import `bcrypt` dengan `bcryptjs` (pure JavaScript, tanpa native binary) di `src/services/auth.service.ts` dan seluruh seed files (`prisma/seeds/admin.ts`, `merchant.ts`, `users.ts`).
  - **Verifikasi**: HTTP test langsung ke `POST /api/auth/register` dan `POST /api/auth/login` kini mengembalikan status `201` dan `200` dengan payload data yang benar.

### 🔄 In Progress

- Integrasi lanjutan untuk gamifikasi berskala besar

### 🧠 Notes

- Dashboard difokuskan hanya untuk:
  - User activity
  - UMKM product management
  - Admin management (challenge, approval, kategori)
- Landing page menjadi pusat seluruh konten publik
- **Panduan Pengujian User**: Telah dibuat panduan pengujian terperinci khusus untuk fungsionalitas dan antarmuka peran USER di [TESTING_USER_ROLE.md](file:///C:/Users/ASUS/Documents/ecolution/TESTING_USER_ROLE.md).

## 🚀 Vercel Deployment & Build Optimization Update

### ✅ Completed

- **Database Fallback Setup (`src/lib/env.ts`)**: Menambahkan default dummy URL ke skema `DATABASE_URL` menggunakan Zod. Hal ini menghindari kegagalan build Next.js saat proses pre-rendering static pages ketika database belum terkoneksi.
- **Middleware Optimization (`src/middleware.ts`)**: Menghapus import `@prisma/client` dari Middleware Edge runtime. Perbandingan tipe role digantikan menggunakan string literals (`"ADMIN"`, `"UMKM"`). Hal ini mencegah build error akibat ketergantungan library Node.js (seperti `fs`, `path`) di lingkungan Vercel Edge.
- **Build Scripts Setup (`package.json`)**: Memisahkan command Prisma Client generation ke dalam hook `"postinstall": "prisma generate"`. Ini memastikan Prisma Client selalu siap sebelum kompilasi Next.js dimulai pada platform deployment Vercel.
- **Validation Build Check**: Berhasil menguji `npm run build` lokal dan lulus 100% tanpa error, menghasilkan optimasi halaman statis & dinamis dengan benar.

### 🔑 Environment Variables Wajib untuk Vercel

Berikut adalah daftar variabel lingkungan yang wajib dikonfigurasi di dashboard Vercel settings sebelum memicu deployment:

| Nama Variabel | Tipe | Deskripsi |
|---|---|---|
| `DATABASE_URL` | String (URL) | Connection string PostgreSQL (contoh: `postgresql://username:password@host:port/database?sslmode=require`) |
| `JWT_ACCESS_SECRET` | String | Secret key acak untuk menandatangani JWT Access Token (opsional, disiapkan default fallback) |
| `JWT_REFRESH_SECRET` | String | Secret key acak untuk menandatangani JWT Refresh Token (opsional, disiapkan default fallback) |

## Yang Sedang Dikerjakan

- Pemeliharaan rutin, monitoring performa query database, dan persiapan deployment.

## Progress Integrasi Frontend

Berikut adalah pemetaan menyeluruh terhadap modul frontend yang sudah selesai diintegrasikan dan beberapa area yang kurang/memerlukan peningkatan:

### 1. Modul Frontend Yang Sudah Selesai (100% Ready)
- **Landing Page (`/`)**: Desain ulang beranda sepenuhnya selesai sesuai dengan konsep *Field Logbook* di [Ecolution Design System](file:///C:/Users/ASUS/Documents/ecolution/ecolution-design-system.md). Section diurutkan ulang menjadi: Hero (dipertahankan) → Statistik Dampak (format Ledger Row) → Cara Kerja (format Trail Stop) → Challenge Mingguan (format Mission Ticket) → Katalog Marketplace (format Specimen Card) → Leaderboard (format Podium Champion) → CTA akhir (warna gradasi forest dengan tombol gold). Seluruh data disajikan secara dinamis dengan visual pacing yang solid.
- **Halaman Tentang Kami (`/about`)**: Halaman statis yang memuat visi, misi, dan latar belakang platform Ecolution.
- **Autentikasi Pengguna**:
  - Halaman Login (`/login`) & Register (`/register`) menggunakan form interaktif utama dengan integrasi state global `AuthContext` (React Query) dan auto-refresh token.
  - Ditambahkan tombol navigasi minimalis ber-icon panah kiri `← Kembali ke Beranda` di bagian atas formulir Login dan Register untuk mempermudah navigasi ke Landing Page.
  - Halaman Profil Pengguna (`/profile`) menampilkan ringkasan data diri.
- **Form Pendaftaran UMKM (`/merchant/register`)**: Overhaul total agar konsisten dengan formulir Login/Register (form dipusatkan di tengah layar, dibungkus card putih berukuran max-w-lg (512px) dengan shadow halus, susunan field diatur rapi, tombol utama hijau 'Daftarkan UMKM', dan tombol navigasi 'Kembali ke Beranda'). Navbar & Footer publik Landing Page disembunyikan sepenuhnya dari halaman pendaftaran ini.
- **Dropdown Akun Dinamis (Navbar & Mobile Menu)**: Mengecek data toko secara real-time via endpoint `/api/merchant/my`. Jika pengguna belum memiliki toko, opsi `Daftar UMKM` akan muncul. Jika record merchant sudah terdeteksi di database, opsi otomatis berubah menjadi `Dashboard UMKM` (tidak peduli statusnya masih pending atau disetujui).
- **Role-Based Layout & Navigation**: Sidebar navigasi terproteksi di [app-layout.tsx](file:///C:/Users/ASUS/Documents/ecolution/src/components/layout/app-layout.tsx) secara dinamis membatasi hak akses menu berdasarkan role (`USER`, `UMKM`, `ADMIN`). Diperbaiki juga bug dual active route highlight antara `/activity` dan `/activity/new`.
- **Dashboard Multi-Role (`/dashboard`)**:
  - **User**: Menampilkan statistik kontribusi (Total Poin, Trust Score, status aksi APPROVED/PENDING/REJECTED) dan list aktivitas hijau terbaru.
  - **UMKM/Merchant**: Menampilkan total produk, total pesanan lunas, total omzet, daftar pesanan terbaru pembeli, dan list katalog produk.
  - **Admin**: Menampilkan statistik pengguna aktif, merchant aktif, total sirkulasi poin, total verifikasi, dan tabel leaderboard peringkat pengguna teraktif.
- **Pelaporan Aktivitas (`/activity`, `/activity/new`, `/activity/[id]`)**: Halaman list pelaporan pengguna lengkap dengan filter status, detail ekstraksi metadata EXIF foto, analisis verifikasi AI, serta form pelaporan aksi hijau. Alur upload disederhanakan (auto-submit ke mock AI verifier setelah upload sukses dan langsung dialihkan ke riwayat aktivitas). Gambar diunggah ke disk lokal (`public/uploads`) untuk menghindari broken image.
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
- **Peta Lokasi Visual Koordinat GPS**: Pada detail laporan aktivitas, koordinat latitude dan longitude ditampilkan dalam teks mentah. Dapat ditingkatkan dengan menambahkan integrasi map visual (misalnya Leaflet/Google Maps) untuk mempermudah admin memantau lokasi aksi secara visual.
- **Integrasi Gerbang Pembayaran Mock**: Proses checkout langsung memotong stok produk secara instan. Integrasi sistem mock payment gateway (seperti simulasi Midtrans) dapat ditambahkan untuk melengkapi alur pembayaran online.

## Testing Status

Rincian hasil kompilasi dan build produksi:
- [x] TypeScript Type Check (`npx tsc --noEmit`) - Lulus kompilasi modul landing page, login/register, dan registrasi merchant 100% aman.
- [x] **Bug Fix Auth 500**: `POST /api/auth/register` → 201 Created ✅ | `POST /api/auth/login` → 200 OK ✅ (pasca migrasi ke `bcryptjs`).
- [x] **Local Image Upload Persistence**: Penulisan file fisik ke `public/uploads/` sukses berjalan menyelesaikan broken image thumbnail pada daftar riwayat aktivitas.
- [x] **Sidebar Route Match Fix**: Perbaikan route matching berhasil menyelesaikan masalah double-active highlight pada sidebar navigasi.
