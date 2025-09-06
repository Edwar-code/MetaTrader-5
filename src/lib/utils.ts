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
    
    // The fixed spread value to be applied
    const spread = 0.20;

    // Using a standard contract size for forex as a baseline
    const contractSize = 100000;
    
    const priceDifference = currentPrice - position.entryPrice;
    let pnl = priceDifference * position.size;
    
    // For Gold (XAUUSD), the calculation might be different (e.g., 100 units per lot)
    if (position.pair === 'frxXAUUSD') {
       pnl = priceDifference * 100 * position.size;
    }

    if (position.pair === 'cryBTCUSD') {
        pnl = priceDifference * position.size;
    }
    
    const finalPnl = position.type === 'BUY' ? pnl : -pnl;

    // Apply the fixed spread to the calculated P/L
    return finalPnl - spread;
}
