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
    
    // Using a standard contract size for forex as a baseline
    const contractSize = 100000;
    
    const priceDifference = currentPrice - position.entryPrice;
    let pnl = priceDifference * contractSize * position.size;
    
    // For Gold (XAUUSD), the calculation might be different (e.g., 100 units per lot)
    // This is a common source of discrepancy in real-world platforms.
    if (position.pair === 'frxXAUUSD') {
       // Adjust for a different contract size if needed, e.g., 100 instead of 100000
       pnl = priceDifference * 100 * position.size;
    }
    
    return position.type === 'BUY' ? pnl : -pnl;
}
