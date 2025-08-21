'use client';

import { useMemo } from 'react';
import AccountSummary from './AccountSummary';
import BottomNav from './BottomNav';
import Header from './Header';
import PositionsList from './PositionsList';
import InstallPrompt from './InstallPrompt';
import { useTradeState } from '@/context/TradeContext';

export default function TradingPage() {
  const { positions, equity, balance, totalPnl } = useTradeState();

  const accountSummary = useMemo(() => {
    return {
      balance: balance.toFixed(2),
      equity: equity.toFixed(2),
      margin: '0.00', // These can be implemented later
      freeMargin: equity.toFixed(2),
      marginLevel: '0.00',
    };
  }, [balance, equity]);

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <Header totalProfit={totalPnl.toFixed(2)} hasOpenPositions={positions.length > 0} />
      <div className="flex-1 overflow-y-auto pb-16">
        <AccountSummary data={accountSummary} />
        <PositionsList positions={positions} />
        <InstallPrompt />
      </div>
      <BottomNav />
    </div>
  );
}
