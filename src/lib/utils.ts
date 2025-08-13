import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAssetDisplayName(displayName: string): string {
  // Removes market prefix like "Forex: " or "Crypto: "
  return displayName.split(': ').pop() || displayName;
}
