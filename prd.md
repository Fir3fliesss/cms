1. Overview###
Produk blog saat ini menggunakan Svelte sebagai frontend dan GitHub Discussions sebagai CMS.
Tujuan fitur ini adalah menambahkan User Behavior Analytics (UBA) yang sederhana, ringan, dan non-intrusive tanpa perlu mengubah arsitektur utama.
UBA akan menyediakan insight mengenai cara pengguna membaca, berinteraksi, dan menavigasi blog.

2. Goals & Objectives
🎯 Primary Goals
Melacak perilaku pembaca pada artikel secara anonim.
Mengumpulkan data dasar untuk optimasi UX, kualitas konten, dan strategi publikasi.
🎯 Secondary Goals
Menyediakan data untuk dashboard sederhana.
Memungkinkan analisis lanjutan (cohort, funnel, retention) pada versi berikutnya.

3. Scope of UBA v1
Fitur UBA yang akan diimplementasikan:
Page View Tracking
Scroll Depth Tracking
Reading Duration Tracking
Click / CTA Tracking
UBA bersifat pasif, tidak mengganggu UX, dan bersifat anonymous (menggunakan UUID di localStorage).

4. System Architecture
flowchart LR
    A[Svelte Frontend] --> B[UBA Module]
    B --> C[/api/uba (SvelteKit Server Route)/]
    C --> D[Supabase DB: events Table]
    D --> E[Supabase Dashboard / Custom Analytics]

Komponen yang terlibat:
Frontend (Svelte) → mendeteksi event (page view, scroll, duration, click)
UBA Module → wrapper yang mengirim data
API Route → menerima dan menyimpan ke database
Supabase Database → tabel events

6. Functional Requirements
6.1 Page View Tracking
Behavior:
Mengirim data setiap halaman dimuat.
Data yang dikirim:
event_name: "page_view"
page URL
user_id
timestamp
user_agent
Acceptance Criteria:
Page view tercatat setiap kali user membuka halaman.
Data tersimpan dengan konsisten di Supabase.

6.2 Scroll Depth Tracking
Behavior:
Mengukur percentage scroll (max).
Mengirim event ketika nilai baru > nilai sebelumnya.
Data:
event_name: "scroll"
scroll_percent (0–100)
page
Acceptance Criteria:
Scroll depth tercatat naik bertahap (10 → 30 → 60 → 100).
Tidak membanjiri server (debounce).

6.3 Reading Duration Tracking
Behavior:
Timer berjalan setiap 1 detik.
Event dikirim ketika:
user menutup tab
refresh
pindah halaman
Data:
event_name: "read_time"
duration (seconds)
page
user_id
Acceptance Criteria:
Duration selalu tercatat sebelum unload.
Tidak mengirim event 0 detik.

6.4 Click Tracking (CTA Tracking)
Behavior:
Mengirim event untuk klik tombol penting.
Data:
event_name: "click"
target (button name)
page
user_id
Acceptance Criteria:
Klik tombol share, tag, dan navigasi tercatat akurat.

7. Data Schema (Supabase)
Table: events
Column	Type	Description
id	uuid (pk)	Primary key
event_name	text	page_view / scroll / read_time / click
page	text	URL atau slug artikel
user_id	text	anonymous UUID
user_agent	text	browser/device
scroll_percent	int	(optional) 0–100
duration	int	(optional) detik
target	text	(optional) CTA target name
created_at	timestamp	default now()

#️⃣ 8. Step-by-Step Implementation Guide
Step 1 — Setup Supabase
Buat project Supabase
Buat tabel: events
Enable RLS & add policy:
allow insert on events for anon using (true);
Ambil SUPABASE_URL dan SUPABASE_ANON_KEY.
Step 2 — Tambahkan Supabase Client ke Svelte
Install:
npm install @supabase/supabase-js
Buat file:
src/lib/supabase.ts
Isi:
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
Step 3 — Buat UBA Module
File:
src/lib/uba.ts
Isi (ringkas):
generate anonymous user ID
sendEvent() → hit /api/uba
trackScrollDepth()
trackDuration()
Step 4 — Buat API Route
File:
src/routes/api/uba/+server.ts
menerima JSON event
insert ke Supabase
return success/fail
Step 5 — Page View Integration
Edit:
src/hooks.client.ts
Tambahkan:
sendEvent("page_view", { page: event.url.pathname });
Step 6 — Scroll Depth Integration
Pada halaman blog article:
<script>
    import { trackScrollDepth } from "$lib/uba";
    trackScrollDepth();
</script>
Step 7 — Reading Duration Integration
Dalam page blog:
<script>
    import { trackReadingDuration } from "$lib/uba";
    trackReadingDuration();
</script>
Step 8 — CTA Tracking
Contoh tombol:
<button on:click={() => sendEvent("click", { target: "share_button" })}>
    Share
</button>
#️⃣ 9. Analytics & Reporting (Opsional v1.1)
Dashboard sederhana:
Page views per artikel
Avg scroll depth
Avg read duration
Click heatmap table
Tools:
Svelte + Chart.js
Supabase SQL
#️⃣ 10. Performance Requirements
Event sending minimal 1–3 KB
Scroll tracking debounce min 200ms
Max 1 insert event per 10% scroll change
No blocking during user interaction
#️⃣ 11. Privacy Requirements
Tidak menyimpan data personal
Hanya menggunakan anonymous UUID
Tidak mengumpulkan IP address
Compliant dengan privacy best practices (GDPR-like)


#Supabase table sql#
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

