import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://piratestudio.vercel.app";
  
  const robots = `# Robots.txt for PSDownload
User-agent: *
Allow: /

# Disallow dashboard
Disallow: /dash/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;
  
  return new NextResponse(robots, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}