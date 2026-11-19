import { supabaseAdmin } from "@/lib/supabase/server";
import { ContentItem } from "@/lib/supabase/types";
import { parseGenres, getUpdatedAtFromYear } from "@/lib/utils";
import { HeroSection } from "@/components/public/HeroSection";
import { FilmGrid } from "@/components/public/FilmGrid";
import { SectionHeader } from "@/components/public/SectionHeader";
import { GenreFilter } from "@/components/public/GenreFilter";
import { LoadingSpinner, SkeletonGrid } from "@/components/public/LoadingSpinner";
import { EmptyState } from "@/components/public/EmptyState";
import { generatePageMetadata } from "@/lib/seo";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ genre?: string; type?: string; sort?: string }>;
}

async function getFilmsByGenre(
  genre: string | null,
  type: string | null,
  sort: string,
  limit = 20,
  offset = 0
): Promise<ContentItem[]> {
  let query = supabaseAdmin
    .from("psdownload")
    .select("*");
  
  if (genre) {
    query = query.ilike("genre", `%${genre}%`);
  }
  
  if (type && type !== "all") {
    query = query.eq("type", type);
  }
  
  if (sort === "year") {
    query = query.order("year", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("updated_at", { ascending: false, nullsFirst: false });
  }
  
  query = query.range(offset, offset + limit - 1);
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching films:", error);
    return [];
  }
  
  return (data || []).map((item) => ({
    ...item,
    download_links: typeof item.download_links === "string" 
      ? JSON.parse(item.download_links) 
      : item.download_links || [],
  })) as ContentItem[];
}

async function getFilmsCount(genre: string | null, type: string | null): Promise<number> {
  let query = supabaseAdmin
    .from("psdownload")
    .select("*", { count: "exact", head: true });
  
  if (genre) {
    query = query.ilike("genre", `%${genre}%`);
  }
  
  if (type && type !== "all") {
    query = query.eq("type", type);
  }
  
  const { count, error } = await query;
  
  if (error) {
    console.error("Error counting films:", error);
    return 0;
  }
  
  return count || 0;
}

async function getFeatured(): Promise<ContentItem[]> {
  const { data, error } = await supabaseAdmin
    .from("psdownload")
    .select("*")
    .eq("featured", true)
    .limit(5);
  
  if (error) {
    console.error("Error fetching featured:", error);
    return [];
  }
  
  return (data || []).map((item) => ({
    ...item,
    download_links: typeof item.download_links === "string" 
      ? JSON.parse(item.download_links) 
      : item.download_links || [],
  })) as ContentItem[];
}

async function getPopular(): Promise<ContentItem[]> {
  const { data, error } = await supabaseAdmin
    .from("psdownload")
    .select("*")
    .eq("popular", true)
    .order("updated_at", { ascending: false })
    .limit(10);
  
  if (error) {
    console.error("Error fetching popular:", error);
    return [];
  }
  
  return (data || []).map((item) => ({
    ...item,
    download_links: typeof item.download_links === "string" 
      ? JSON.parse(item.download_links) 
      : item.download_links || [],
  })) as ContentItem[];
}

async function getGenres(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("psdownload")
    .select("genre");
  
  if (error || !data) return [];
  
  const genreSet = new Set<string>();
  for (const film of data) {
    if (film.genre) {
      film.genre.split(",").forEach((g: string) => {
        const trimmed = g.trim();
        if (trimmed) genreSet.add(trimmed);
      });
    }
  }
  
  return Array.from(genreSet).sort();
}

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const params = await searchParams;
  const genre = params.genre || "";
  const type = params.type || "all";
  
  let title = "PSDownload - Download Film & Series Sub Indo Gratis";
  let description = "Download film dan series subtitle Indonesia gratis. Koleksi film terbaru dan terlengkap dengan kualitas terbaik.";
  
  if (genre) {
    title = `${genre} - ${title}`;
    description = `Download ${genre} subtitle Indonesia gratis. Koleksi ${genre} terbaru dan terlengkap.`;
  } else if (type === "movie") {
    title = "Film - " + title;
    description = "Download film subtitle Indonesia gratis. Koleksi film terbaru dan terlengkap.";
  } else if (type === "series") {
    title = "Series - " + title;
    description = "Download series subtitle Indonesia gratis. Koleksi series terbaru dan terlengkap.";
  }
  
  return generatePageMetadata(title, description);
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;
  const activeGenre = params.genre || "";
  const activeType = params.type || "all";
  const sortType = params.sort === "year" ? "year" : "updated";
  
  const [initialFilms, totalFilms, featured, popular, allGenres] = await Promise.all([
    getFilmsByGenre(activeGenre || null, activeType, sortType, 20, 0),
    getFilmsCount(activeGenre || null, activeType),
    getFeatured(),
    getPopular(),
    getGenres(),
  ]);
  
  const randomFeatured = featured.length > 0
    ? featured[Math.floor(Math.random() * featured.length)]
    : (initialFilms[0] || null);
  
  return (
    <>
      <HeroSection film={randomFeatured} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {popular.length > 0 && (
          <section className="mb-12" aria-labelledby="popular-heading">
            <SectionHeader title="Populer" icon="fire" count={popular.length} />
            <FilmGrid films={popular} columns={5} />
          </section>
        )}
        
        <GenreFilter
          genres={allGenres}
          activeGenre={activeGenre}
          onChange={(genre) => {
            const url = new URL(window.location.href);
            if (genre) {
              url.searchParams.set("genre", genre);
            } else {
              url.searchParams.delete("genre");
            }
            window.location.href = url.toString();
          }}
        />
        
        <section aria-labelledby="latest-heading">
          <SectionHeader
            title="Terbaru"
            icon="clock"
            count={totalFilms}
            sortType={sortType}
            onToggleSort={(type) => {
              const url = new URL(window.location.href);
              url.searchParams.set("sort", type);
              window.location.href = url.toString();
            }}
            showSort
          />
          <FilmGrid films={initialFilms} columns={5} />
          
          {initialFilms.length === 0 && (
            <EmptyState
              icon={
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              }
              title={activeGenre ? `Tidak ada film di genre "${activeGenre}"` : "Belum ada konten"}
              description={activeGenre 
                ? "Coba pilih genre lain atau tambahkan konten baru di dashboard."
                : "Mulai tambahkan film atau series pertama Anda."}
              action={{
                label: activeGenre ? "Lihat Semua" : "Tambah Konten",
                onClick: () => window.location.href = activeGenre ? "/?genre=" : "/dash/add",
                variant: "primary",
              }}
            />
          )}
          
          {initialFilms.length > 0 && initialFilms.length < totalFilms && (
            <div className="text-center mt-8">
              <a
                href={`/?genre=${encodeURIComponent(activeGenre)}&type=${activeType}&sort=${sortType}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
              >
                Lihat Semua ({totalFilms})
              </a>
            </div>
          )}
        </section>
      </div>
    </>
  );
}