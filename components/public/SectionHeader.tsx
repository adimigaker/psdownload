"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  icon?: "star" | "clock" | "fire" | "film";
  count?: number;
  sortType?: "year" | "updated";
  onToggleSort?: (type: "year" | "updated") => void;
  showSort?: boolean;
}

export function SectionHeader({ 
  title, 
  icon, 
  count, 
  sortType, 
  onToggleSort, 
  showSort = false 
}: SectionHeaderProps) {
  const icons = {
    star: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    clock: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    fire: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>,
    film: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" /></svg>,
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <h2 className="flex items-center gap-2 font-heading text-2xl text-white">
        {icon && <span className="text-primary">{icons[icon]}</span>}
        {title}
      </h2>
      
      <div className="flex items-center gap-3">
        {count !== undefined && (
          <span className="text-sm text-text-muted whitespace-nowrap">
            {count} {count === 1 ? "item" : "items"}
          </span>
        )}
        
        {showSort && onToggleSort && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSort("year")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                sortType === "year"
                  ? "bg-primary text-white"
                  : "bg-dark-surface text-text-secondary border border-dark-border hover:border-primary/50 hover:text-white"
              )}
              aria-pressed={sortType === "year"}
            >
              <svg className="w-3.5 h-3.5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Tahun
            </button>
            <button
              onClick={() => onToggleSort("updated")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                sortType === "updated"
                  ? "bg-primary text-white"
                  : "bg-dark-surface text-text-secondary border border-dark-border hover:border-primary/50 hover:text-white"
              )}
              aria-pressed={sortType === "updated"}
            >
              <svg className="w-3.5 h-3.5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
}