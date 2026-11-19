"use client";

import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-dark-surface text-text-secondary border border-dark-border",
    primary: "bg-primary/20 text-primary border border-primary/30",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    outline: "bg-transparent text-text-secondary border border-dark-border",
  };
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };
  
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  removable?: boolean;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function Tag({
  className,
  removable,
  onRemove,
  size = "md",
  children,
  ...props
}: TagProps) {
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-lg text-text-secondary",
        removable && "pr-1",
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="p-0.5 rounded text-text-muted hover:text-white hover:bg-dark-border transition-colors"
          aria-label="Remove tag"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
}