"use client";

import Link from "next/link";
import Image from "next/image";
import { ContentItem } from "@/lib/supabase/types";
import { parseGenres, formatRating, cn } from "@/lib/utils";

interface FilmCardProps {
  film: ContentItem;
  priority?: boolean;
}

export function FilmCard({ film, priority = false }: FilmCardProps) {
  const genres = parseGenres(film.genre);
  const genreBadge = genres[0];
  const typeLabel = film.type === "series" ? "SERIES" : "MOVIE";
  
  return (
    <Link
      href={`/${film.slug}`}
      className={cn(
        "relative group block bg-dark-card border border-dark-border rounded-xl overflow-hidden",
        "transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      )}
      tabIndex={0}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {film.poster ? (
          <Image
            src={film.poster}
            alt={film.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="w-full h-full bg-dark-surface flex items-center justify-center">
            <svg className="w-12 h-12 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <path d="M2 12h20" />
              <path d="M12 2v20" />
            </svg>
          </div>
        )}
        
        {/* Genre Badge - top left */}
        {genreBadge && (
          <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium bg-primary/90 text-white rounded-full backdrop-blur">
            {genreBadge}
          </span>
        )}
        
        {/* Type Badge - top right */}
        <span className="absolute top-2 right-2 px-2 py-1 text-xs font-heading text-white bg-black/70 backdrop-blur rounded">
          {typeLabel}
        </span>
        
        {/* Rating Badge - bottom right */}
        {film.rating && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-black/70 backdrop-blur rounded">
            <svg className="w-3 h-3 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {formatRating(film.rating)}
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Hover Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-heading text-white mb-1 line-clamp-1">{film.title}</h3>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span>{film.year || "—"}</span>
            {film.rating && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gold" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {formatRating(film.rating)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}