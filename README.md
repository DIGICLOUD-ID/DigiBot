# GitHub Webhook to WhatsApp Group Notification Bot 🚀

Aplikasi penghubung (bridge) otomatis antara **GitHub Webhook** dan **WhatsApp Group** menggunakan Node.js, TypeScript, Express, dan Baileys (`@whiskeysockets/baileys`).

Setiap aktivitas di repository GitHub (commit push, pull request, issues, workflow CI/CD, release, komentar, dsb.) akan diformat secara rapi dan diteruskan langsung ke satu atau beberapa grup WhatsApp secara real-time.

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi Environment (.env)](#-konfigurasi-environment-env)
- [Cara Menjalankan](#-cara-menjalankan)
  - [Mode Development](#1-mode-development)
  - [Mode Production](#2-mode-production)
  - [Menggunakan PM2 (VPS / Server)](#3-menjalankan-dengan-pm2-rekomendasi-vps)
- [Menghubungkan WhatsApp (Scan QR)](#-menghubungkan-whatsapp-scan-qr)
- [Cara Mendapatkan WhatsApp Group ID](#-cara-mendapatkan-whatsapp-group-id)
- [Konfigurasi GitHub Webhook](#-konfigurasi-github-webhook)
- [Daftar GitHub Events yang Didukung](#-daftar-github-events-yang-didukung)
- [API Endpoints](#-api-endpoints)
- [Keamanan & Reliabilitas](#-keamanan--reliabilitas)
- [Troubleshooting](#-troubleshooting)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

- 🔗 **Integrasi GitHub Penuh**: Mendukung 16+ GitHub Events dengan pesan WhatsApp berformat khusus yang informatif.
- 📱 **WhatsApp Baileys v7 Multi-Device**: Koneksi stabil, QR code di terminal, sesi disimpan lokal, dan auto-reconnect saat terputus.
- 👥 **Multi-Group Broadcast**: Mendukung pengiriman pesan ke lebih dari satu grup WhatsApp secara bersamaan.
- 🔐 **Keamanan HMAC SHA-256**: Validasi signature `X-Hub-Signature-256` dengan `crypto.timingSafeEqual` dan verifikasi raw body.
- 🛡️ **Duplicate Delivery Protection**: Mencegah spam atau pemrosesan berulang dari GitHub delivery ID yang sama menggunakan in-memory TTL cache.
- ⏱️ **Message Queue & Rate Limiting**: Antrean pengiriman pesan dengan jeda interval dan auto-retry backoff untuk mencegah rate-limit atau deteksi spam oleh WhatsApp.
- 🔍 **Endpoint Diagnostik**: Endpoint `/whatsapp/groups` untuk melihat daftar grup dan Group ID secara instan, serta `/health` dan `/whatsapp/status`.
- 🛑 **Graceful Shutdown**: Menutup koneksi HTTP, menguras antrean pesan, dan memutuskan koneksi WhatsApp secara bersih tanpa menghapus sesi login.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Bahasa**: TypeScript (Strict Mode, ES Modules)
- **Package Manager**: pnpm
- **WhatsApp Web API**: `@whiskeysockets/baileys`
- **Web Server**: Express.js
- **Logger**: Pino & Pino-Pretty
- **QR Code**: qrcode-terminal
- **Config**: dotenv

---

## 📂 Struktur Project

```
├── auth_info/                  # Penyimpanan sesi WhatsApp lokal (diabaikan oleh git)
├── dist/                       # Output build TypeScript
├── src/
│   ├── config/
│   │   └── env.ts              # Konfigurasi & validasi environment
│   ├── controllers/
│   │   ├── webhook.controller.ts  # Controller endpoint GitHub Webhook
│   │   └── whatsapp.controller.ts # Controller endpoint status & groups
│   ├── formatters/             # Formatter pesan WhatsApp untuk setiap GitHub Event
│   │   ├── branch-tag.formatter.ts   # Create/delete branch & tag
│   │   ├── deployment.formatter.ts   # Deployment & deployment status
│   │   ├── discussion.formatter.ts   # GitHub Discussions & komentar
│   │   ├── fallback.formatter.ts     # Format umum & ping event
│   │   ├── issue-comment.formatter.ts# Komentar pada issue/PR
│   │   ├── issues.formatter.ts       # Issue opened, closed, edited
│   │   ├── pull-request.formatter.ts # PR opened, merged, closed, updated
│   │   ├── push.formatter.ts         # Push commit, branch, author
│   │   ├── release.formatter.ts      # Release published & drafts
│   │   ├── repo-activity.formatter.ts# Fork & watch (star)
│   │   ├── workflow.formatter.ts     # Actions workflow, jobs, checks
│   │   └── index.ts                  # Dispatcher formatter
│   ├── middlewares/
│   │   ├── error.middleware.ts       # Error handling & 404 handler
│   │   └── webhook-auth.middleware.ts# HMAC SHA-256 raw body validation
│   ├── routes/
│   │   └── webhook.routes.ts   # Definisi route API
│   ├── services/
│   │   ├── github.service.ts   # Business logic webhook GitHub
│   │   └── whatsapp.service.ts # Baileys WhatsApp client & lifecycle
│   ├── types/
│   │   ├── github.ts           # Type definitions GitHub payloads
│   │   └── whatsapp.ts         # Type definitions WhatsApp
│   ├── utils/
│   │   ├── cache.ts            # TTL cache deduplikasi delivery ID
│   │   ├── logger.ts           # Logger pino terkonfigurasi
│   │   └── queue.ts            # Message queue dengan retry & rate limiting
│   └── index.ts                # Application entrypoint & graceful shutdown
├── tests/
│   └── test-suite.ts           # Unit & integration test suite
├── .env.example                # Template environment variables
├── .gitignore                  # Git ignore file
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📋 Persyaratan Sistem

- **Node.js**: Versi 18.0.0 atau lebih baru (Disarankan Node.js LTS v20 atau v22+)
- **pnpm**: Versi 8, 9, 10, atau 11 (`npm install -g pnpm`)
- **Akses Internet** untuk koneksi WhatsApp Baileys dan GitHub Webhook
- **Public URL** untuk server webhook (menggunakan VPS dengan IP Publik, Domain dengan Nginx / Caddy, atau tunnel seperti Cloudflare Tunnel / Ngrok saat development lokal)

---

## 📥 Instalasi

1. **Clone repository ini** atau navigasikan ke direktori project:
   ```bash
   git clone <repository_url>
   cd DIGICLOUD
   ```

2. **Install dependencies** menggunakan pnpm:
   ```bash
   pnpm install
   ```

3. **Buat file `.env`** dari contoh template:
   ```bash
   cp .env.example .env
   ```

---

## ⚙️ Konfigurasi Environment (`.env`)

Buka file `.env` dan sesuaikan nilainya:

```env
# Port & Host server Express
PORT=3000
HOST=0.0.0.0

# Path folder penyimpanan sesi WhatsApp
WHATSAPP_SESSION_PATH=./auth_info

# WhatsApp Target Group ID (bisa lebih dari satu, pisahkan dengan koma)
# Contoh: 120363023456789012@g.us,120363098765432101@g.us
# Jika belum punya Group ID, biarkan kosong dulu lalu scan QR dan buka GET /whatsapp/groups
WHATSAPP_GROUP_IDS=120xxxxxxxx@g.us

# GitHub Webhook Secret (Secret yang sama diisi pada repository GitHub)
GITHUB_WEBHOOK_SECRET=your_super_secret_webhook_token_here

# Level Log (trace, debug, info, warn, error, fatal)
LOG_LEVEL=info

# Reliabilitas pengiriman pesan
MESSAGE_RATE_LIMIT_MS=1000
MESSAGE_MAX_RETRIES=3
```

> [!IMPORTANT]
> **Keamanan Sesi WhatsApp**: Folder `auth_info/` berisi token autentikasi WhatsApp privat. Pastikan folder ini **TIDAK PERNAH** di-commit ke Git. `.gitignore` sudah otomatis mengabaikannya.

---

## 🚀 Cara Menjalankan

### 1. Mode Development

Jalankan server dengan auto-reload saat file berubah (`tsx watch`):

```bash
pnpm dev
```

### 2. Mode Production

Kompilasi TypeScript ke JavaScript murni lalu jalankan:

```bash
pnpm build
pnpm start
```

Untuk memeriksa tipe tanpa kompilasi:
```bash
pnpm typecheck
```

Untuk menjalankan unit test:
```bash
pnpm test
```

### 3. Menjalankan dengan PM2 (Rekomendasi VPS)

Untuk production di VPS Linux, gunakan process manager seperti PM2 agar bot berjalan di background dan otomatis restart saat server reboot:

```bash
# Build terlebih dahulu
pnpm build

# Install PM2 jika belum ada
npm install -g pm2

# Jalankan aplikasi
pm2 start dist/index.js --name "github-whatsapp-bot"

# Simpan proses agar otomatis aktif saat reboot
pm2 save
pm2 startup
```

---

## 📱 Menghubungkan WhatsApp (Scan QR)

1. Jalankan aplikasi (`pnpm dev` atau `pnpm start`).
2. Terminal akan menampilkan **QR Code**:
   ```
   ======================================================
   📱 SCAN WHATSAPP QR CODE DENGAN HP ANDA:
   ======================================================
   [QR Code di terminal]
   Buka WhatsApp di HP > Linked Devices > Link a Device > Scan QR diatas.
   ```
3. Buka WhatsApp pada smartphone Anda:
   - Pilih menu **Titik Tiga** (Android) atau **Pengaturan / Settings** (iOS).
   - Pilih **Perangkat Tertaut (Linked Devices)**.
   - Ketuk tombol **Tautkan Perangkat (Link a Device)**.
   - Arahkan kamera smartphone ke QR Code yang muncul di terminal.
4. Setelah berhasil, terminal akan menampilkan pesan:
   ```
   WhatsApp connection established successfully!
   ```
5. Sesi akan disimpan di folder `auth_info/`, sehingga Anda **tidak perlu scan QR ulang** ketika aplikasi di-restart.

---

## 🔍 Cara Mendapatkan WhatsApp Group ID

Untuk mengirim pesan ke grup, bot memerlukan **Group JID** (format: `120xxxxxxxxxxxxxxx@g.us`). Aplikasi ini menyediakan endpoint bawaan untuk melihat semua grup yang diikuti nomor bot:

1. Pastikan bot sudah terhubung ke WhatsApp (sudah scan QR).
2. Tambahkan nomor bot ke dalam grup WhatsApp yang ingin dijadikan target notifikasi.
3. Akses endpoint berikut melalui browser atau curl:
   ```bash
   curl http://localhost:3000/whatsapp/groups
   ```
4. Anda akan menerima respons JSON berisi daftar grup:
   ```json
   {
     "total": 2,
     "groups": [
       {
         "id": "120363234567890123@g.us",
         "subject": "DevOps & Engineering Team",
         "participantsCount": 15
       },
       {
         "id": "120363987654321098@g.us",
         "subject": "Digicloud Project Updates",
         "participantsCount": 6
       }
     ]
   }
   ```
5. Salin nilai `id` grup yang diinginkan (misal `120363234567890123@g.us`) ke dalam file `.env`:
   ```env
   WHATSAPP_GROUP_IDS=120363234567890123@g.us
   ```
   Jika ingin mengirim ke beberapa grup sekaligus:
   ```env
   WHATSAPP_GROUP_IDS=120363234567890123@g.us,120363987654321098@g.us
   ```
6. Restart bot agar perubahan konfigurasi `.env` dimuat.

---

## 🐙 Konfigurasi GitHub Webhook

1. Buka repository GitHub Anda.
2. Masuk ke **Settings** > **Webhooks** > Klik **Add webhook**.
3. Isi form konfigurasi sebagai berikut:
   - **Payload URL**:
     `https://your-domain.com/webhook/github`
     *(Jika menggunakan localhost saat development, gunakan Cloudflare Tunnel atau Ngrok: `https://xxxx.ngrok-free.app/webhook/github`)*
   - **Content type**:
     Pilih **`application/json`** *(Sangat penting! Jangan gunakan application/x-www-form-urlencoded)*.
   - **Secret**:
     Masukkan secret yang sama persis dengan yang Anda tulis di `GITHUB_WEBHOOK_SECRET` pada file `.env`.
   - **SSL verification**:
     Pilih **Enable SSL verification**.
   - **Which events would you like to trigger this webhook?**:
     - Pilih **"Send me everything"** untuk menerima semua notifikasi, ATAU
     - Pilih **"Let me select individual events"** dan centang event yang Anda butuhkan (Push, Pull requests, Issues, Workflow runs, Releases, dll).
   - Pastikan **Active** dicentang.
4. Klik tombol **Add webhook**.
5. GitHub akan mengirimkan event `ping`. Periksa terminal bot Anda, notifikasi konfirmasi verifikasi Webhook akan muncul!

---

## 🔔 Daftar GitHub Events yang Didukung

Aplikasi ini memiliki formatter visual lengkap untuk setiap event:

| Event GitHub | Trigger | Contoh Konten Pesan WhatsApp |
|---|---|---|
| `push` | Commit baru di-push | Author, branch, daftar pesan commit, tautan commit / compare |
| `pull_request` | PR opened, closed, merged, reopened, synchronize | Author, judul PR, nomor PR, status draft, branch base ⬅️ head, tautan PR |
| `issues` | Issue dibuka, ditutup, dibuka ulang, diedit | Author, judul issue, nomor issue, kutipan deskripsi, tautan issue |
| `issue_comment` | Komentar baru pada issue atau PR | Pengomentar, nomor issue, ringkasan komentar, tautan komentar |
| `release` | Rilis baru dipublikasikan atau draft dibuat | Tag rilis, nama rilis, author, release notes, tautan rilis |
| `workflow_run` | GitHub Actions workflow selesai / gagal | Nama workflow, branch, status (completed/in_progress), conclusion (✅ Success / ❌ Failure) |
| `workflow_job` | GitHub Actions job selesai | Nama job, status, tautan run job |
| `check_run` | Status check run selesai | Nama check suite, hasil conclusion |
| `create` | Branch atau tag baru dibuat | Tipe (branch/tag), nama ref, author, tautan repo |
| `delete` | Branch atau tag dihapus | Tipe (branch/tag), nama ref yang dihapus |
| `fork` | Repository di-fork oleh pengguna lain | Nama repo asal, nama akun pembeli fork, tautan fork |
| `watch` | Repository mendapatkan Bintang (Star) | Nama repo, username pemberi star |
| `deployment` | Deployment baru dibuat | Environment (e.g. production/staging), branch ref |
| `deployment_status`| Status deployment berubah | Status (✅ success, ❌ failure, 🔄 in progress), target URL |
| `discussion` | Diskusi GitHub dibuat/dijawab/ditutup | Judul diskusi, kategori, author, preview isi |
| `discussion_comment` | Komentar baru pada diskusi | Pengomentar, judul diskusi, isi komentar |
| `ping` | Verifikasi awal webhook oleh GitHub | Pesan Zen GitHub, konfirmasi sukses |
| *Fallback* | Event lainnya yang belum terdaftar | Notifikasi nama event, user, dan tautan repositori |

---

## 🌐 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/health` | Mengecek uptime server dan status bot |
| `GET` | `/whatsapp/status` | Mengecek status koneksi WhatsApp, nomor bot, dan antrean pesan |
| `GET` | `/whatsapp/groups` | Mendapatkan daftar seluruh grup WhatsApp beserta Group ID |
| `POST` | `/webhook/github` | Menerima payload GitHub Webhook (diamankan dengan HMAC SHA-256) |

---

## 🔒 Keamanan & Reliabilitas

1. **HMAC SHA-256 Signature Verification**:
   - Signature dihitung dari **raw request body buffer** asli sebelum diproses oleh JSON parser.
   - Menggunakan `crypto.timingSafeEqual` untuk mencegah serangan timing-attack.
   - Request tanpa header atau dengan signature yang salah langsung ditolak dengan status HTTP 401 Unauthorized.

2. **Deduplikasi Pesan (Delivery Cache)**:
   - Header `X-GitHub-Delivery` unik dari GitHub dicatat dalam in-memory cache dengan TTL otomatis.
   - Jika GitHub mengirimkan delivery ID yang sama (misal akibat retry network), webhook diterima (HTTP 200) namun pengiriman pesan ke WhatsApp di-skip agar tidak terjadi notifikasi ganda.

3. **Message Queue & Anti-Ban WhatsApp**:
   - Seluruh pengiriman notifikasi dimasukkan ke antrean teratur (`MessageQueue`).
   - Terdapat jeda `1000ms` antar pengiriman pesan untuk menjaga perilaku bot tetap natural dan aman dari flagging WhatsApp.
   - Dilengkapi mekanisme exponential backoff retry hingga 3 kali jika pengiriman sempat gagal sementara.

4. **Koneksi Auto-Reconnect**:
   - Jika koneksi terputus karena masalah jaringan atau timeout server, bot akan otomatis mencoba menghubungkan kembali tanpa perlu campur tangan manual.

---

## ❓ Troubleshooting

### 1. Terminal tidak menampilkan QR Code
- Pastikan folder `auth_info/` belum memiliki kredensial aktif. Jika ingin ganti akun WhatsApp, hapus isi folder `auth_info/` lalu restart aplikasi:
  ```bash
  rm -rf auth_info/*
  pnpm dev
  ```

### 2. Notifikasi GitHub tidak masuk ke grup WhatsApp
- Pastikan nomor bot **sudah dimasukkan sebagai anggota grup** WhatsApp tersebut.
- Periksa `WHATSAPP_GROUP_IDS` di file `.env`. Pastikan berakhiran `@g.us` (misal `120363023456789012@g.us`).
- Periksa status bot via `http://localhost:3000/whatsapp/status`. Pastikan `"connected": true`.

### 3. GitHub Webhook menampilkan error `401 Unauthorized`
- Periksa apakah `GITHUB_WEBHOOK_SECRET` di `.env` sudah sama persis dengan **Secret** di pengaturan Webhook GitHub.
- Pastikan **Content type** di Webhook GitHub dipilih **`application/json`** (bukan form-urlencoded).

### 4. Port 3000 sudah digunakan aplikasi lain
- Ubah `PORT` di file `.env`, misalnya `PORT=3001` atau `PORT=8080`.

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT](LICENSE).
