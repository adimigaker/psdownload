"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "interactive";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-dark-card border border-dark-border rounded-xl overflow-hidden",
      hover: "bg-dark-card border border-dark-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
      interactive: "bg-dark-card border border-dark-border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20",
    };
    
    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 border-b border-dark-border", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 border-t border-dark-border bg-dark-surface/50", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";