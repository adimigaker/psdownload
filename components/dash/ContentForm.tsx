"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ContentItem, DownloadLink, TMDBResponse } from "@/lib/supabase/types";
import { parseGenres, generateSlug, getUpdatedAtFromYear, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/Input";
import { Badge, Tag } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface ContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ContentItem>) => Promise<void>;
  initialData?: ContentItem | null;
  loading?: boolean;
}

export function ContentForm({ isOpen, onClose, onSubmit, initialData, loading }: ContentFormProps) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "media" | "downloads" | "status">("basic");
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbSearchResults, setTmdbSearchResults] = useState<TMDBResponse[]>([]);
  const [showTmdbResults, setShowTmdbResults] = useState(false);
  const tmdbSearchRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    id: "",
    title: "",
    slug: "",
    type: "movie",
    year: null,
    genre: "",
    rating: null,
    duration: "",
    studio: "",
    director: "",
    cast: "",
    poster: "",
    backdrop: "",
    synopsis: "",
    trailer: "",
    download_links: [],
    featured: false,
    popular: false,
    updated_at: null,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugManual, setSlugManual] = useState(false);
  
  // Initialize form data
  useEffect(() => {
    if (initialData) {
      const data = { ...initialData };
      // Convert download_links to proper format
      if (typeof data.download_links === "string") {
        try {
          data.download_links = JSON.parse(data.download_links);
        } catch {
          data.download_links = [];
        }
      }
      setFormData(data);
      setSlugManual(!!data.slug);
      
      // Format updated_at for datetime-local input
      if (data.updated_at) {
        const date = new Date(data.updated_at);
        const formatted = date.toISOString().slice(0, 16);
        setFormData((prev) => ({ ...prev, updated_at: formatted }));
      }
    } else {
      // Reset form for new entry
      setFormData({
        id: "",
        title: "",
        slug: "",
        type: "movie",
        year: null,
        genre: "",
        rating: null,
        duration: "",
        studio: "",
        director: "",
        cast: "",
        poster: "",
        backdrop: "",
        synopsis: "",
        trailer: "",
        download_links: [],
        featured: false,
        popular: false,
        updated_at: null,
      });
      setSlugManual(false);
    }
    setErrors({});
    setActiveTab("basic");
    setShowTmdbResults(false);
  }, [initialData, isOpen]);
  
  // Auto-generate slug from title + year
  useEffect(() => {
    if (!slugManual && formData.title) {
      const slug = generateSlug(formData.title, formData.year || undefined);
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, formData.year, slugManual]);
  
  const updateField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }, [errors]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id?.trim()) newErrors.id = "ID wajib diisi";
    if (!formData.title?.trim()) newErrors.title = "Judul wajib diisi";
    if (!formData.year) newErrors.year = "Tahun wajib diisi";
    if (!formData.genre?.trim()) newErrors.genre = "Genre wajib diisi";
    if (!formData.slug?.trim()) newErrors.slug = "Slug wajib diisi";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
      addToast("Berhasil disimpan!", "success");
      onClose();
    } catch (error) {
      addToast(`Gagal: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
    }
  };
  
  // TMDB Search
  const handleTmdbSearch = async (query: string) => {
    if (!query.trim()) {
      setTmdbSearchResults([]);
      setShowTmdbResults(false);
      return;
    }
    
    setTmdbLoading(true);
    try {
      const media = formData.type === "series" ? "tv" : "movie";
      const res = await fetch(`/api/tmdb?search=${encodeURIComponent(query)}&media=${media}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTmdbSearchResults(data);
        setShowTmdbResults(true);
      }
    } catch (error) {
      console.error("TMDB search error:", error);
    } finally {
      setTmdbLoading(false);
    }
  };
  
  const applyTmdbData = (data: TMDBResponse) => {
    updateField("title", data.title);
    updateField("year", data.year);
    updateField("rating", data.rating);
    updateField("duration", data.duration);
    updateField("genre", data.genre);
    updateField("synopsis", data.synopsis);
    updateField("director", data.director);
    updateField("cast", data.cast);
    updateField("poster", data.poster);
    updateField("backdrop", data.backdrop);
    
    if (data.imdb_id) {
      // Could store IMDb ID somewhere if needed
    }
    
    // Auto-set updated_at from year
    if (data.year) {
      updateField("updated_at", getUpdatedAtFromYear(data.year));
    }
    
    // If series, switch type
    if (data.media === "tv" && formData.type !== "series") {
      updateField("type", "series");
    }
    
    addToast("Metadata TMDB berhasil diambil!", "success");
    setShowTmdbResults(false);
    tmdbSearchRef.current?.blur();
  };
  
  const handleTmdbIdFetch = async (tmdbId: string) => {
    setTmdbLoading(true);
    try {
      const media = formData.type === "series" ? "tv" : "movie";
      const res = await fetch(`/api/tmdb?tmdb=${tmdbId}&media=${media}`);
      const data = await res.json();
      if (data && !data.error) {
        applyTmdbData(data);
      } else {
        addToast(data.error || "Gagal mengambil data TMDB", "error");
      }
    } catch (error) {
      addToast("Gagal mengambil data TMDB", "error");
    } finally {
      setTmdbLoading(false);
    }
  };
  
  // Download Links Management
  const addDownloadLink = () => {
    setFormData((prev) => ({
      ...prev,
      download_links: [
        ...(prev.download_links || []),
        { label: "", url: "", season: undefined, episode: undefined },
      ],
    }));
  };
  
  const updateDownloadLink = (index: number, field: keyof DownloadLink, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      download_links: prev.download_links?.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ) || [],
    }));
  };
  
  const removeDownloadLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      download_links: prev.download_links?.filter((_, i) => i !== index) || [],
    }));
  };
  
  if (!isOpen) return null;
  
  const isEdit = !!initialData;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit: ${initialData?.title}` : "Tambah Film/Series Baru"}
      size="full"
      showCloseButton={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TMDB Search Bar */}
        <div className="relative">
          <Input
            ref={tmdbSearchRef}
            label="Cari TMDB (ID atau Judul)"
            placeholder="Contoh: 557 atau 'Inception' atau 'tt1375666'"
            value={tmdbSearchRef.current?.value || ""}
            onChange={(e) => handleTmdbSearch(e.target.value)}
            helperText={tmdbLoading ? "Mencari..." : tmdbSearchResults.length > 0 ? `${tmdbSearchResults.length} hasil ditemukan` : "Kosongkan untuk input manual"}
            className="max-w-md"
          />
          {showTmdbResults && tmdbSearchResults.length > 0 && (
            <div className="absolute z-50 w-full max-w-md mt-1 bg-dark-card border border-dark-border rounded-lg shadow-lg overflow-hidden">
              {tmdbSearchResults.map((result) => (
                <button
                  key={result.tmdb_id}
                  type="button"
                  onClick={() => applyTmdbData(result)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-dark-surface transition-colors text-left border-b border-dark-border/50 last:border-0"
                >
                  {result.poster && (
                    <img src={result.poster} alt="" className="w-12 h-18 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{result.title}</p>
                    <p className="text-xs text-text-muted flex items-center gap-2">
                      <span>{result.year || "—"}</span>
                      <span>•</span>
                      <span className="capitalize">{result.media}</span>
                      {result.rating && <span>⭐ {result.rating}</span>}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="border-b border-dark-border">
          <nav className="flex gap-1" role="tablist">
            {[
              { id: "basic", label: "Dasar" },
              { id: "details", label: "Detail" },
              { id: "media", label: "Media" },
              { id: "downloads", label: "Download Links" },
              { id: "status", label: "Status" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-white hover:bg-dark-surface"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Panels */}
        <div className="space-y-6 pr-4">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="ID *"
                  value={formData.id}
                  onChange={(e) => updateField("id", e.target.value)}
                  error={errors.id}
                  placeholder={isEdit ? "Tidak bisa diubah" : "Contoh: 557, 37854-s1"}
                  disabled={isEdit}
                />
                <Select
                  label="Tipe *"
                  value={formData.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  options={[
                    { value: "movie", label: "Film" },
                    { value: "series", label: "Series" },
                  ]}
                />
              </div>
              
              <Input
                label="Judul *"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                error={errors.title}
                placeholder="Judul film atau series"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => {
                    updateField("slug", e.target.value);
                    setSlugManual(true);
                  }}
                  error={errors.slug}
                  placeholder="Auto-generate dari judul + tahun"
                  helperText={slugManual ? "Manual mode - auto-generate dimatikan" : "Auto-generate dari judul + tahun"}
                />
                <Input
                  label="Tahun *"
                  type="number"
                  value={formData.year?.toString() || ""}
                  onChange={(e) => updateField("year", e.target.value ? parseInt(e.target.value) : null)}
                  error={errors.year}
                  placeholder="2024"
                  min={1900}
                  max={2099}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Rating"
                  type="number"
                  value={formData.rating?.toString() || ""}
                  onChange={(e) => updateField("rating", e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="8.5"
                  min={0}
                  max={10}
                  step={0.1}
                />
                <Input
                  label="Durasi"
                  value={formData.duration ?? ""}
                  onChange={(e) => updateField("duration", e.target.value)}
                  placeholder="120 min / 2 seasons"
                />
              </div>
              
              <Input
                label="Genre *"
                value={formData.genre ?? ""}
                onChange={(e) => updateField("genre", e.target.value)}
                error={errors.genre}
                placeholder="Action, Drama, Sci-Fi"
                helperText="Pisahkan dengan koma"
              />
            </div>
          )}
          
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <Textarea
                label="Sinopsis"
                value={formData.synopsis ?? ""}
                onChange={(e) => updateField("synopsis", e.target.value)}
                placeholder="Sinopsis film/series..."
                rows={5}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                                label="Studio"
                                value={formData.studio ?? ""}
                                onChange={(e) => updateField("studio", e.target.value)}
                                placeholder="Nama studio produksi"
                              />
                              <Input
                                label="Sutradara"
                                value={formData.director ?? ""}
                                onChange={(e) => updateField("director", e.target.value)}
                                placeholder="Nama sutradara"
                />
                <Input
                  label="Pemeran"
                  value={formData.cast ?? ""}
                  onChange={(e) => updateField("cast", e.target.value)}
                  placeholder="Actor 1, Actor 2, Actor 3"
                />
              </div>
            </div>
          )}
          
          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Poster</label>
                  <Input
                    value={formData.poster ?? ""}
                    onChange={(e) => updateField("poster", e.target.value)}
                    placeholder="https://image.tmdb.org/t/p/w500/..."
                  />
                  {formData.poster && (
                    <div className="mt-2">
                      <img src={formData.poster} alt="Poster preview" className="w-32 h-48 object-cover rounded border border-dark-border" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Backdrop</label>
                  <Input
                    value={formData.backdrop ?? ""}
                    onChange={(e) => updateField("backdrop", e.target.value)}
                    placeholder="https://image.tmdb.org/t/p/original/..."
                  />
                  {formData.backdrop && (
                    <div className="mt-2">
                      <img src={formData.backdrop} alt="Backdrop preview" className="w-64 h-36 object-cover rounded border border-dark-border" />
                    </div>
                  )}
                </div>
              </div>
              
              <Input
                label="Trailer (YouTube Embed URL)"
                value={formData.trailer ?? ""}
                onChange={(e) => updateField("trailer", e.target.value)}
                placeholder="https://www.youtube.com/embed/xxxxxx"
              />
            </div>
          )}
          
          {/* Download Links Tab */}
          {activeTab === "downloads" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg">Daftar Link Download</h3>
                <Button type="button" variant="secondary" size="sm" onClick={addDownloadLink}>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Tambah Link
                </Button>
              </div>
              
              {(formData.download_links || []).length === 0 ? (
                <div className="text-center py-8 text-text-muted border-2 border-dashed border-dark-border rounded-xl">
                  <svg className="w-12 h-12 mx-auto mb-3 text-text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p>Belum ada link download. Klik "Tambah Link" untuk menambah.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(formData.download_links || []).map((link, index) => (
                    <div key={index} className="bg-dark-surface border border-dark-border rounded-xl p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">Link Download #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDownloadLink(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Label Server *"
                          value={link.label}
                          onChange={(e) => updateDownloadLink(index, "label", e.target.value)}
                          placeholder="Contoh: PixelDrain, GDrive, MediaFire"
                        />
                        <Input
                          label="URL Download *"
                          value={link.url}
                          onChange={(e) => updateDownloadLink(index, "url", e.target.value)}
                          placeholder="https://pixeldrain.com/u/xxxxx"
                        />
                      </div>
                      
                      {formData.type === "series" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Season (opsional)"
                            type="number"
                            value={link.season?.toString() || ""}
                            onChange={(e) => updateDownloadLink(index, "season", e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="1"
                            min={1}
                          />
                          <Input
                            label="Episode (opsional)"
                            type="number"
                            value={link.episode?.toString() || ""}
                            onChange={(e) => updateDownloadLink(index, "episode", e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="1"
                            min={1}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Status Tab */}
          {activeTab === "status" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Checkbox
                  label="Featured (Tampil di Hero)"
                  checked={formData.featured}
                  onChange={(e) => updateField("featured", e.target.checked)}
                />
                <Checkbox
                  label="Popular (Tampil di Populer)"
                  checked={formData.popular}
                  onChange={(e) => updateField("popular", e.target.checked)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Updated At (Release Date)</label>
                <Input
                  type="datetime-local"
                  value={formData.updated_at || ""}
                  onChange={(e) => updateField("updated_at", e.target.value || null)}
                  placeholder="Otomatis dari tahun rilis"
                  helperText="Format: YYYY-MM-DDTHH:MM. Kosongkan untuk otomatis dari tahun rilis."
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="button" variant="secondary" onClick={() => setActiveTab("basic")} disabled={loading}>
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Simpan Draft
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
            {isEdit ? "Update" : "Rilis"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}