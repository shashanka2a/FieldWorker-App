"use client";

import { cn } from "./utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-5 border-2",
  lg: "size-6 border-2",
};

export function Spinner({ className, size = "md", style }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={style}
      className={cn(
        "inline-block rounded-full border-current border-t-transparent animate-spin-slow",
        sizeClasses[size],
        className
      )}
    />
  );
}
