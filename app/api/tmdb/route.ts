import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
    next: { revalidate: 3600 },
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

function mapToResponse(media: "movie" | "tv", data: any) {
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imdb = searchParams.get("imdb");
  const tmdb = searchParams.get("tmdb");
  const media = searchParams.get("media") === "tv" ? "tv" : "movie";
  const q = searchParams.get("search");
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { headers: corsHeaders });
  }
  
  const KEY = process.env.TMDB_API_KEY;
  
  if (!KEY) {
    return NextResponse.json(
      { error: "TMDB_API_KEY belum dipasang di env." },
      { status: 501, headers: corsHeaders }
    );
  }
  
  try {
    // 1. From IMDb ID
    if (imdb) {
      const match = String(imdb).match(/tt\d+/);
      if (!match) {
        return NextResponse.json({ error: "ID IMDb tidak valid." }, { status: 400, headers: corsHeaders });
      }
      
      const found = await tmdbFetch<{ movie_results: any[]; tv_results: any[] }>(
        `/find/${match[0]}?external_source=imdb_id&language=id-ID`
      );
      
      const movieHit = found.movie_results?.[0];
      const tvHit = found.tv_results?.[0];
      const hit = movieHit || tvHit;
      const isTv = !movieHit && !!tvHit;
      
      if (!hit) {
        return NextResponse.json({ error: "Tidak ketemu di TMDB." }, { status: 404, headers: corsHeaders });
      }
      
      const detail = await tmdbFetch<any>(
        `/${isTv ? "tv" : "movie"}/${hit.id}?language=id-ID&append_to_response=credits,external_ids`
      );
      
      let response = mapToResponse(isTv ? "tv" : "movie", detail);
      response.imdb_id = match[0];
      
      // Fallback to English if Indonesian synopsis is empty
      if (!response.synopsis) {
        try {
          const enDetail = await tmdbFetch<any>(`/${isTv ? "tv" : "movie"}/${hit.id}?language=en-US`);
          response.synopsis = enDetail.overview || null;
        } catch { /* ignore */ }
      }
      
      return NextResponse.json(response, { headers: corsHeaders });
    }
    
    // 2. From TMDB ID directly
    if (tmdb) {
      const detail = await tmdbFetch<any>(
        `/${media}/${tmdb}?language=id-ID&append_to_response=credits,external_ids`
      );
      
      let response = mapToResponse(media, detail);
      
      if (!response.synopsis) {
        try {
          const enDetail = await tmdbFetch<any>(`/${media}/${tmdb}?language=en-US`);
          response.synopsis = enDetail.overview || null;
        } catch { /* ignore */ }
      }
      
      return NextResponse.json(response, { headers: corsHeaders });
    }
    
    // 3. Search by title
    if (q) {
      const res = await tmdbFetch<{ results: any[] }>(
        `/search/${media}?query=${encodeURIComponent(q)}&language=id-ID&page=1`
      );
      
      return NextResponse.json(
        (res.results || []).slice(0, 8).map((d) => mapToResponse(media, d)),
        { headers: corsHeaders }
      );
    }
    
    return NextResponse.json({ error: "Kasih imdb= / tmdb= / search=." }, { status: 400, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502, headers: corsHeaders }
    );
  }
}