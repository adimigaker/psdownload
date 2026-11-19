import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ContentItem } from "@/lib/supabase/types";
import { FilmGrid } from "@/components/public/FilmGrid";
import { EmptyState } from "@/components/public/EmptyState";
import { generatePageMetadata } from "@/lib/seo";
import { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchFilms(query: string): Promise<ContentItem[]> {
  if (!query.trim()) return [];
  
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const { data, error } = await supabaseAdmin
    .from("psdownload")
    .select("*")
    .or(`title.ilike.${searchTerm},genre.ilike.${searchTerm}`)
    .limit(50);
  
  if (error) {
    console.error("Search error:", error);
    return [];
  }
  
  return (data || []).map((item) => ({
    ...item,
    download_links: typeof item.download_links === "string" 
      ? JSON.parse(item.download_links) 
      : item.download_links || [],
  })) as ContentItem[];
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q || "";
  
  if (!query) {
    notFound();
  }
  
  return generatePageMetadata(
    `Hasil Pencarian: "${query}" - PSDownload`,
    `Hasil pencarian untuk "${query}". Temukan film dan series favorit Anda.`
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || "";
  
  if (!query) {
    notFound();
  }
  
  const results = await searchFilms(query);
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="font-heading text-3xl text-white mb-2">
          Hasil Pencarian: <span className="text-primary">"{query}"</span>
        </h1>
        <p className="text-text-secondary">Menemukan {results.length} konten</p>
      </header>
      
      {results.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          }
          title={`Tidak ada hasil untuk "${query}"`}
          description="Coba kata kunci lain atau periksa ejaan."
          action={{
            label: "Kembali ke Beranda",
            onClick: () => window.location.href = "/",
            variant: "primary",
          }}
        />
      ) : (
        <FilmGrid films={results} columns={5} />
      )}
    </div>
  );
}