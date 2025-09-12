import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Position } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAssetDisplayName(displayName: string): string {
  // Removes market prefix like "Forex: " or "Crypto: "
  return displayName.split(': ').pop() || displayName;
}

// A simple (and not 100% accurate) P/L calculation for demo purposes.
export function calculatePnl(position: Position, currentPrice: number): number {
    if (!currentPrice || currentPrice <= 0) return position.pnl || 0;

    const priceDifference = currentPrice - position.entryPrice;
    
    // Simplified PnL calculation based on direction and size
    let pnl = priceDifference * position.size;

    if (position.type === 'SELL') {
      pnl = -pnl;
    }
    
    // The fixed spread value to be applied, representing broker's cut on open
    const spread = 0.20 * position.size;

    return pnl - spread;
}
