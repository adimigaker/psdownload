import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ContentItem } from "@/lib/supabase/types";
import { parseGenres, formatRating, getUpdatedAtFromYear } from "@/lib/utils";
import { generateContentMetadata, generatePageMetadata } from "@/lib/seo";
import { generateBreadcrumbSchema } from "@/components/schema/JSONLD";
import { Metadata } from "next";
import { JSONLD, generateMovieSchema, generateTVSeriesSchema } from "@/components/schema/JSONLD";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getFilmBySlug(slug: string): Promise<ContentItem | null> {
  const { data, error } = await supabaseAdmin
    .from("psdownload")
    .select("*")
    .eq("slug", slug)
    .single();
  
  if (error || !data) return null;
  
  return {
    ...data,
    download_links: typeof data.download_links === "string" 
      ? JSON.parse(data.download_links) 
      : data.download_links || [],
  } as ContentItem;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  
  if (!film) {
    return generatePageMetadata(
      "Film Tidak Ditemukan - PSDownload",
      "Film yang Anda cari tidak tersedia."
    );
  }
  
  return generateContentMetadata(film);
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  
  if (!film) {
    notFound();
  }
  
  const genres = parseGenres(film.genre);
  const schemaData = film.type === "series"
    ? generateTVSeriesSchema({
        title: film.title,
        description: film.synopsis || `Download ${film.title} subtitle Indonesia.`,
        year: film.year ?? undefined,
        genre: genres,
        image: film.poster ?? undefined,
        rating: film.rating ?? undefined,
        duration: film.duration ?? undefined,
        director: film.director ?? undefined,
        studio: film.studio ?? undefined,
        cast: film.cast?.split(",").map((c) => c.trim()),
      })
    : generateMovieSchema({
        title: film.title,
        description: film.synopsis || `Download ${film.title} subtitle Indonesia.`,
        year: film.year ?? undefined,
        genre: genres,
        image: film.poster ?? undefined,
        rating: film.rating ?? undefined,
        duration: film.duration ?? undefined,
        director: film.director ?? undefined,
        studio: film.studio ?? undefined,
        cast: film.cast?.split(",").map((c) => c.trim()),
      });
  
  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Beranda", url: "https://piratestudio.vercel.app" },
    { name: film.type === "series" ? "Series" : "Film", url: `https://piratestudio.vercel.app/?type=${film.type}` },
    { name: film.title, url: `https://piratestudio.vercel.app/${film.slug}` },
  ]);
  
  // Group download links by season/episode for series
  const downloadLinks = film.download_links || [];
  const groupedDownloads = downloadLinks.reduce((acc, link) => {
    const key = link.season !== undefined 
      ? `Season ${link.season}${link.episode !== undefined ? ` Episode ${link.episode}` : ""}`
      : "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(link);
    return acc;
  }, {} as Record<string, typeof downloadLinks>);
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      
      <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-text-muted">
            <li>
              <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <Link href={`/?type=${film.type}`} className="hover:text-white transition-colors">
                {film.type === "series" ? "Series" : "Film"}
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="text-white" aria-current="page">{film.title}</span>
            </li>
          </ol>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster & Main Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Poster */}
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-card border border-dark-border">
                {film.poster ? (
                  <Image
                    src={film.poster}
                    alt={`${film.title} Poster`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-dark-surface">
                    <svg className="w-24 h-24 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="2" y="2" width="20" height="20" rx="2" />
                      <path d="M2 12h20" />
                      <path d="M12 2v20" />
                    </svg>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
                  {film.featured && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-500/90 text-white rounded-full backdrop-blur">★ Featured</span>
                  )}
                  {film.popular && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-500/90 text-white rounded-full backdrop-blur">🔥 Popular</span>
                  )}
                  <span className={`px-2 py-1 text-xs font-heading rounded-full ${
                    film.type === "series" ? "bg-primary" : "bg-purple-600"
                  }`}>
                    {film.type === "series" ? "SERIES" : "MOVIE"}
                  </span>
                </div>
                
                {/* Rating Overlay */}
                {film.rating && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-2 bg-black/80 backdrop-blur rounded-lg">
                    <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="font-heading text-lg text-white">{formatRating(film.rating)}</span>
                  </div>
                )}
              </div>
              
              {/* Trailer Button */}
              {film.trailer && (
                <a
                  href={film.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 bg-dark-card border border-dark-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <svg className="w-5 h-5 mx-auto mb-1 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <div className="text-sm font-medium text-white">Tonton Trailer</div>
                </a>
              )}
            </div>
          </div>
          
          {/* Details & Downloads */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Meta */}
            <header className="border-b border-dark-border pb-6">
              <h1 className="font-heading text-3xl sm:text-4xl text-white mb-3">{film.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-text-secondary text-sm">
                <span className="font-medium">{film.year || "—"}</span>
                {film.rating && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {formatRating(film.rating)}/10
                  </span>
                )}
                {film.duration && <span>{film.duration}</span>}
                {genres.map((g, i) => (
                  <span key={i} className="px-2 py-0.5 bg-dark-surface border border-dark-border rounded text-xs">
                    {g}
                  </span>
                ))}
              </div>
            </header>
            
            {/* Info Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-labelledby="details-heading">
              <h2 id="details-heading" className="font-heading text-xl text-white col-span-full mb-4">Detail Informasi</h2>
              
              {film.studio && (
                <div className="flex items-start gap-3 p-4 bg-dark-card border border-dark-border rounded-lg">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="2" />
                    <path d="M2 12h20" />
                    <path d="M12 2v20" />
                  </svg>
                  <div>
                    <dt className="text-text-muted text-sm">Studio</dt>
                    <dd className="text-white font-medium">{film.studio}</dd>
                  </div>
                </div>
              )}
              
              {film.director && (
                <div className="flex items-start gap-3 p-4 bg-dark-card border border-dark-border rounded-lg">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div>
                    <dt className="text-text-muted text-sm">Sutradara</dt>
                    <dd className="text-white font-medium">{film.director}</dd>
                  </div>
                </div>
              )}
              
              {film.cast && (
                <div className="flex items-start gap-3 p-4 bg-dark-card border border-dark-border rounded-lg md:col-span-2">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <div>
                    <dt className="text-text-muted text-sm">Pemeran</dt>
                    <dd className="text-white font-medium">{film.cast}</dd>
                  </div>
                </div>
              )}
            </section>
            
            {/* Synopsis */}
            {film.synopsis && (
              <section className="border-t border-dark-border pt-6" aria-labelledby="synopsis-heading">
                <h2 id="synopsis-heading" className="font-heading text-xl text-white mb-3">Sinopsis</h2>
                <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
                  <p>{film.synopsis}</p>
                </div>
              </section>
            )}
            
            {/* Download Links */}
            <section className="border-t border-dark-border pt-6" aria-labelledby="downloads-heading">
              <h2 id="downloads-heading" className="font-heading text-xl text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Link Download
              </h2>
              
              {downloadLinks.length === 0 ? (
                <div className="text-center py-8 text-text-muted border-2 border-dashed border-dark-border rounded-xl">
                  <svg className="w-12 h-12 mx-auto mb-3 text-text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p>Belum ada link download tersedia untuk konten ini.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedDownloads).map(([groupName, links]) => (
                    <div key={groupName} className="space-y-3">
                      {Object.keys(groupedDownloads).length > 1 && (
                        <h3 className="font-medium text-text-secondary text-sm uppercase tracking-wider mb-2">
                          {groupName}
                        </h3>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {links.map((link, index) => (
                          <a
                            key={`${groupName}-${index}`}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 bg-dark-card border border-dark-border rounded-lg hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
                          >
                            <svg className="w-6 h-6 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-white truncate block">{link.label}</span>
                              {link.season !== undefined && (
                                <span className="text-xs text-text-muted">
                                  {link.episode !== undefined 
                                    ? `Season ${link.season} Episode ${link.episode}`
                                    : `Season ${link.season}`}
                                </span>
                              )}
                            </div>
                            <svg className="w-5 h-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </article>
    </>
  );
}