export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateSlug(title: string, year?: number): string {
  const base = slugify(title);
  return year ? `${base}-${year}` : base;
}

export function parseGenres(genreString: string | null): string[] {
  if (!genreString) return [];
  return genreString
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

export function formatDuration(media: "movie" | "series", data: { runtime?: number; episode_run_time?: number[]; number_of_seasons?: number }): string | null {
  if (media === "series") {
    const parts: string[] = [];
    if (data.episode_run_time?.[0]) parts.push(`${data.episode_run_time[0]} min/ep`);
    if (data.number_of_seasons) parts.push(`${data.number_of_seasons} season${data.number_of_seasons > 1 ? "s" : ""}`);
    return parts.join(" / ") || null;
  }
  return data.runtime ? `${data.runtime} min` : null;
}

export function getUpdatedAtFromYear(year: number | null): string | null {
  if (!year) return null;
  return `${year}-06-15T12:00:00+07:00`;
}

export function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return "—";
  return Math.round(rating * 10) / 10 + "";
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}