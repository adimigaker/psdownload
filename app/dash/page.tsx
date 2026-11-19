"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ContentTable } from "@/components/dash/ContentTable";
import { ContentForm } from "@/components/dash/ContentForm";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ContentItem } from "@/lib/supabase/types";

export default function DashPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, movies: 0, series: 0 });
  const [formState, setFormState] = useState<{ open: boolean; item: ContentItem | null }>({
    open: false,
    item: null,
  });
  const { addToast } = useToast();
  
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/dash/api/films");
      const data = await res.json();
      
      if (data.data) {
        setItems(data.data);
        const movies = data.data.filter((i: ContentItem) => i.type === "movie").length;
        const series = data.data.filter((i: ContentItem) => i.type === "series").length;
        setStats({ total: data.data.length, movies, series });
      } else if (Array.isArray(data)) {
        setItems(data);
        const movies = data.filter((i: ContentItem) => i.type === "movie").length;
        const series = data.filter((i: ContentItem) => i.type === "series").length;
        setStats({ total: data.length, movies, series });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      addToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleEdit = (item: ContentItem) => {
    setFormState({ open: true, item });
  };
  
  const handleAdd = () => {
    setFormState({ open: true, item: null });
  };
  
  const handleFormSubmit = async (data: Partial<ContentItem>) => {
    const isEdit = !!formState.item;
    const url = isEdit ? `/dash/api/films/${formState.item!.id}` : "/dash/api/films";
    const method = isEdit ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.error || "Gagal menyimpan");
    }
    
    fetchData();
  };
  
  const handleDelete = async (id: string) => {
    const res = await fetch(`/dash/api/films/${id}`, {
      method: "DELETE",
    });
    
    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.error || "Gagal menghapus");
    }
    
    fetchData();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-white">Dashboard</h1>
          <p className="text-text-secondary mt-1">Kelola film dan series</p>
        </div>
        <Button onClick={handleAdd} className="whitespace-nowrap">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Baru
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="text-text-muted text-sm">Total</div>
          <div className="font-heading text-3xl text-white mt-1">{stats.total}</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="text-text-muted text-sm">Film</div>
          <div className="font-heading text-3xl text-white mt-1">{stats.movies}</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="text-text-muted text-sm">Series</div>
          <div className="font-heading text-3xl text-white mt-1">{stats.series}</div>
        </div>
      </div>
      
      {/* Table */}
      <ContentTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={(item) => window.open(`/${item.slug}`, "_blank")}
        loading={loading}
      />
      
      {/* Form Modal */}
      <ContentForm
        isOpen={formState.open}
        onClose={() => setFormState({ open: false, item: null })}
        onSubmit={handleFormSubmit}
        initialData={formState.item}
      />
    </div>
  );
}