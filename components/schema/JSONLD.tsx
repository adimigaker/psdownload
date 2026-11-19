"use client";

interface JSONLDProps {
  data: Record<string, unknown>;
}

export function JSONLD({ data }: JSONLDProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function generateMovieSchema(data: {
  title: string;
  description: string;
  year?: number;
  genre?: string[];
  image?: string;
  rating?: number;
  duration?: string;
  director?: string;
  studio?: string;
  cast?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: data.title,
    description: data.description,
    datePublished: data.year ? `${data.year}` : undefined,
    genre: data.genre,
    image: data.image,
    aggregateRating: data.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: data.rating,
          bestRating: "10",
          worstRating: "1",
          ratingCount: 1,
        }
      : undefined,
    duration: data.duration,
    director: data.director
      ? { "@type": "Person", name: data.director }
      : undefined,
    productionCompany: data.studio
      ? { "@type": "Organization", name: data.studio }
      : undefined,
    actor: data.cast?.map((name) => ({
      "@type": "Person",
      name: name.trim(),
    })),
  };
}

export function generateTVSeriesSchema(data: {
  title: string;
  description: string;
  year?: number;
  genre?: string[];
  image?: string;
  rating?: number;
  duration?: string;
  director?: string;
  studio?: string;
  cast?: string[];
  numberOfSeasons?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: data.title,
    description: data.description,
    datePublished: data.year ? `${data.year}` : undefined,
    genre: data.genre,
    image: data.image,
    aggregateRating: data.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: data.rating,
          bestRating: "10",
          worstRating: "1",
          ratingCount: 1,
        }
      : undefined,
    duration: data.duration,
    director: data.director
      ? { "@type": "Person", name: data.director }
      : undefined,
    productionCompany: data.studio
      ? { "@type": "Organization", name: data.studio }
      : undefined,
    actor: data.cast?.map((name) => ({
      "@type": "Person",
      name: name.trim(),
    })),
    numberOfSeasons: data.numberOfSeasons,
  };
}

export function generateWebSiteSchema(url: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    alternateName: "PSDownload",
    url,
    description,
    inLanguage: "id",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}