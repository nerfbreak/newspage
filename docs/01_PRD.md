# PRD - Web-Based Playwright Automation System

## 1. Ringkasan Produk
Produk ini adalah dashboard web modern untuk menggantikan UI Streamlit lama yang digunakan untuk menjalankan otomatisasi kerja harian. Aplikasi baru dibangun dengan Next.js, TypeScript, Tailwind CSS, shadcn/ui, dan Supabase. Dashboard berjalan di Vercel, sementara proses Playwright yang berdurasi panjang berjalan di worker terpisah.

## 2. Latar Belakang
Sistem Streamlit lama sudah berhasil menjalankan business logic dan automasi harian. Namun, Streamlit membatasi fleksibilitas UI/UX, komponen dashboard, layout modern, dan pengalaman monitoring real-time. Migrasi ini bertujuan mempertahankan automation flow yang sudah jalan sambil meningkatkan tampilan, struktur kode, observability, dan maintainability.

## 3. Tujuan
- Membuat dashboard modern untuk trigger automation secara manual.
- Menampilkan status job secara real-time.
- Menyediakan riwayat job, log, error, result summary, retry, dan cancel.
- Memisahkan dashboard dan long-running worker agar stabil di free tier.
- Menjaga Supabase sebagai pusat Auth, Database, Realtime, dan queue/state.
- Memudahkan deployment ke Vercel dan Supabase free tier.

## 4. Non-Tujuan
- Tidak membuat cron/scheduler otomatis pada versi awal.
- Tidak menjalankan Playwright jangka panjang langsung di Vercel Function.
- Tidak mengganti semua business logic Playwright jika logic lama masih valid.
- Tidak membuat multi-tenant enterprise system pada versi awal.
- Tidak menyimpan credentials portal kerja di frontend.

## 5. Target User
### Admin
Mengatur user, role, konfigurasi worker, dan memantau semua job.

### Operator
Menjalankan automation, melihat progress, membaca log, retry job gagal.

### Viewer
Hanya melihat dashboard, job history, dan log tanpa akses trigger.

## 6. Use Case Utama
1. User login ke dashboard.
2. User klik Run Automation.
3. Sistem membuat job baru dengan status `queued`.
4. Worker mengambil job dari Supabase.
5. Worker menjalankan Playwright.
6. Worker update status, progress, logs, dan result.
7. User melihat progress dan log secara real-time.
8. Jika gagal, user bisa membaca error dan retry.

## 7. Fitur Utama
### 7.1 Authentication
- Login menggunakan Supabase Auth.
- Protected dashboard routes.
- Session handling.
- Role-ready structure: admin, operator, viewer.

### 7.2 Dashboard Overview
- Total jobs hari ini.
- Running jobs.
- Successful jobs.
- Failed jobs.
- Latest run.
- Recent activity.
- Worker status/heartbeat.
- Quick action untuk Run Automation.

### 7.3 Jobs Management
- Tabel job dengan filter status, tanggal, task name.
- Detail kolom: ID, task name, status, progress, triggered by, started at, finished at, duration, result summary.
- Action: view detail, retry, cancel.

### 7.4 Job Detail
- Metadata job.
- Status badge real-time.
- Progress bar.
- Live logs.
- Error details.
- Result JSON/summary.
- Optional artifacts: screenshot/export files.
- Retry button.

### 7.5 Manual Trigger
- Modal/page untuk memilih task type.
- Form optional parameters.
- Confirmation dialog.
- Membuat job `queued`.
- Redirect ke job detail.

### 7.6 Logs
- Live logs dari Supabase.
- Search/filter by job, level, message, date.
- Terminal-like mode.
- Log levels: info, warning, error, success.

### 7.7 Settings
- Supabase connection status.
- Worker webhook URL.
- Worker heartbeat status.
- Automation config.
- Env variable documentation.
- Team/role settings optional.

## 8. Success Metrics
- User bisa menjalankan automation manual dari dashboard.
- Progress dan log muncul real-time.
- Job yang gagal memiliki error message jelas.
- Job history tersimpan dan bisa difilter.
- Worker tidak bergantung pada Vercel function untuk proses panjang.
- App bisa deploy di Vercel dan jalan lokal dengan `pnpm dev`.

## 9. Constraints
- Tetap free-tier friendly.
- Vercel hanya untuk dashboard dan lightweight API.
- Supabase sebagai database utama.
- Worker terpisah untuk Playwright.
- Tidak ada cron pada MVP.

## 10. Acceptance Criteria
- Login berjalan dan dashboard terlindungi.
- User bisa membuat job baru.
- Job tersimpan di `automation_jobs`.
- Worker bisa membaca job `queued`.
- Worker bisa update status, progress, logs, result, dan error.
- Dashboard update otomatis via realtime.
- Retry failed job membuat job baru atau reset job sesuai strategi.
- Cancel hanya berlaku untuk `queued` atau `running` dengan cooperative cancellation.
- Semua secret hanya ada di environment/server/worker.
