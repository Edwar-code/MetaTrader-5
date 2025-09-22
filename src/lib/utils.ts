
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

// A more realistic P/L calculation.
export function calculatePnl(position: Position, currentPrice: number): number {
    if (!currentPrice || currentPrice <= 0 || !position.entryPrice) {
        return position.pnl || 0;
    }

    const priceDifference = currentPrice - position.entryPrice;
    
    // For XAUUSD, 1 standard lot = 100 ounces.
    // A $1 price move on a 1.0 lot trade is a $100 change.
    // For Forex, 1 standard lot = 100,000 units.
    // The value of a pip move is what varies.
    
    let pnl;
    if (position.pair === 'frxXAUUSD') {
        const contractSize = 100; // 100 ounces per lot
        pnl = priceDifference * position.size * contractSize;
    } else if (position.pair === 'cryBTCUSD') {
        const contractSize = 1; // 1 Bitcoin per lot
        pnl = priceDifference * position.size * contractSize;
    } else if (position.pair === 'idxDE30') {
        // For indices like DE30, 1 lot often corresponds to 1 unit of the index currency per point.
        // E.g., a 1 point move results in a 1 EUR/USD change for a 1 lot trade.
        const contractSize = 1; 
        pnl = priceDifference * position.size * contractSize;
    } else { // Forex
        const contractSize = 100000; // 100,000 units per lot
        pnl = priceDifference * position.size * contractSize;
    }


    if (position.type === 'SELL') {
      pnl = -pnl;
    }
    
    return pnl;
}
