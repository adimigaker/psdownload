import { Metadata } from "next";
import Link from "next/link";
import { ToastProviderWrapper } from "@/components/dash/ToastProviderWrapper";

export const metadata: Metadata = {
  title: "Dashboard - PSDownload",
  description: "Dashboard administrasi PSDownload",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashLayout({
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
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-dark-bg">
        <ToastProviderWrapper>
          <header className="fixed top-0 left-0 right-0 z-40 bg-dark-bg/95 backdrop-blur-md border-b border-dark-border">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Dashboard navigation">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/dash" className="flex items-center gap-2" aria-label="PSDownload Dashboard">
                    <span className="text-2xl font-heading text-primary">PS</span>
                    <span className="text-xl font-heading text-white">Download</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded">Dashboard</span>
                  </Link>
                </div>
                
                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="px-4 py-2 text-sm font-medium text-text-secondary bg-dark-surface border border-dark-border rounded-lg hover:text-white hover:border-primary/50 transition-colors"
                  >
                    ← Lihat Situs
                  </Link>
                </div>
              </div>
            </nav>
          </header>
          
          <main id="main-content" className="pt-20 min-h-screen pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </ToastProviderWrapper>
      </body>
    </html>
  );
}