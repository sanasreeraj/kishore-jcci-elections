# Kishore JCCI Elections Website

Campaign website for Ch Kishore Kumar, built with Next.js for JCCI Election 2026-27.

This project combines a single-page campaign experience with operational APIs for:

- member eligibility lookup
- support taps
- visitor count
- election arrival slot planning

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- CSS Modules
- Supabase (PostgreSQL)
- Optional Vercel KV fallback (for non-Supabase environments)

## Features

- Multilingual UI (English, Hindi, Odia, Telugu)
- Member search and eligibility check
- Support signal counter
- Visitor counter
- Arrival slot planner (15-minute slots, 9:00 AM to 3:00 PM)
- Member data CRUD API
- Responsive layout for mobile and desktop

## Project Structure

```text
website/
	public/
		assets/
	scripts/
		setup-supabase.mjs
	supabase/
		schema.sql
	src/
		app/
			api/
				members/
				slots/
				support/
				visitors/
			globals.css
			layout.tsx
			page.module.css
			page.tsx
		components/
			campaign-site.tsx
		lib/
			search.ts
			site-data.ts
			supabase-server.ts
	package.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the `website` root with:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is required for server-side API routes.
- `NEXT_PUBLIC_SUPABASE_URL` is optional if `SUPABASE_URL` is already set, but keeping both is clearer.

### 3. Apply database schema

Run `supabase/schema.sql` in the Supabase SQL Editor.

This creates:

- `member_records`
- `support_counter`
- `slot_counts`
- helper SQL functions used by APIs

### 4. Verify database setup

```bash
npm run db:setup
```

### 5. Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

```bash
npm run dev       # start local dev server
npm run build     # production build
npm run start     # run production server
npm run lint      # lint project
npm run db:setup  # verify Supabase schema/tables
```

## API Overview

- `GET /api/members` -> list member records
- `POST /api/members` -> create member record
- `PATCH /api/members` -> update member record
- `DELETE /api/members` -> delete member record
- `GET /api/support` -> support count
- `POST /api/support` -> increment support count
- `GET /api/visitors` -> visitor count
- `POST /api/visitors` -> increment visitor count
- `GET /api/slots` -> slot counts
- `POST /api/slots` -> apply slot selection delta

## Deployment Notes

- Set environment variables in your hosting platform (for example, Vercel Project Settings).
- Do not commit `.env` or `.env.local`.
- After deployment, test all API routes once to confirm Supabase connectivity.

## Maintenance Tips

- If counters stop moving, verify Supabase credentials first.
- If schema-dependent APIs fail, re-run `supabase/schema.sql` and then `npm run db:setup`.
- Keep `supabase/schema.sql` as the source of truth for tables, seeds, and helper functions.
