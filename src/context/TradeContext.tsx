
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { Position } from '@/lib/data';
import { accountSummary as staticAccountSummary } from '@/lib/data';

interface AccountSummaryData {
  balance: string;
  equity: string;
  margin: string;
  freeMargin: string;
  marginLevel: string;
  totalProfit: string;
}

interface TradeContextState {
  positions: Position[];
  accountSummary: AccountSummaryData;
  addPosition: (position: Position) => void;
  updatePositions: (currentPrice: number, symbol: string) => void;
}

const TradeContext = createContext<TradeContextState | undefined>(undefined);

// A simple multiplier for profit calculation.
// For XAUUSD, 1 lot might represent 100 units.
// So a $1 price move on a 0.01 lot trade = 1 * 100 * 0.01 = $1 profit.
// This is a simplification. Real-world calculations are more complex.
const getContractSize = (symbol: string): number => {
    if (symbol === 'XAUUSD') {
        return 100;
    }
    return 100000; // Standard lot size for Forex
}

export function TradeProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [accountSummary, setAccountSummary] = useState<AccountSummaryData>(staticAccountSummary);

  const addPosition = useCallback((position: Position) => {
    setPositions(prev => [position, ...prev]);
  }, []);

  const updatePositions = useCallback((currentPrice: number, symbol: string) => {
    setPositions(prevPositions => {
        let hasChanged = false;
        const newPositions = prevPositions.map(pos => {
            if (pos.symbol === symbol) {
                const openPrice = parseFloat(pos.openPrice);
                const volume = parseFloat(pos.volume);
                const contractSize = getContractSize(pos.symbol);

                let profit = 0;
                if (pos.type === 'buy') {
                    profit = (currentPrice - openPrice) * volume * contractSize;
                } else { // sell
                    profit = (openPrice - currentPrice) * volume * contractSize;
                }

                const newCurrentPriceStr = currentPrice.toFixed(2);
                const newProfitStr = profit.toFixed(2);

                if (pos.currentPrice !== newCurrentPriceStr || pos.profit !== newProfitStr) {
                    hasChanged = true;
                    return {
                        ...pos,
                        currentPrice: newCurrentPriceStr,
                        profit: newProfitStr,
                    };
                }
            }
            return pos;
        });
        return hasChanged ? newPositions : prevPositions;
    });
  }, []);
  
  const value = {
    positions,
    accountSummary,
    addPosition,
    updatePositions,
  };

  return (
    <TradeContext.Provider value={value}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrade() {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
}
