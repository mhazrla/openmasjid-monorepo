# Codebase Audit Report (Senior Fullstack & Security Auditor Perspective)

## Executive Summary
Hasil review menunjukkan bahwa secara arsitektur monorepo sudah tertata dengan baik menggunakan Fastify (server) dan React (client). Namun, ditemukan beberapa **Major Issue** pada sinkronisasi database (SQLite vs Postgres migrations) dan praktik keamanan (JWT storage & missing RLS) yang perlu segera diperbaiki untuk skala produksi.

## Findings Table

| File | Isu | Tingkat Keparahan | Saran Perbaikan |
| :--- | :--- | :---: | :--- |
| `packages/server/drizzle/` | **Dialect Mismatch**: Migrasi menggunakan syntax SQLite (`AUTOINCREMENT`), sedangkan schema & config menggunakan Postgres. | **CRITICAL** | Hapus folder `drizzle/` dan generate ulang migrasi menggunakan `drizzle-kit generate` dengan dialek Postgres untuk sinkronisasi dengan Supabase. |
| `packages/server/src/db/schema.ts` | **Missing RLS**: Tidak ada definisi policy Row Level Security (RLS) di level schema/migrasi. | **HIGH** | Tambahkan SQL statements di migrasi untuk `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` dan definisikan policy (misal: read-only untuk anonymous, full-access untuk authenticated). |
| `packages/client/src/features/auth/hooks.ts` | **Insecure JWT Storage**: Token disimpan di `localStorage`, rentan terhadap XSS. | **HIGH** | Migrasi ke `httpOnly` cookies untuk penyimpanan token JWT agar tidak bisa diakses via JavaScript. |
| `packages/server/src/modules/kajian/kajian.service.ts` | **Code Smell & Logic Typo**: `row.speaker || row.speaker` (redundant) dan penggunaan `any` yang massif. | **MEDIUM** | Perbaiki logika seleksi speaker dan gunakan Type Inference dari Drizzle (`InferSelectModel`) daripada `any`. |
| `packages/server/src/modules/kajian/kajian.controller.ts` | **Blocking I/O**: Penggunaan `fs.unlinkSync` di dalam `async` routes dapat memblock event loop. | **MEDIUM** | Ganti `fs.unlinkSync` dengan `fs.promises.unlink` atau `await util.promisify(fs.unlink)`. |
| `packages/server/src/modules/kajian/kajian.repository.ts` | **Performance**: Query `findAll` tidak memiliki limit/offset (pagination). | **MEDIUM** | Tambahkan parameter `limit` dan `offset` pada method repository untuk mencegah degradasi performa saat data membesar. |
| `packages/server/src/modules/auth/auth.routes.ts` | **Performance**: Hashing `JWT_HASH_KEY` dilakukan di dalam request `/login`. | **LOW** | Pindahkan hashing `DUMMY_HASH` ke luar route handler (startup time) agar tidak membebani setiap request login. |
| `packages/client/src/components/ui/Select.tsx` | **Performance**: Re-render berat karena kurangnya `React.memo` pada komponen kompleks. | **LOW** | Bungkus komponen `Select` dengan `React.memo` dan pastikan `options` di-memo jika berasal dari state parent. |

## Rekomendasi Prioritas
1. **Sinkronisasi Migrasi**: Ini adalah prioritas utama karena perbedaan dialek akan menyebabkan error saat deployment ke Postgres/Supabase.
2. **Implementasi RLS**: Sangat penting jika database dapat diakses publik via API/Supabase Studio.
3. **Refactor I/O**: Pastikan semua operasi file bersifat asynchronous untuk menjaga throughput server tetap tinggi.

---
*Laporan ini disusun berdasarkan audit statis terhadap codebase saat ini.*
