"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContentForm } from "@/components/dash/ContentForm";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ContentItem } from "@/lib/supabase/types";

export default function AddEditPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  
  const id = params.id as string;
  const isEdit = !!id;
  
  useEffect(() => {
    if (isEdit) {
      fetchItem();
    } else {
      setLoading(false);
      setFormOpen(true);
    }
  }, [isEdit, id]);
  
  const fetchItem = async () => {
    try {
      const res = await fetch(`/dash/api/films/${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data");
      }
      
      setItem(data);
      setFormOpen(true);
    } catch (error) {
      addToast(`Gagal: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
      router.push("/dash");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (data: Partial<ContentItem>) => {
    const url = isEdit ? `/dash/api/films/${id}` : "/dash/api/films";
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
    
    addToast(isEdit ? "Berhasil diupdate!" : "Berhasil ditambahkan!", "success");
    router.push("/dash");
    router.refresh();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-white">
            {isEdit ? `Edit: ${item?.title || "..."}` : "Tambah Film/Series Baru"}
          </h1>
          <p className="text-text-secondary mt-1">
            {isEdit ? "Perbarui informasi konten" : "Isi form di bawah untuk menambah konten baru"}
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/dash")}>
          ← Kembali
        </Button>
      </div>
      
      <ContentForm
        isOpen={formOpen}
        onClose={() => router.push("/dash")}
        onSubmit={handleSubmit}
        initialData={item}
      />
    </div>
  );
}