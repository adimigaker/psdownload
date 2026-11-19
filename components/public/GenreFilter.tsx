"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GenreFilterProps {
  genres: string[];
  activeGenre: string;
  onChange: (genre: string) => void;
}

export function GenreFilter({ genres, activeGenre, onChange }: GenreFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by genre">
      <span className="text-sm font-medium text-text-secondary">
        <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <path d="M2 12h20" />
          <path d="M12 2v20" />
        </svg>
        Genre:
      </span>
      <button
        onClick={() => onChange("")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-full transition-all",
          activeGenre === ""
            ? "bg-primary text-white"
            : "bg-dark-surface text-text-secondary border border-dark-border hover:border-primary/50 hover:text-white"
        )}
        aria-pressed={activeGenre === ""}
      >
        Semua
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onChange(genre)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap",
            activeGenre === genre
              ? "bg-primary text-white"
              : "bg-dark-surface text-text-secondary border border-dark-border hover:border-primary/50 hover:text-white"
          )}
          aria-pressed={activeGenre === genre}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}