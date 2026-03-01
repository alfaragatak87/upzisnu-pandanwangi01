# UPZISNU Pandanwangi 01 — Web App (Offline-First)

Stack: Next.js (TypeScript) + Prisma + PostgreSQL

## 1) Persiapan (Windows 11)
1. Pastikan Node.js sudah terpasang (disarankan LTS).
2. Pastikan PostgreSQL lokal sudah jalan di `127.0.0.1:5432`.
3. Buka folder project ini di VS Code.

## 2) Buat database (contoh dengan psql)
> Kamu boleh pakai user postgres yang sudah ada. Ini contoh paling aman.

```sql
CREATE DATABASE upzisnu_db;
```

Jika mau buat user khusus:
```sql
CREATE USER upzisnu WITH PASSWORD 'ganti_password_aman';
GRANT ALL PRIVILEGES ON DATABASE upzisnu_db TO upzisnu;
```

## 3) Set environment
1. Copy `.env.example` menjadi `.env`
2. Isi `DATABASE_URL` sesuai database kamu.

Contoh (pakai user postgres):
```
DATABASE_URL="postgresql://postgres:ISI_PASSWORD@localhost:5432/upzisnu_db?schema=public"
```

## 4) Install & migrate
Di terminal (PowerShell / CMD) pada folder project:
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Buka:
- Website publik: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

## 5) Akun admin awal
- Username: `alfatih`
- Password: `050105`

> Password disimpan sebagai hash di database.

## 6) Upload file (foto/PDF)
Pada MVP offline, upload disimpan ke:
- `public/uploads/...`

Saat online nanti, kita bisa pindahkan storage ke S3/Cloudinary/Supabase Storage tanpa rombak besar (tinggal ganti adapter di `src/lib/upload.ts`).
