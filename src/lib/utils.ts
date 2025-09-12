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

// A more realistic P/L calculation for XAUUSD.
export function calculatePnl(position: Position, currentPrice: number): number {
    if (!currentPrice || currentPrice <= 0 || !position.entryPrice) {
        return position.pnl || 0;
    }

    const priceDifference = currentPrice - position.entryPrice;
    
    // For XAUUSD, 1 standard lot = 100 ounces.
    // A $1 price move on a 1.0 lot trade is a $100 change.
    const contractSize = 100;
    
    let pnl = priceDifference * position.size * contractSize;

    if (position.type === 'SELL') {
      pnl = -pnl;
    }
    
    return pnl;
}
