"use client";

import { Fragment, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  if (!isOpen) return null;
  
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw]",
  };
  
  return (
    <Fragment>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        <div
          className={cn(
            "w-full bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden",
            sizes[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between px-6 py-4 border-b border-dark-border">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-xl font-heading text-white">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="mt-1 text-sm text-text-secondary">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-dark-surface transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-text-secondary mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-text-secondary bg-dark-surface border border-dark-border rounded-lg hover:bg-dark-border transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
            variant === "danger"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-primary hover:bg-primary-hover"
          )}
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}