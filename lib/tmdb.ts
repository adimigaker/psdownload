import { TMDBResponse, TMDBDetailResponse } from "@/lib/supabase/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/";

function getHeaders() {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY not configured");
  return {
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
  };
}

async function tmdbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${TMDB_BASE}${path}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`TMDB ${res.status}: ${error.status_message || res.statusText}`);
  }
  
  return res.json();
}

function buildImageUrl(path: string | null, size: string = "w500"): string | null {
  return path ? `${IMG_BASE}${size}${path}` : null;
}

function formatDuration(media: "movie" | "tv", data: { runtime?: number; episode_run_time?: number[]; number_of_seasons?: number }): string | null {
  if (media === "tv") {
    const parts: string[] = [];
    if (data.episode_run_time?.[0]) parts.push(`${data.episode_run_time[0]} min/ep`);
    if (data.number_of_seasons) parts.push(`${data.number_of_seasons} season${data.number_of_seasons > 1 ? "s" : ""}`);
    return parts.join(" / ") || null;
  }
  return data.runtime ? `${data.runtime} min` : null;
}

function extractCredits(data: { credits?: { cast?: Array<{ name: string }>; crew?: Array<{ job: string; name: string }> } }) {
  const cast = data.credits?.cast?.slice(0, 8).map((c) => c.name).join(", ") || null;
  const director = data.credits?.crew?.find((c) => c.job === "Director")?.name || null;
  return { cast, director };
}

function extractGenres(data: { genres?: Array<{ name: string }> }): string | null {
  return data.genres?.map((g) => g.name).join(", ") || null;
}

function mapToResponse(media: "movie" | "tv", data: any): TMDBResponse {
  const date = data.release_date || data.first_air_date || "";
  const { cast, director } = extractCredits(data);
  
  return {
    tmdb_id: data.id,
    media,
    title: data.title || data.name || "",
    year: date ? parseInt(date.slice(0, 4)) : null,
    poster: buildImageUrl(data.poster_path),
    backdrop: buildImageUrl(data.backdrop_path, "original"),
    synopsis: data.overview || null,
    duration: formatDuration(media, data),
    rating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : null,
    imdb_id: data.external_ids?.imdb_id || null,
    genre: extractGenres(data),
    cast,
    director,
  };
}

export async function fetchTMDBByIMDb(imdbId: string): Promise<TMDBResponse | null> {
  const match = imdbId.match(/tt\d+/);
  if (!match) return null;
  
  const found = await tmdbFetch<{ movie_results: any[]; tv_results: any[] }>(
    `/find/${match[0]}?external_source=imdb_id&language=id-ID`
  );
  
  const movieHit = found.movie_results?.[0];
  const tvHit = found.tv_results?.[0];
  const hit = movieHit || tvHit;
  const isTv = !movieHit && !!tvHit;
  
  if (!hit) return null;
  
  const detail = await tmdbFetch<any>(
    `/${isTv ? "tv" : "movie"}/${hit.id}?language=id-ID&append_to_response=credits,external_ids`
  );
  
  let response = mapToResponse(isTv ? "tv" : "movie", detail);
  
  // Fallback to English if Indonesian synopsis is empty
  if (!response.synopsis) {
    try {
      const enDetail = await tmdbFetch<any>(
        `/${isTv ? "tv" : "movie"}/${hit.id}?language=en-US`
      );
      response.synopsis = enDetail.overview || null;
    } catch { /* ignore */ }
  }
  
  response.imdb_id = match[0];
  return response;
}

export async function fetchTMDBById(tmdbId: number | string, media: "movie" | "tv" = "movie"): Promise<TMDBResponse | null> {
  const detail = await tmdbFetch<any>(
    `/${media}/${tmdbId}?language=id-ID&append_to_response=credits,external_ids`
  );
  
  let response = mapToResponse(media, detail);
  
  if (!response.synopsis) {
    try {
      const enDetail = await tmdbFetch<any>(`/${media}/${tmdbId}?language=en-US`);
      response.synopsis = enDetail.overview || null;
    } catch { /* ignore */ }
  }
  
  return response;
}

export async function searchTMDB(query: string, media: "movie" | "tv" = "movie"): Promise<TMDBResponse[]> {
  const res = await tmdbFetch<{ results: any[] }>(
    `/search/${media}?query=${encodeURIComponent(query)}&language=id-ID&page=1`
  );
  
  return (res.results || []).slice(0, 8).map((d) => mapToResponse(media, d));
}

export async function fetchTVSeasons(tmdbId: number): Promise<TMDBDetailResponse | null> {
  const detail = await tmdbFetch<any>(
    `/tv/${tmdbId}?language=id-ID&append_to_response=credits,external_ids`
  );
  
  const response = mapToResponse("tv", detail);
  
  // Fetch season details
  const seasonDetails = await Promise.all(
    (detail.seasons || []).slice(1).map(async (s: any) => {
      if (s.season_number === 0) return null; // Skip specials for now
      const season = await tmdbFetch<any>(`/tv/${tmdbId}/season/${s.season_number}?language=id-ID`);
      return {
        season_number: s.season_number,
        episode_count: s.episode_count,
        air_date: s.air_date,
        name: s.name,
        overview: s.overview,
      };
    })
  );
  
  return {
    ...response,
    media: "tv",
    seasons: seasonDetails.filter(Boolean) as TMDBDetailResponse["seasons"],
  };
}