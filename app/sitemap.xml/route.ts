import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://piratestudio.vercel.app";
  
  let films: Array<{ slug: string; updated_at: string | null; genre: string | null }> = [];
  let genres = new Set<string>();
  
  try {
    const filmRes = await supabaseAdmin
      .from("psdownload")
      .select("slug, updated_at, genre");
    
    if (filmRes.data) {
      films = filmRes.data as Array<{ slug: string; updated_at: string | null; genre: string | null }>;
      
      films.forEach((film) => {
        if (film.genre) {
          film.genre.split(",").forEach((g) => {
            const trimmed = g.trim();
            if (trimmed) genres.add(trimmed);
          });
        }
      });
    }
  } catch (error) {
    console.error("Error fetching data for sitemap:", error);
  }
  
  const now = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
  
  for (const film of films) {
    xml += `
  <url>
    <loc>${baseUrl}/${film.slug}</loc>
    <lastmod>${film.updated_at ? new Date(film.updated_at).toISOString() : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }
  
  for (const genre of genres) {
    xml += `
  <url>
    <loc>${baseUrl}/?genre=${encodeURIComponent(genre)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }
  
  xml += `
</urlset>`;
  
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}