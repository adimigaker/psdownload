"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center text-center py-16 px-4", className)}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-dark-surface flex items-center justify-center mb-4 text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="font-heading text-xl text-white mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary text-sm max-w-md mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
            action.variant === "primary"
              ? "bg-primary text-white hover:bg-primary-hover"
              : "bg-dark-surface text-text-secondary border border-dark-border hover:border-primary/50 hover:text-white"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}