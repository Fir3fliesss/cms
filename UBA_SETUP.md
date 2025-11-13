# User Behavior Analytics (UBA) - Setup Guide

Panduan setup untuk fitur User Behavior Analytics pada blog SynchronizeTeams.

## 📋 Prerequisites

- Akun Supabase (gratis di [supabase.com](https://supabase.com))
- Node.js dan npm terinstal
- Project sudah ter-clone dan dependencies ter-install

## 🚀 Setup Steps

### 1. Setup Supabase Database

#### A. Buat Project Supabase (jika belum)

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik "New Project"
3. Isi detail project:
   - Name: `github-cms-uba`
   - Database Password: (simpan password ini)
   - Region: Pilih yang terdekat
4. Tunggu hingga project selesai dibuat (~2 menit)

#### B. Buat Table `events`

1. Di Supabase Dashboard, buka **SQL Editor**
2. Klik **New Query**
3. Copy-paste SQL berikut dan klik **RUN**:

```sql
-- ==========================================================
-- TABLE: events (UBA Simple Version)
-- ==========================================================

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),

    -- event type: page_view, scroll, read_time, click
    event_name text not null,

    -- page URL or article slug
    page text not null,

    -- anonymous user id (localStorage)
    user_id text not null,

    -- scroll depth (0–100) - optional
    scroll_percent int,

    -- reading duration (in seconds) - optional
    duration int,

    -- clicked target - optional
    target text,

    -- auto timestamp
    created_at timestamp with time zone default now()
);

-- ==========================================================
-- INDEXES for Performance
-- ==========================================================

create index if not exists idx_events_event_name
    on public.events (event_name);

create index if not exists idx_events_page
    on public.events (page);

create index if not exists idx_events_user_id
    on public.events (user_id);

create index if not exists idx_events_created_at
    on public.events (created_at);
```

#### C. Setup Row Level Security (RLS)

1. Masih di **SQL Editor**, jalankan query berikut untuk mengaktifkan RLS dan membuat policy:

```sql
-- Enable RLS
alter table public.events enable row level security;

-- Policy: Allow anonymous insert
create policy "Allow anonymous insert on events"
    on public.events
    for insert
    to anon
    with check (true);

-- Policy: Allow authenticated read (untuk dashboard)
create policy "Allow authenticated read on events"
    on public.events
    for select
    to authenticated, anon
    using (true);
```

#### D. Verifikasi Table

1. Buka tab **Table Editor**
2. Pastikan table `events` muncul dengan kolom:
   - id
   - event_name
   - page
   - user_id
   - scroll_percent
   - duration
   - target
   - created_at

### 2. Setup Environment Variables

Environment variables sudah ada di file `.env`, pastikan nilai-nilainya sudah benar:

```env
# Private (server-side only)
SUPABASE_PROJECT_URL=https://sqvwtqbnabqjpjxvxbfg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Public (client-side accessible)
PUBLIC_SUPABASE_URL=https://sqvwtqbnabqjpjxvxbfg.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cara mendapatkan API Keys:**

1. Di Supabase Dashboard, klik **Settings** (icon gear)
2. Pilih **API**
3. Copy nilai:
   - **Project URL** → `SUPABASE_PROJECT_URL` dan `PUBLIC_SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY` dan `PUBLIC_SUPABASE_ANON_KEY`

### 3. Test UBA

#### A. Jalankan Development Server

```bash
npm run dev
```

#### B. Buka Browser

1. Akses `http://localhost:5173`
2. Klik artikel untuk membaca
3. Scroll halaman artikel
4. Klik tombol Share atau Back

#### C. Verifikasi Data di Supabase

1. Buka Supabase Dashboard
2. Pilih **Table Editor** → `events`
3. Pastikan ada data baru yang masuk dengan event_name:
   - `page_view`
   - `scroll`
   - `read_time`
   - `click`

### 4. Akses Dashboard Analytics

1. Buka browser ke `http://localhost:5173/analytics`
2. Dashboard akan menampilkan:
   - Total events
   - Page views
   - Unique users
   - Average scroll depth
   - Average reading time
   - Top pages
   - Top clicks
   - Recent events table

## 📊 Fitur UBA yang Sudah Diimplementasikan

### ✅ Page View Tracking

- Otomatis track setiap halaman yang dikunjungi
- Implementasi: `src/hooks.client.ts`

### ✅ Scroll Depth Tracking

- Track seberapa jauh user scroll halaman artikel
- Update setiap 10% perubahan scroll
- Debounced 200ms untuk performa
- Implementasi: `src/lib/uba.ts` + `src/routes/article/[slug]/+page.svelte`

### ✅ Reading Duration Tracking

- Track berapa lama user membaca artikel
- Kirim data saat user meninggalkan halaman
- Implementasi: `src/lib/uba.ts` + `src/routes/article/[slug]/+page.svelte`

### ✅ Click Tracking

- Track klik pada button penting:
  - Share button
  - Back to articles (top & bottom)
- Implementasi: `src/routes/article/[slug]/+page.svelte`

### ✅ Analytics Dashboard

- Dashboard sederhana dengan statistik:
  - Total events, page views, unique users
  - Average scroll depth & reading time
  - Top pages & top clicks
  - Recent events table
- Route: `/analytics`

## 🏗️ Struktur File UBA

```
src/
├── lib/
│   ├── supabase.ts                    # Supabase client
│   └── uba.ts                         # UBA tracking module
├── routes/
│   ├── analytics/
│   │   ├── +page.svelte              # Dashboard UI
│   │   └── +page.server.ts           # Analytics data loader
│   ├── api/
│   │   └── uba/
│   │       └── +server.ts            # Event ingestion API
│   ├── article/[slug]/
│   │   └── +page.svelte              # Article page (with tracking)
│   └── hooks.client.ts               # Page view tracking
└── .env                               # Environment variables
```

## 🔒 Privacy & Security

UBA implementation ini sudah mengikuti best practices:

- ✅ **Anonymous tracking**: Menggunakan UUID yang disimpan di localStorage
- ✅ **No personal data**: Tidak menyimpan IP address, email, atau data personal
- ✅ **No cookies**: Tracking menggunakan localStorage saja
- ✅ **Non-intrusive**: Tracking tidak mengganggu user experience
- ✅ **Opt-out ready**: User bisa clear localStorage untuk reset ID

## 🐛 Troubleshooting

### Events tidak tercatat

1. **Cek console browser** untuk error
2. **Verifikasi Supabase RLS Policy**:
   ```sql
   -- Check policies
   SELECT * FROM pg_policies WHERE tablename = 'events';
   ```
3. **Cek environment variables** di `.env`
4. **Restart dev server** setelah mengubah `.env`

### Dashboard tidak menampilkan data

1. **Cek apakah ada data di table events**
2. **Verifikasi API keys** di `.env` (private & public)
3. **Cek network tab** di browser DevTools untuk error API

### Tracking tidak berjalan

1. **Cek hooks.client.ts** sudah ter-load
2. **Verifikasi import UBA module** di halaman artikel
3. **Test dengan console.log** di fungsi tracking

## 📈 Next Steps (Optional)

Untuk development lebih lanjut, Anda bisa menambahkan:

1. **Chart visualization** dengan Chart.js atau Recharts
2. **Date range filter** di dashboard
3. **Export data** ke CSV/Excel
4. **Real-time updates** dengan Supabase Realtime
5. **Cohort analysis** untuk user retention
6. **Funnel analysis** untuk conversion tracking
7. **A/B testing** capabilities

## 📝 Notes

- **Performa**: Tracking events menggunakan `keepalive: true` agar tidak block user interaction
- **Debouncing**: Scroll tracking di-debounce 200ms untuk mengurangi jumlah request
- **Error handling**: Semua tracking error di-silent agar tidak mengganggu UX
- **Production ready**: Code sudah siap untuk production deployment

## 🎉 Done!

UBA sudah siap digunakan. Monitoring user behavior sekarang jadi mudah!

Untuk pertanyaan atau issue, silakan buat issue di repository atau hubungi tim development.
