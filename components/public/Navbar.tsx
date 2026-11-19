"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/?type=movie", label: "Film" },
  { href: "/?type=series", label: "Series" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-dark-bg/95 backdrop-blur-md border-b border-dark-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2" aria-label="PSDownload Home">
              <span className="text-2xl font-heading text-primary">PS</span>
              <span className="text-xl font-heading text-white">Download</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium text-text-secondary",
                    "hover:text-white hover:bg-dark-surface transition-colors"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/dash"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}