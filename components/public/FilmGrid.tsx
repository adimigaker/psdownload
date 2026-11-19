"use client";

import { FilmCard } from "./FilmCard";
import { ContentItem } from "@/lib/supabase/types";

interface FilmGridProps {
  films: ContentItem[];
  className?: string;
  columns?: 4 | 5 | 6;
}

export function FilmGrid({ films, className, columns = 5 }: FilmGridProps) {
  if (films.length === 0) return null;
  
  const gridColumns = {
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
  };
  
  return (
    <div className={gridColumns[columns]} role="list" aria-label="Film grid">
      {films.map((film, index) => (
        <FilmCard key={film.id} film={film} priority={index < 4} />
      ))}
    </div>
  );
}