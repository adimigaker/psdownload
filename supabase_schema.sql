-- PSDownload Database Schema
-- Run this in Supabase SQL Editor for project: eogdtpkiwzlarllnxsrj

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main content table
CREATE TABLE IF NOT EXISTS public.psdownload (
    id TEXT PRIMARY KEY,                          -- TMDB ID as string (e.g., "557", "37854-s1")
    title TEXT NOT NULL,                          -- Main title
    slug TEXT UNIQUE NOT NULL,                    -- URL-friendly slug
    type TEXT NOT NULL CHECK (type IN ('movie', 'series')),
    year INTEGER,                                 -- Release year
    genre TEXT,                                   -- Comma-separated genres
    rating NUMERIC,                               -- TMDB rating (0-10)
    duration TEXT,                                -- Duration string (e.g., "120 min", "2 seasons")
    studio TEXT,                                  -- Production studio
    director TEXT,                                -- Director name
    "cast" TEXT,                                  -- Comma-separated cast (quoted: reserved keyword)
    poster TEXT,                                  -- TMDB poster URL (w500)
    backdrop TEXT,                                -- TMDB backdrop URL (original)
    synopsis TEXT,                                -- Indonesian synopsis
    trailer TEXT,                                 -- YouTube embed URL
    download_links JSONB DEFAULT '[]'::jsonb,     -- Array of {label, url, season?, episode?}
    featured BOOLEAN DEFAULT FALSE,               -- Show in hero
    popular BOOLEAN DEFAULT FALSE,                -- Show in popular section
    updated_at TIMESTAMPTZ,                       -- Release date (convention: <year>-06-15T12:00:00+07:00)
    created_at TIMESTAMPTZ DEFAULT NOW()          -- Insert timestamp
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_psdownload_type ON public.psdownload(type);
CREATE INDEX IF NOT EXISTS idx_psdownload_year ON public.psdownload(year DESC);
CREATE INDEX IF NOT EXISTS idx_psdownload_updated_at ON public.psdownload(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_psdownload_genre ON public.psdownload USING GIN (genre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_psdownload_featured ON public.psdownload(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_psdownload_popular ON public.psdownload(popular) WHERE popular = true;
CREATE INDEX IF NOT EXISTS idx_psdownload_slug ON public.psdownload(slug);

-- Enable Row Level Security
ALTER TABLE public.psdownload ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key)
CREATE POLICY "Public read access" ON public.psdownload
    FOR SELECT USING (true);

-- Authenticated write access (service role only for dashboard)
-- Dashboard uses service role key which bypasses RLS

-- Grant permissions
GRANT SELECT ON public.psdownload TO anon;
GRANT ALL ON public.psdownload TO service_role;

-- Function to auto-set updated_at from year
CREATE OR REPLACE FUNCTION public.set_updated_at_from_year()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.year IS NOT NULL AND (NEW.updated_at IS NULL OR NEW.updated_at = '') THEN
        NEW.updated_at := (NEW.year || '-06-15T12:00:00+07:00')::TIMESTAMPTZ;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for insert
DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.psdownload;
CREATE TRIGGER trigger_set_updated_at
    BEFORE INSERT ON public.psdownload
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_from_year();

-- Trigger for update (only if year changed)
CREATE OR REPLACE FUNCTION public.update_updated_at_from_year()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.year IS DISTINCT FROM OLD.year THEN
        NEW.updated_at := (NEW.year || '-06-15T12:00:00+07:00')::TIMESTAMPTZ;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_updated_at ON public.psdownload;
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON public.psdownload
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_from_year();