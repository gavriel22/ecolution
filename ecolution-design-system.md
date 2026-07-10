# Ecolution — Design System

**Konsep**: Field Logbook — buku catatan lapangan seorang penjaga hutan/naturalis. Setiap angka terasa seperti dicatat tangan, setiap tahap terasa seperti titik di jalur pendakian, setiap reward terasa seperti stempel yang dibubuhkan.

> **Catatan penting**: Hero banner (section paling atas dengan headline, dashboard card trust score, dan dua CTA) **dipertahankan apa adanya** — tidak termasuk dalam perubahan desain sistem ini. Semua token di bawah berlaku untuk section-section setelah hero.

---

## 1. Color tokens

| Token | Hex | Peran |
|---|---|---|
| `--ink` | `#12211A` | Background gelap utama (ledger, footer, leaderboard) |
| `--forest` | `#1E3A2B` | Primary brand — tombol utama, ikon aktif, border marker |
| `--forest-2` | `#2C4F3A` | Variasi gradient hero / hover state gelap |
| `--moss` | `#7C9B82` | Aksen sekunder, teks pendukung di atas dasar gelap |
| `--moss-light` | `#B9CBB9` | Border halus di atas dasar gelap |
| `--paper` | `#F6F1E4` | Background utama (krem kertas) |
| `--paper-2` | `#ECE3CB` | Card/section alternatif, track progress bar |
| `--paper-3` | `#E3D8B9` | Elevasi lebih dalam dari paper-2 |
| `--gold` | `#D9A441` | **Satu-satunya warna aksen** — CTA utama, stempel, reward, highlight |
| `--gold-deep` | `#A8791F` | Hover/pressed state dari gold, teks eyebrow di atas paper |
| `--text` | `#1B2A20` | Teks utama di atas paper |
| `--text-soft` | `#4B5D50` | Teks sekunder/deskripsi |
| `--line` | `rgba(27,42,32,0.14)` | Border halus di atas paper |
| `--line-strong` | `rgba(27,42,32,0.28)` | Border/dashed line yang lebih tegas |

**Aturan penggunaan warna:**
- `--gold` hanya untuk satu CTA primer per section, stempel/badge, dan angka reward. Jangan dipakai berulang jadi dekorasi.
- Section gelap (`--ink` / `--forest`) dan section terang (`--paper`) diselang-seling secara sengaja untuk membagi ritme scroll — jangan menumpuk 2 section gelap berurutan.
- Tidak ada gradient dekoratif selain di hero (yang dipertahankan) dan final CTA banner.

---

## 2. Typography

| Peran | Font | Berat | Pemakaian |
|---|---|---|---|
| Display / heading | **Fraunces** (serif, opsz variable) | 600–700 | Semua `h1–h3`, angka reward besar, nama produk |
| Body | **Public Sans** | 400 / 500 / 600 | Paragraf, label, deskripsi, nav |
| Data / mono | **IBM Plex Mono** | 400 / 500 / 600 | Semua angka: poin, statistik, tanggal, kode tantangan, eyebrow label |

**Aturan:**
- Setiap angka yang muncul di layar (poin, statistik, harga, tanggal) **wajib** pakai `IBM Plex Mono` — ini elemen penciri "logbook" yang harus konsisten di semua halaman baru.
- Eyebrow label (teks kecil di atas heading) selalu: mono, uppercase, letter-spacing 0.12–0.14em, didahului garis pendek `—` sepanjang ±22px.
- Heading section: 30–36px / 600 / line-height 1.2.
- Body/deskripsi: 14.5–15.5px / line-height 1.6–1.65 / warna `--text-soft`.

---

## 3. Spacing & layout

- Container max-width: `1180px`, padding horizontal `32–40px`.
- Section vertical padding: `88px` (desktop), turun ke `56px` di mobile.
- Grid gap standar antar card: `20–22px`.
- Radius: `5–7px` untuk tombol, `10–12px` untuk card, `50%` untuk marker/avatar lingkaran.
- Breakpoint utama: `900px` (nav & grid berubah jadi 1 kolom / 2 kolom).

---

## 4. Komponen inti (dipakai ulang di semua halaman baru)

### 4.1 Ledger row (baris buku besar)
Dipakai untuk menampilkan statistik/angka penting secara berurutan, bukan grid kartu biasa.

```
[stempel bulat putus-putus] [label + sub-label kecil] [angka besar mono, align kanan]
```
- Background section: `--ink`.
- Setiap baris dipisah `border-bottom: 1px solid rgba(255,255,255,0.12)`.
- Stempel: lingkaran 52px, border dashed `rgba(217,164,65,0.55)`, ikon warna `--gold`.
- Angka: Fraunces 600, 28–30px, satuan (`+`, `t`, dll) dalam mono lebih kecil warna gold.

### 4.2 Trail stop (titik jalur proses)
Dipakai untuk proses/alur bertahap (bukan sekadar list).

```
[marker lingkaran + nomor kecil di pojok] — garis putus-putus vertikal — [judul + deskripsi]
```
- Marker: 54px, background paper, border 2px `--forest`, nomor urut dalam badge gold kecil di pojok kanan-atas.
- Garis penghubung: dashed vertical, warna `--line-strong`.
- Hanya gunakan pola ini bila urutan benar-benar bermakna (proses, bukan fitur paralel).

### 4.3 Mission ticket (tiket misi/tantangan)
Dipakai untuk challenge/tantangan berbatas waktu.

```
[bagian utama: judul, progress bar, deadline] | garis perforasi putus-putus | [bagian samping: reward + CTA]
```
- Progress bar: track `--paper-2`, fill `--forest`.
- Bagian samping background `--paper-2`, angka reward Fraunces 600 warna `--forest`.
- Selalu tampilkan nomor tantangan (mono, kecil) dan tenggat waktu eksplisit.

### 4.4 Specimen card (kartu produk)
Dipakai di marketplace/katalog.

```
[gambar/ikon produk + badge sudut seperti stempel pos] 
[nama toko + rating] 
[nama produk — Fraunces] 
--- garis dashed ---
[harga poin — mono] [tombol Detail]
```
- Badge sudut (BARU/TERLARIS/DISKON): hanya satu badge per kartu, warna gold, bentuk pita/ribbon di pojok kiri-atas — bukan pill mengambang.
- Border kartu tipis `--line`, tanpa shadow.

### 4.5 Podium leaderboard
```
[kartu #2] [kartu #1 — lebih tinggi & aksen gold] [kartu #3]
```
- Medali: lingkaran solid emas/perak/perunggu sesuai peringkat asli (jangan pakai gold untuk semua).
- Kartu peringkat 1 satu-satunya yang boleh pakai border/background aksen gold tipis.

### 4.6 Tombol (buttons)
| Varian | Pemakaian |
|---|---|
| `btn-gold` | CTA utama, maksimal satu per section |
| `btn-ghost` | CTA sekunder di atas background gelap/foto |
| `btn-outline-dark` | CTA sekunder di atas background terang |

Semua tombol: padding `12–14px 22–26px`, radius `5–7px`, font 14–15px/600, hover `translateY(-1px)`.

---

## 5. Ikonografi

- Line-icon sederhana, stroke ±1.6–1.8px, tanpa fill solid — selaras dengan gaya sketsa buku lapangan.
- Ikon di dalam stempel/marker selalu monokrom (ikuti warna teks di sekitarnya, bukan warna-warni).
- Hindari ikon 3D, gradient, atau ilustrasi flat-design generik.

---

## 6. Motion

- Transisi standar: `0.15–0.2s ease` untuk hover (tombol, card).
- Tidak ada animasi masuk yang berlebihan; scroll-reveal halus opsional (fade + translateY 8–12px) untuk ledger row dan trail stop saja.
- Hormati `prefers-reduced-motion`: matikan semua transisi/animasi non-esensial.

---

## 7. Aksesibilitas & konsistensi

- Kontras teks di atas `--ink`/`--forest` minimal setara AA (gunakan putih/`--paper` untuk body text di background gelap).
- Setiap tombol dan link punya focus state yang terlihat (outline atau ring, jangan dihilangkan).
- Bahasa UI: Bahasa Indonesia, sentence case (bukan Title Case), tanpa tanda seru pada label sistem.
- Jangan menambah warna aksen baru di luar `--gold` — kalau butuh warna status (sukses/gagal/peringatan), gunakan hijau/merah/kuning standar UI seminimal mungkin, tetap desaturasi agar tidak bentrok dengan palet.

---

## 8. Yang TIDAK berubah (preserved)

- Struktur dan konten hero: headline "Aksi Hijau Nyata, Dapatkan Poin Reward!", subcopy, dua tombol (Mulai Sekarang / Marketplace), serta dashboard card (Trust score, Total poin, Aksi hijau, progress misi, tombol "+ Lapor aksi hijau baru").
- Navigasi utama: Beranda, Marketplace, Challenge, Reward, Riwayat, Tentang Kami.
- Nama-nama section dan urutannya (statistik → cara kerja → challenge mingguan → katalog → leaderboard → CTA akhir → footer).

---

### Referensi implementasi
File contoh full-page (HTML/CSS) yang sudah menerapkan seluruh token dan komponen di atas: `ecolution-redesign.html` (dibagikan sebelumnya di percakapan ini).
