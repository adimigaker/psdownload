import { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata(
  "PSDownload - Download Film & Series Sub Indo Gratis",
  "Download film dan series subtitle Indonesia gratis. Koleksi film terbaru dan terlengkap dengan kualitas terbaik."
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0a0a0f" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <Navbar />
        <main id="main-content" className="pt-16 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}