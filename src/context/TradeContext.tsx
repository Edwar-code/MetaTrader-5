'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { Position } from '@/lib/data';
import { positions as staticPositions, accountSummary as staticAccountSummary } from '@/lib/data';

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

export function TradeProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<Position[]>(staticPositions);
  const [accountSummary, setAccountSummary] = useState<AccountSummaryData>(staticAccountSummary);

  const addPosition = useCallback((position: Position) => {
    setPositions(prev => [position, ...prev]);
  }, []);

  const updatePositions = useCallback((currentPrice: number, symbol: string) => {
    // This will be implemented in the next step to update P/L
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
