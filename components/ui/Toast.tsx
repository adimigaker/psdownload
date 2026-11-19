"use client";

import React, { useState, useCallback, useEffect, createContext } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);
  
  if (!visible) return null;
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  };
  
  const bgColors = {
    success: "bg-green-500/10 border-green-500/30",
    error: "bg-red-500/10 border-red-500/30",
    info: "bg-blue-500/10 border-blue-500/30",
    warning: "bg-yellow-500/10 border-yellow-500/30",
  };
  
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl",
        "bg-dark-card backdrop-blur-sm",
        "animate-slide-in-right",
        bgColors[toast.type]
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg text-text-muted hover:text-white hover:bg-dark-surface transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}