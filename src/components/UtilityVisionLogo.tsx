"use client";

import { cn } from "./ui/utils";

interface UtilityVisionLogoProps {
  className?: string;
  size?: number;
  ariaHidden?: boolean;
}

/**
 * Logo for Utility Vision Field Worker: hard hat (field work) + eye (vision).
 * Uses orange, black, and white. Use in headers, report footer, PWA.
 */
export function UtilityVisionLogo({
  className,
  size = 24,
  ariaHidden = true,
}: UtilityVisionLogoProps) {
  return (
    <img
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden={ariaHidden}
    />
  );
}
