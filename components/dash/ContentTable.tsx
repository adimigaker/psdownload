"use client";

import { useState, useCallback } from "react";
import { ContentItem, DownloadLink } from "@/lib/supabase/types";
import { parseGenres, formatRating, getUpdatedAtFromYear, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge, Tag } from "@/components/ui/Badge";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface ContentTableProps {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onView: (item: ContentItem) => void;
  loading?: boolean;
}

export function ContentTable({ items, onEdit, onDelete, onView, loading }: ContentTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "year", direction: "desc" });
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">("all");
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: ContentItem | null }>({ open: false, item: null });
  const { addToast } = useToast();
  
  const perPage = 20;
  
  const allGenres = Array.from(
    new Set(items.flatMap((item) => parseGenres(item.genre)))
  ).sort();
  
  const filteredItems = items
    .filter((item) => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesGenre = filterGenre === "all" || parseGenres(item.genre).includes(filterGenre);
      return matchesSearch && matchesType && matchesGenre;
    })
    .sort((a, b) => {
      let aVal = a[sortConfig.key as keyof ContentItem];
      let bVal = b[sortConfig.key as keyof ContentItem];
      
      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  
  const totalPages = Math.ceil(filteredItems.length / perPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };
  
  const handleDeleteClick = (item: ContentItem) => {
    setDeleteDialog({ open: true, item });
  };
  
  const confirmDelete = () => {
    if (deleteDialog.item) {
      onDelete(deleteDialog.item.id);
      addToast(`${deleteDialog.item.title} dihapus`, "success");
      setDeleteDialog({ open: false, item: null });
    }
  };
  
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Cover</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Judul & Info</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-dark-border/50 animate-pulse">
                <td className="px-4 py-4 text-text-muted">{i + 1}</td>
                <td className="px-4 py-4">
                  <div className="w-12 h-18 bg-dark-surface rounded" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-dark-surface rounded w-3/4 mb-2" />
                  <div className="h-3 bg-dark-surface rounded w-1/2" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-8 bg-dark-surface rounded w-20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-dark-card border border-dark-border rounded-xl">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Cari judul atau ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as "all" | "movie" | "series");
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "Semua Tipe" },
              { value: "movie", label: "Film" },
              { value: "series", label: "Series" },
            ]}
            className="w-[140px]"
          />
          <Select
            value={filterGenre}
            onChange={(e) => {
              setFilterGenre(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "Semua Genre" },
              ...allGenres.map((g) => ({ value: g, label: g })),
            ]}
            className="w-[160px]"
          />
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto bg-dark-card border border-dark-border rounded-xl">
        <table className="w-full" role="grid">
          <thead>
            <tr className="border-b border-dark-border bg-dark-surface/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-12">No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-16">Cover</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider" onClick={() => handleSort("title")} style={{ cursor: "pointer" }}>
                Judul & Info
                <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h13M3 12h13M3 16h13" />
                </svg>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-48">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-text-muted">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => {
                const genres = parseGenres(item.genre);
                const displayIndex = (currentPage - 1) * perPage + index + 1;
                const isFeatured = item.featured;
                const isPopular = item.popular;
                
                return (
                  <tr key={item.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors">
                    <td className="px-4 py-3 text-text-muted text-sm">{displayIndex}</td>
                    <td className="px-4 py-3">
                      <div className="relative w-12 h-18 rounded overflow-hidden">
                        {item.poster ? (
                          <img
                            src={item.poster}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-dark-surface flex items-center justify-center">
                            <svg className="w-6 h-6 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="2" y="2" width="20" height="20" rx="2" />
                              <path d="M2 12h20" />
                              <path d="M12 2v20" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-1 right-1 flex gap-1">
                          {isFeatured && (
                            <Badge variant="warning" size="sm">★</Badge>
                          )}
                          {isPopular && (
                            <Badge variant="primary" size="sm">🔥</Badge>
                          )}
                        </div>
                        <Badge 
                          variant={item.type === "series" ? "primary" : "outline"} 
                          size="sm"
                          className="absolute bottom-1 left-1"
                        >
                          {item.type === "series" ? "S" : "M"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white mb-1 line-clamp-1">{item.title}</div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                        <span>{item.year || "—"}</span>
                        {item.rating && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-gold" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            {formatRating(item.rating)}
                          </span>
                        )}
                        {genres.length > 0 && (
                          <span className="flex flex-wrap gap-1">
                            {genres.slice(0, 3).map((g, i) => (
                              <Tag key={i} size="sm">{g}</Tag>
                            ))}
                            {genres.length > 3 && <Tag size="sm">+{genres.length - 3}</Tag>}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-muted font-mono mt-1">{item.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(item)}
                          className="text-text-secondary hover:text-white"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(item)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Sebelumnya
          </Button>
          <span className="text-text-secondary text-sm">
            Halaman {currentPage} dari {totalPages} ({filteredItems.length} total)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Selanjutnya
          </Button>
        </div>
      )}
      
      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={confirmDelete}
        title="Hapus Konten"
        message={deleteDialog.item ? `Yakin ingin menghapus "${deleteDialog.item.title}"? Tindakan ini tidak bisa dibatalkan.` : ""}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}