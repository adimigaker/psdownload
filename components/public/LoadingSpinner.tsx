"use client";

export function LoadingSpinner({ size = "md", text = "Memuat..." }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };
  
  return (
    <div className="flex flex-col items-center gap-3 py-12" role="status" aria-live="polite">
      <svg
        className={sizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="url(#gradient)"
          className="animate-spin"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e50914" />
            <stop offset="100%" stopColor="#f40612" />
          </linearGradient>
        </defs>
      </svg>
      <p className="text-text-muted text-sm">{text}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-dark-surface" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-dark-surface rounded w-3/4" />
        <div className="h-3 bg-dark-surface rounded w-1/2" />
        <div className="h-3 bg-dark-surface rounded w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 10, columns = 5 }: { count?: number; columns?: 4 | 5 | 6 }) {
  const gridColumns = {
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
  };
  
  return (
    <div className={gridColumns[columns]} role="list" aria-label="Loading films">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}