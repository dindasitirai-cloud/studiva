# REKAH_BACKEND_INVENTORY — Temuan Infrastruktur

**Tanggal deteksi:** 2026-07-18  
**Jalur terpilih:** JALUR A — Database sudah ada

---

## Infrastruktur yang Terdeteksi

### Database
- **Engine:** SQLite via package `sqlite3@5.1.7`
- **Path:** `./database.db` (dari `.env` → `DATABASE_URL`)
- **Client:** custom helpers `run()`, `get()`, `all()` di `backend/src/database.ts`
- **Migrasi:** `CREATE TABLE IF NOT EXISTS` di `database/schema.sql` + `COLUMN_MIGRATIONS` array di `database.ts` (run on startup, ignore duplicate column error)
- **Pola upsert:** manual (`SELECT` → `INSERT` atau `UPDATE`)

### Auth
- **Mekanisme:** Custom JWT (`jsonwebtoken@9.0.2` + `bcrypt@5.1.1`)
- **Token:** disimpan di `localStorage('studiva_token')` di frontend
- **Server:** `authenticate` middleware (`backend/src/middleware/auth.ts`) → populates `req.user: AuthTokenPayload`
- **User identity di route:** `req.user!.id` (number — integer primary key dari tabel `users`)
- **JWT payload:** `{ id: number, email, role, name }` — expires 7d
- **Scoping enforcement:** filter `WHERE user_id = ?` di setiap query; user_id TIDAK pernah dari request body

### Frontend API Client
- **Library:** axios (`api` singleton di `apps/digital/src/api/client.ts`)
- **Base URL:** `process.env.REACT_APP_API_URL || 'http://localhost:5000'` + `/api`
- **Auto-token:** interceptor request menambahkan `Authorization: Bearer <token>`
- **Auto-logout:** interceptor response 401 → hapus token + redirect ke `/login`

### Backend Framework
- **Express + TypeScript** di `backend/`
- **Semua route:** `router.use(authenticate)` — wajib JWT valid
- **Error handling:** `asyncHandler` + `ApiError(status, message)` di `middleware/errorHandler.ts`
- **Validasi:** manual (tidak ada Zod/Joi di repo)

### Stripe / Pembayaran
- Stripe webhook di `POST /api/payments/webhook` (raw body, sebelum JSON parser)
- Data pelanggan di tabel `subscriptions` dan `payments` (scoped per `user_id`)
- **TIDAK disentuh** dalam Build 5

---

## JALUR A — Rencana Implementasi

1. **FASE 1:** Tambah 5 tabel Rekah ke `database/schema.sql`
2. **FASE 2:** Buat `backend/src/routes/rekah.ts` + register di `server.ts`
3. **FASE 3:** Update 4 frontend contexts + `BerandaRekah.tsx`
4. **FASE 4:** Seksi privasi di `PengaturanPage.tsx`
5. **FASE 5:** Build check + laporan

---

## Pertanyaan yang Perlu Dijawab (untuk informasi saja — tidak memblok build)

- Multi-anak: apakah satu user bisa punya lebih dari satu anak Rekah? Saat ini **1 profil per user** (MVPs). Tandai `// TODO: multi-anak pasca-MVP` di kode.
- Railway vs Vercel: backend di-deploy ke Railway (`railway.json` ada). Database SQLite di Railway — path perlu diverifikasi saat deploy.
