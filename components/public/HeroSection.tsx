"use client";

import Link from "next/link";
import Image from "next/image";
import { ContentItem } from "@/lib/supabase/types";
import { parseGenres, cn } from "@/lib/utils";

interface HeroSectionProps {
  film: ContentItem | null;
}

export function HeroSection({ film }: HeroSectionProps) {
  if (!film) return null;
  
  const genres = parseGenres(film.genre);
  const backdrop = film.backdrop || film.poster || "";
  
  return (
    <section className="relative min-h-[500px] flex items-end" aria-labelledby="hero-title">
      <div 
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url('${backdrop}')` }}
        aria-hidden="true"
      >
        <Image
          src={backdrop}
          alt=""
          fill
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          aria-hidden="true"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent z-10" />
      
      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative px-3 py-1 text-sm font-medium text-white bg-primary/90 rounded-full">
              <span className="relative flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                Featured
              </span>
            </span>
          </div>
          
          <h1 id="hero-title" className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">
            {film.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 mb-4 text-text-secondary">
            <span className="font-medium">{film.year || "—"}</span>
            {film.rating && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {film.rating}/10
              </span>
            )}
            {genres.slice(0, 4).map((g, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-dark-surface border border-dark-border rounded">
                {g}
              </span>
            ))}
            <span className="px-2 py-0.5 text-xs bg-dark-surface/50 border border-dark-border rounded text-text-muted">
              {film.type.toUpperCase()}
            </span>
          </div>
          
          {film.synopsis && (
            <p className="text-text-secondary mb-6 line-clamp-3 max-w-2xl">
              {film.synopsis}
            </p>
          )}
          
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${film.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Lihat Detail & Download
            </Link>
            <Link
              href={`/${film.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-dark-surface border border-dark-border rounded-lg hover:bg-dark-border hover:border-primary transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Info Lengkap
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}