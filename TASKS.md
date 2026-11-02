Buatkan sebuah aplikasi GitHub Webhook to WhatsApp Group Notification Bot menggunakan teknologi berikut:

Tech Stack
Node.js
TypeScript
pnpm sebagai package manager
Baileys (@whiskeysockets/baileys) untuk integrasi WhatsApp
Express.js untuk menerima webhook
dotenv untuk environment configuration
pino untuk logging
qrcode-terminal untuk menampilkan QR Code WhatsApp
Tujuan Aplikasi

Aplikasi ini berfungsi sebagai penghubung antara GitHub Webhook dengan WhatsApp Group.

Setiap aktivitas yang terjadi di repository GitHub akan diteruskan secara otomatis ke grup WhatsApp yang telah dikonfigurasi.

Webhook menggunakan Content-Type:

application/json

1. GitHub Webhook Receiver

Buat endpoint:

POST /webhook/github

Endpoint harus:

Menerima payload JSON dari GitHub.
Membaca header X-GitHub-Event.
Memproses berbagai jenis event GitHub.
Menggunakan X-GitHub-Delivery sebagai identifier delivery.
Melakukan validasi payload.
Menangani error dengan baik.
Menghindari pemrosesan delivery ID yang sama secara berulang.
Memberikan HTTP response yang sesuai.
2. GitHub Events Support

Dukung berbagai event GitHub berikut:

push: Notifikasi commit baru.
pull_request: Opened, closed, reopened, synchronize, merged.
issues: Opened, closed, reopened, edited.
issue_comment: Komentar baru pada issue.
release: Published, created, edited.
fork: Repository di-fork.
watch: Repository mendapatkan star.
create: Branch atau tag dibuat.
delete: Branch atau tag dihapus.
workflow_run: GitHub Actions workflow selesai.
workflow_job: GitHub Actions job selesai.
check_run: Check run selesai.
deployment: Deployment dibuat.
deployment_status: Status deployment berubah.
discussion: Diskusi baru atau diperbarui.
discussion_comment: Komentar diskusi baru.

Buat formatter khusus untuk masing-masing event agar pesan WhatsApp mudah dibaca.

3. WhatsApp Integration menggunakan Baileys

Implementasikan WhatsApp menggunakan Baileys dengan fitur:

Login menggunakan QR Code.
Menyimpan authentication session secara lokal.
Auto reconnect ketika koneksi terputus.
Menangani connection update.
Menangani credential update.
Memastikan WhatsApp sudah terkoneksi sebelum mengirim pesan.
Mengambil daftar grup WhatsApp.
Mengirim notifikasi ke grup berdasarkan GROUP_ID dari konfigurasi.
Mendukung multiple target groups.

Gunakan pendekatan modular sehingga WhatsApp service tidak bercampur dengan webhook controller.

4. Format Pesan WhatsApp

Buat format pesan yang menarik, informatif, dan mudah dibaca.

Contoh notifikasi push:

🚀 GITHUB PUSH

📦 Repository: owner/project 👤 Author: username 🌿 Branch: main

📝 Commit:

Fix authentication bug
Update API response

🔗 Commit URL: https://github.com/owner/project/commit/xxxxx

Contoh notifikasi Pull Request:

🔀 PULL REQUEST OPENED

📦 Repository: owner/project 👤 Author: username 📝 Title: Add authentication feature 🔢 PR Number: #12 📌 Base: main 🌿 Head: feature/auth

🔗 URL: https://github.com/owner/project/pull/12

Contoh notifikasi GitHub Actions:

⚙️ GITHUB ACTIONS

📦 Repository: owner/project 👤 Actor: username 🔧 Workflow: CI Pipeline 📊 Status: completed ✅ Conclusion: success

🔗 URL: https://github.com/owner/project/actions/runs/123456

Buat formatter yang berbeda untuk setiap event, dengan fallback untuk event yang belum didukung.

5. Configuration Environment

Buat file .env.example:

PORT=3000 HOST=0.0.0.0 WHATSAPP_SESSION_PATH=./auth_info WHATSAPP_GROUP_IDS=120xxxxxxxx@g.us GITHUB_WEBHOOK_SECRET=your_webhook_secret LOG_LEVEL=info

Gunakan environment variable untuk seluruh konfigurasi penting.

6. Project Structure

Gunakan struktur project yang bersih dan scalable:

src/ ├── config/ │ └── env.ts ├── services/ │ ├── whatsapp.service.ts │ └── github.service.ts ├── controllers/ │ └── webhook.controller.ts ├── routes/ │ └── webhook.routes.ts ├── formatters/ │ ├── push.formatter.ts │ ├── pull-request.formatter.ts │ ├── issues.formatter.ts │ ├── release.formatter.ts │ ├── workflow.formatter.ts │ └── index.ts ├── middlewares/ │ ├── webhook-auth.middleware.ts │ └── error.middleware.ts ├── utils/ │ └── logger.ts ├── types/ │ └── github.ts └── index.ts

auth_info/ .env .env.example .gitignore package.json pnpm-lock.yaml tsconfig.json README.md

7. Security

Implementasikan keamanan berikut:

Validasi GitHub Webhook Signature menggunakan HMAC SHA-256.
Gunakan timingSafeEqual untuk membandingkan signature.
Jangan pernah mengekspos WhatsApp session.
Jangan mengirim pesan jika signature tidak valid.
Jangan menyimpan webhook secret di source code.
Tambahkan validasi ukuran request body.
Tambahkan error handling dan logging.

Pastikan signature diverifikasi menggunakan raw request body sebelum JSON parsing mengubah representasi payload.

8. Reliability

Implementasikan:

Queue untuk pengiriman pesan WhatsApp.
Retry ketika pengiriman gagal.
Delay antar pengiriman pesan.
Duplicate delivery protection.
Graceful shutdown.
Reconnection handling.
Logging untuk setiap webhook yang diterima dan pesan yang dikirim.
Jangan sampai satu kegagalan event menghentikan aplikasi.
9. API Endpoints

Buat endpoint tambahan:

GET /health Untuk mengecek status server.

GET /whatsapp/status Untuk melihat status koneksi WhatsApp.

GET /whatsapp/groups Untuk mendapatkan daftar grup WhatsApp yang tersedia.

POST /webhook/github Untuk menerima GitHub Webhook.

10. Development & Deployment

Buat scripts pnpm:

pnpm dev
pnpm build
pnpm start
pnpm typecheck

Pastikan aplikasi bisa dijalankan pada VPS Linux.

11. Dokumentasi

Buat README.md lengkap yang menjelaskan:

Persyaratan instalasi.
Instalasi dependencies menggunakan pnpm.
Cara menjalankan aplikasi.
Cara scan QR WhatsApp.
Cara mendapatkan WhatsApp Group ID.
Cara konfigurasi GitHub Webhook.
Cara mengatur Content-Type application/json.
Cara mengatur webhook secret.
Daftar event GitHub yang didukung.
Cara build dan menjalankan production.
Troubleshooting.
Ketentuan Pengerjaan
Gunakan TypeScript strict mode.
Gunakan ES Modules.
Gunakan kode yang modular dan reusable.
Hindari penggunaan any.
Gunakan async/await.
Pastikan kompatibel dengan versi Baileys terbaru yang stabil.
Jangan membuat pseudo-code.
Jangan menghilangkan implementasi penting.
Setiap file harus memiliki kode yang benar-benar bisa dijalankan.
Pastikan seluruh dependency dan import valid.
Jangan menaruh semua logic dalam satu file.

Hasil akhir: Berikan seluruh source code project, mulai dari konfigurasi pnpm, package.json, TypeScript configuration, seluruh file dalam folder src, .env.example, hingga README.md. Sertakan instruksi instalasi dan cara menjalankan project dari awal sampai berhasil mengirim notifikasi GitHub ke WhatsApp Group.
