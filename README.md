# ElTrack

ElTrack adalah aplikasi pencatatan keuangan pribadi berbasis web untuk membantu pengguna memantau pemasukan, pengeluaran, kategori belanja, metode pembayaran, dan ringkasan dashboard bulanan dalam satu tempat.

## Tujuan

Tujuan utama ElTrack adalah membuat pencatatan keuangan harian terasa lebih sederhana, cepat, dan mudah dibaca. Aplikasi ini dirancang supaya pengguna bisa:

- mencatat transaksi harian dengan rapi
- melihat ringkasan finansial bulanan
- memahami pola pengeluaran berdasarkan kategori dan metode pembayaran
- memanfaatkan chatbot AI untuk bantuan interaksi data tertentu

## Release

Version: **1.0.0-beta.4**

Status: **Beta**

Fokus versi sekarang:

- autentikasi pengguna
- pencatatan transaksi
- dashboard home
- chatbot AI dasar

## Fitur

- Login dengan Better Auth (Google provider only)
- Dashboard home dengan:
  - total saldo
  - total pengeluaran
  - total penghasilan
  - rata-rata pengeluaran harian
  - chart tren pengeluaran vs penghasilan
  - distribusi pengeluaran per kategori
  - pengeluaran per metode pembayaran
  - transaksi terbaru
  - top kategori bulan berjalan
- Catatan keuangan:
  - mode tabel
  - mode kalender
  - tambah, ubah, hapus transaksi
- Master data:
  - kategori
  - metode pembayaran
  - tipe transaksi
- Chatbot AI dengan TanStack AI + Gemini

## Tech Stack

- TanStack Start + Vite
- React 19
- TypeScript
- Tailwind CSS
- Better Auth (Google provider only)
- MongoDB + Mongoose
- TanStack AI
- Gemini API
- ApexCharts

## Struktur Folder

```txt
src/
  components/
    chatbot/              # UI chatbot
    dashboard/            # UI dashboard home
    catatan-keuangan/     # UI tabel & kalender transaksi
    layouts/              # layout aplikasi
    selia/                # primitive UI reusable
    shared/               # shared app components
  const/                  # konstanta aplikasi
  db/                     # koneksi DB dan model mongoose
  features/               # backend per feature (repository/service/functions)
    chatbot/
    dashboard/
    kategori/
    metode-pembayaran/
    tipe/
    transaksi/
  hooks/                  # custom hooks
  lib/                    # helper dan utils
  routes/                 # file-based routing TanStack Router
  stores/                 # zustand store
  types/                  # type shared client-side
scripts/
  seed.ts                 # seed data awal
```

## Cara Install

### 1. Install dependency

```bash
npm install
```

### 2. Siapkan environment

Copy file contoh env:

```bash
cp .env.example .env
```

Lalu isi value yang dibutuhkan, terutama:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MONGODB_URI`

Jika ingin memakai chatbot AI via Gemini, siapkan juga:

- `GOOGLE_API_KEY`
- `GEMINI_TEXT_MODEL`
- `GEMINI_VISION_MODEL`

### 3. Jalankan seed data opsional

```bash
npm run seed
```

### 4. Jalankan aplikasi

```bash
npm run dev
```

App akan berjalan di:

```txt
http://localhost:3000
```

## Setup Gemini

Jika ingin memakai fitur chatbot AI, siapkan API key Gemini dari Google AI Studio lalu isi env berikut:

```txt
GOOGLE_API_KEY=your_google_ai_api_key
GEMINI_TEXT_MODEL=gemini-2.5-flash-lite
GEMINI_VISION_MODEL=gemini-2.5-flash
```

Default strategy saat ini:

- chat teks biasa memakai `gemini-2.5-flash-lite`
- request bergambar atau struk memakai `gemini-2.5-flash`

Kalau ingin tetap memakai satu model untuk semua request, kamu masih bisa isi `GEMINI_MODEL` saja sebagai fallback.

## Scripts

```bash
npm run dev      # menjalankan aplikasi lokal
npm run build    # build production
npm run preview  # preview hasil build
npm run seed     # seed data awal
npm run test     # menjalankan test
```

## Environment Example

Lihat file [`/.env.example`](./.env.example)

## Saran Pengembangan Berikutnya

- export laporan keuangan
- filter dashboard lebih fleksibel
- insight AI yang lebih kontekstual
- pengaturan profil dan preferensi pengguna
