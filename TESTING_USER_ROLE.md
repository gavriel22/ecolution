# PANDUAN PENGUJIAN (TESTING GUIDE) - ROLE USER

Dokumen ini berisi panduan pengujian fungsionalitas dan antarmuka (UI/UX) khusus untuk peran **USER** pada aplikasi Ecolution. Cukup gunakan panduan ini untuk memvalidasi alur bisnis peran USER sebelum berpindah ke pengujian peran merchant/admin.

---

## 📋 Daftar Skenario Pengujian

### 1. Autentikasi Pengguna & Sesi (Single Login)
Tujuan: Memastikan pengguna dapat mendaftar, masuk satu kali, dan sesi dipertahankan di seluruh aplikasi.

| Langkah Pengujian | Skenario Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :---: |
| 1.1 | Pendaftaran Akun Baru | Buka halaman `/register`, isi formulir dengan lengkap, lalu klik "Daftar". Akun berhasil dibuat dan otomatis diarahkan ke halaman `/login`. | [ ] |
| 1.2 | Login Pertama Kali | Masuk menggunakan kredensial USER yang baru didaftarkan. Halaman dialihkan ke `/dashboard` dan Navbar Landing Page berubah menampilkan nama pengguna (misal: "Halo, [Nama]"). | [ ] |
| 1.3 | Akses Berulang | Tanpa menutup browser, navigasikan kembali ke Landing Page (`/`), lalu klik "Dashboard User" di dropdown akun. Pengguna langsung masuk ke dashboard tanpa diminta login ulang. | [ ] |
| 1.4 | Proteksi Route Privat | Buka tab browser baru (atau Incognito), coba akses langsung `/dashboard`, `/profile`, `/rewards`, atau `/riwayat` secara langsung tanpa login. Sistem harus mengarahkan pengguna ke `/login`. | [ ] |

---

### 2. Antarmuka Landing Page (Responsive & Navigation)
Tujuan: Memastikan akses navigasi publik di Landing Page berjalan optimal dan responsif di mobile.

| Langkah Pengujian | Skenario Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :---: |
| 2.1 | Navigasi Menu Publik | Klik menu **Beranda**, **Marketplace**, **Challenge**, dan **Tentang Kami** di Navbar. Seluruh halaman terbuka dengan layout Landing Page (Navbar + Footer) yang konsisten. | [ ] |
| 2.2 | Tampilan Mobile (Hamburger) | Ubah ukuran browser ke resolusi mobile (< 768px). Menu di Navbar berganti menjadi tombol Hamburger. Klik hamburger, menu drawer terbuka vertikal ke bawah dengan rapi. | [ ] |
| 2.3 | Redireksi Tamu (Belum Login) | Saat belum login, klik menu **Reward** atau **Riwayat** di Navbar. Sistem harus mendeteksi ketiadaan token dan mengalihkan pengguna ke `/login`. | [ ] |
| 2.4 | Pengisian Mockup Hero | Cek Hero Section di Landing Page. Card mockup statis di sisi kanan/bawah terisi dengan visual dashboard mobile yang memuat Poin, Trust Score, dan progress bar. | [ ] |

---

### 3. Penukaran Reward (`/rewards`)
Tujuan: Memastikan pengguna dapat melihat informasi reward, progres level, dan melakukan klaim voucher.

| Langkah Pengujian | Skenario Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :---: |
| 3.1 | Ringkasan Poin & Level | Membuka halaman `/rewards` (setelah login). Menampilkan saldo poin total, peringkat Level ( Champion), dan bar kemajuan (progress bar) menuju level berikutnya secara akurat. | [ ] |
| 3.2 | Grid Voucher Tersedia | Menampilkan kartu-kartu voucher aktif milik UMKM lengkap dengan foto, nama voucher, nama merchant, dan biaya poin. | [ ] |
| 3.3 | Validasi Saldo Poin | Jika poin user kurang dari biaya voucher, tombol pada kartu voucher akan bertuliskan **"Poin Kurang"** dan tidak dapat diklik. | [ ] |
| 3.4 | Klaim Voucher | Jika poin cukup, klik **"Tukarkan"**. Muncul dialog konfirmasi. Klik OK, poin berkurang dan muncul modal pop-up yang menampilkan kode voucher unik (salin kode berfungsi). | [ ] |
| 3.5 | Tab "Voucher Saya" | Klik tab **"Voucher Saya"**. Voucher yang baru saja ditukar muncul di list dengan status **"Aktif"**, menampilkan tanggal penukaran, kode voucher, dan tombol salin. | [ ] |

---

### 4. Riwayat Aktivitas Lingkungan (`/riwayat`)
Tujuan: Memastikan pengguna dapat melacak seluruh laporan aktivitas ramah lingkungan yang pernah mereka kirimkan.

| Langkah Pengujian | Skenario Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :---: |
| 4.1 | Detail Log Aktivitas | Menampilkan riwayat aksi lengkap dengan: thumbnail gambar, judul, kategori aksi, lokasi koordinat/alamat, tanggal aksi, status verifikasi, dan perolehan poin. | [ ] |
| 4.2 | Fitur Search | Ketik kata kunci judul aktivitas pada kolom input pencarian. Daftar aktivitas langsung menyusut secara real-time menyisakan judul yang cocok. | [ ] |
| 4.3 | Filter Status Verifikasi | Pilih filter status "Menunggu", "Disetujui", atau "Ditolak". List memunculkan aktivitas yang hanya berstatus terkait secara tepat. | [ ] |
| 4.4 | Filter Tanggal Aksi | Pilih tanggal tertentu pada input date filter. List memfilter laporan yang diajukan tepat pada tanggal tersebut. | [ ] |

---

### 5. Area Dashboard User (`/dashboard`)
Tujuan: Memastikan dashboard back-office ramah guna, fokus pada menu utama, dan fungsional di perangkat mobile.

| Langkah Pengujian | Skenario Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :---: |
| 5.1 | Evaluasi Menu Sidebar | Cek sidebar Dashboard User. Hanya terdapat 3 menu utama: **Dashboard**, **Upload Aktivitas**, dan **Profil**. (Tidak ada menu Challenge, Marketplace, Reward, atau Riwayat). | [ ] |
| 5.2 | Upload Laporan Baru | Klik menu **Upload Aktivitas**. Isi data form (pilih kategori, tanggal, lokasi, deskripsi, dan upload foto aksi). Klik "Kirim". Laporan terkirim dan status awal adalah PENDING. | [ ] |
| 5.3 | Edit Data Profil User | Klik menu **Profil**, isi perubahan data diri pada kolom bio, alamat, telepon, atau unggah foto profil baru, lalu klik "Simpan". Perubahan berhasil disimpan ke database. | [ ] |
| 5.4 | Scroll Horizontal Tabel | Di dashboard utama, lihat tabel peringkat "Eco Champions". Buka di layar mobile, pastikan tabel dapat digeser horizontal tanpa merusak struktur visual halaman. | [ ] |

---

### 6. Proses Keluar & Proteksi Back Button (Logout Secure)
Tujuan: Memastikan logout menghapus sesi secara permanen dan mencegah eksploitasi navigasi mundur.

| Langkah Pengujian | Skenario Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :---: |
| 6.1 | Tombol Keluar Akun | Klik opsi **"Keluar"** di dropdown Navbar Landing Page atau tombol **"Keluar Akun"** di bagian bawah sidebar Dashboard. | [ ] |
| 6.2 | Redireksi Setelah Logout | Halaman dialihkan secara paksa ke Landing Page utama (`/`). Navbar kembali menampilkan tombol **"Masuk"** dan **"Daftar"**. | [ ] |
| 6.3 | Pencegahan Back Button | Tekan tombol **Back** pada browser. Browser tidak boleh menampilkan kembali halaman dashboard privat atau riwayat aktivitas. Pengguna harus tetap berada di Landing Page publik (atau dialihkan kembali ke `/`). | [ ] |

---

## 🛠️ Persiapan Pengujian Lokal

1. **Jalankan server database & aplikasi**:
   ```bash
   # Pastikan PostgreSQL berjalan, lalu jalankan dev server
   npm run dev
   ```
2. **Kredensial Akun Dummy Pengujian (USER)**:
   - Email: `user@ecolution.com`
   - Password: `password123`
   *(Atau buat akun baru melalui antarmuka registrasi untuk menguji skenario 1.1)*
