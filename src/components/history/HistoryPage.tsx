
'use client';

import { useMemo } from 'react';
import HistorySummary from './HistorySummary';
import BottomNav from '../trade/BottomNav';
import HistoryHeader from './HistoryHeader';
import HistoryList from './HistoryList';
import { useTradeState } from '@/context/TradeContext';

export default function HistoryPage() {
  const { closedPositions, balance } = useTradeState();

  const historySummary = useMemo(() => {
    const totalProfit = closedPositions.reduce((acc, pos) => acc + pos.pnl, 0);
    const initialDeposit = 100.00; // The starting balance

    return {
      profit: totalProfit.toFixed(2),
      deposit: initialDeposit.toFixed(2),
      swap: '0.00',
      commission: '0.00',
      balance: balance.toFixed(2),
    };
  }, [closedPositions, balance]);

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <HistoryHeader />
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-4 py-2 border-b">
           <div className="flex items-center gap-8">
             <span className="text-primary border-b-2 border-primary pb-2 font-semibold">POSITIONS</span>
             <span className="text-muted-foreground pb-2 font-semibold">ORDERS</span>
             <span className="text-muted-foreground pb-2 font-semibold">DEALS</span>
           </div>
        </div>
        <HistorySummary data={historySummary} />
        {closedPositions.length > 0 ? (
          <HistoryList positions={closedPositions} />
        ) : (
          <div className="border-t text-center p-8 text-muted-foreground">
              No history yet. Closed trades will appear here.
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
