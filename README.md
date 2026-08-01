# KharchaHisab

Personal expense tracker PWA for Indian users — track spending in ₹ with NEED / WANT / SAVING budgeting, UPI-friendly payment modes, and Indian categories.

**Live app:** https://neurivox.github.io/KharchaHisab/

**Repo:** https://github.com/Neurivox/KharchaHisab

## Stack

- React 19 + TypeScript + Vite
- shadcn/ui + Tailwind CSS 4
- Supabase (PostgreSQL) — single-user, no auth
- recharts for dashboard analytics
- PWA (installable on iPhone via Safari)

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` on your phone (same Wi‑Fi) or desktop.

**Without Supabase:** data is stored in browser `localStorage` automatically.

## Supabase setup

1. Create a free project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run the migration:
   ```
   supabase/migrations/001_initial.sql
   ```
3. (Optional) Create a **Storage** bucket named `receipts` with public access for receipt uploads
4. Copy `.env.example` to `.env.local` and fill in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart `npm run dev`

> Keep your anon key private. Do not commit `.env.local`.

## GitHub Pages deploy

1. In repo **Settings → Pages**, set source to **GitHub Actions**
2. Add repository secrets (Settings → Secrets → Actions):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push to `main` — workflow builds and deploys to `https://neurivox.github.io/KharchaHisab/`

## Install on iPhone (PWA)

1. Open https://neurivox.github.io/KharchaHisab/ in **Safari**
2. Tap **Share** → **Add to Home Screen**
3. Launch from home screen — runs standalone with safe-area support

## Features

- **Add expense:** amount, description, payment mode, category, NEED/WANT/SAVING, date, merchant, notes, tags, recurring flag, receipt photo
- **Dashboard:** monthly totals, pie chart (NEED/WANT/SAVING), category & payment mode breakdown, recent transactions
- **Expense list:** search, filter by type/category/payment/date, edit & delete
- **Settings:** dark mode, CSV export with Financial Year column (Apr–Mar)
- **INR formatting:** `₹1,23,456.78` via `en-IN` locale

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (accessible on LAN via `--host`) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Project structure

```
src/
├── components/   # UI, layout, expense, dashboard
├── hooks/        # useExpenses
├── lib/          # supabase, constants, format
├── pages/        # Dashboard, Add, Expenses, Settings
└── types/        # Expense types
supabase/migrations/001_initial.sql
```
