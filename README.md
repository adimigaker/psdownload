# PSDownload - Movie/Series Download Site

A Next.js 15 + Supabase + Tailwind CSS project for managing and displaying movie/series download links with a protected admin dashboard.

## Features

- **Public Site**: SEO-optimized movie/series listing with search, genre filtering
- **Detail Pages**: Semantic HTML, JSON-LD structured data, download links grouped by season/episode
- **Dashboard** (`/dash`): Basic Auth protected (username: `insanmajnun`, password: `baramajnun`)
- **Auto-fill from TMDB**: Search by TMDB ID, IMDb ID, or title
- **Download Links Management**: Multiple servers per content with labels (PixelDrain, GDrive, etc.)
- **SEO Ready**: Dynamic metadata, sitemap.xml, robots.txt, OpenGraph, Twitter Cards, JSON-LD

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v3
- **Language**: TypeScript
- **API**: TMDB v4 (Bearer token)

## Project Structure

```
psdownload/
├── app/
│   ├── (public)/           # Public routes
│   │   ├── page.tsx        # Home
│   │   ├── [slug]/page.tsx # Detail page
│   │   └── search/page.tsx # Search
│   ├── dash/               # Dashboard (protected)
│   │   ├── page.tsx        # List + CRUD
│   │   ├── add/page.tsx    # Add new
│   │   ├── edit/[id]/page.tsx # Edit
│   │   └── api/films/      # CRUD API
│   ├── api/
│   │   ├── tmdb/route.ts   # TMDB proxy
│   │   └── films/route.ts  # Public films API
│   ├── sitemap.xml/route.ts
│   └── robots.txt/route.ts
├── components/
│   ├── public/             # Public UI components
│   ├── dash/               # Dashboard components
│   ├── ui/                 # Shared UI components
│   └── schema/             # JSON-LD components
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── tmdb.ts             # TMDB API wrapper
│   ├── auth.ts             # Basic auth helper
│   ├── seo.ts              # Metadata helpers
│   └── utils.ts            # Utility functions
├── middleware.ts           # Dashboard auth protection
├── supabase_schema.sql     # Database schema
└── .env.example            # Environment template
```

## Setup

### 1. Clone & Install

```bash
cd psdownload
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for dashboard)
- `TMDB_API_KEY` - TMDB v4 Read Access Token
- `DASH_USER` - Dashboard username (default: `insanmajnun`)
- `DASH_PASS` - Dashboard password (default: `baramajnun`)
- `NEXT_PUBLIC_SITE_URL` - Your site URL (e.g., `https://piratestudio.vercel.app`)

### 3. Database Setup

Run `supabase_schema.sql` in your Supabase SQL Editor to create the `psdownload` table with indexes, RLS policies, and triggers.

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/dash` for the dashboard.

## Dashboard Usage

1. Access `/dash` - Enter credentials: `insanmajnun` / `baramajnun`
2. Click "Tambah Baru" to add content
3. **Auto-fill**: Enter TMDB ID, IMDb ID (tt...), or title in the search field
4. Select result → metadata auto-fills
5. Add download links with labels (PixelDrain, GDrive, etc.)
6. For series: specify season/episode per link
7. Click "Rilis" to publish

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The middleware protects `/dash/*` routes automatically.

## Database Schema Notes

- `id`: TMDB numeric ID as TEXT (movie: `"557"`, series: `"37854-s1"`)
- `slug`: Auto-generated from title + year, unique
- `download_links`: JSONB array of `{label, url, season?, episode?}`
- `updated_at`: Convention: `<year>-06-15T12:00:00+07:00` (release date, not edit date)
- `featured`/`popular`: Default `false`

## API Endpoints

### Public
- `GET /api/films` - List films (with pagination, filters)
- `GET /api/tmdb?tmdb=557&media=movie` - TMDB proxy
- `GET /sitemap.xml` - Dynamic sitemap
- `GET /robots.txt` - Robots.txt

### Dashboard (Basic Auth required)
- `GET /dash/api/films` - List with stats
- `GET /dash/api/films?id=xxx` - Single film
- `POST /dash/api/films` - Create
- `PUT /dash/api/films/[id]` - Update
- `DELETE /dash/api/films/[id]` - Delete

## License

MIT