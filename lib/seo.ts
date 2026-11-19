import { Metadata } from "next";
import { ContentItem } from "@/lib/supabase/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://piratestudio.vercel.app";
const SITE_NAME = "PSDownload";

export function generatePageMetadata(
  title: string,
  description: string,
  path: string = "/",
  image?: string
): Metadata {
  const fullUrl = `${SITE_URL}${path}`;
  const ogImage = image || `${SITE_URL}/og-default.png`;
  
  return {
    title: {
      default: `${title} | ${SITE_NAME}`,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: [
      "download film",
      "download series",
      "movie download",
      "series download",
      "sub indo",
      "subtitle indonesia",
      "gratis",
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: fullUrl,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: fullUrl,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export function generateContentMetadata(content: ContentItem): Metadata {
  const type = content.type === "series" ? "TVSeries" : "Movie";
  const path = `/${content.slug}`;
  const fullUrl = `${SITE_URL}${path}`;
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": type,
    name: content.title,
    description: content.synopsis || `Download ${content.title} subtitle Indonesia.`,
    datePublished: content.year ? `${content.year}` : undefined,
    genre: content.genre ? content.genre.split(",").map((g) => g.trim()) : undefined,
    image: content.poster || undefined,
    aggregateRating: content.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: content.rating,
          bestRating: "10",
          worstRating: "1",
          ratingCount: 1,
        }
      : undefined,
    duration: content.duration || undefined,
    director: content.director
      ? { "@type": "Person", name: content.director }
      : undefined,
    productionCompany: content.studio
      ? { "@type": "Organization", name: content.studio }
      : undefined,
    actor: content.cast
      ? content.cast.split(",").slice(0, 5).map((c) => ({
          "@type": "Person",
          name: c.trim(),
        }))
      : undefined,
  };
  
  return {
    ...generatePageMetadata(
      `${content.title} (${content.year || "—"}) - Download Sub Indo`,
      content.synopsis ? truncate(content.synopsis, 155) : `Download ${content.title} subtitle Indonesia gratis.`,
      path,
      content.backdrop ?? content.poster ?? undefined
    ),
    other: {
      "script:ld+json": JSON.stringify(schemaData),
    },
  };
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}