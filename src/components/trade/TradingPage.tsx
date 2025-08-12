'use client';

import AccountSummary from './AccountSummary';
import Header from './Header';
import PositionsList from './PositionsList';
import BottomNav from './BottomNav';
import { AnalysisDrawer } from './AnalysisDrawer';
import { Button } from '../ui/button';
import { Wand2 } from 'lucide-react';
import InstallPrompt from './InstallPrompt';
import { accountSummary } from '@/lib/data';
import { useDerivState } from '@/context/DerivContext';
import type { Position } from '@/lib/data';

export default function TradingPage() {
  const { profitTable, balance } = useDerivState();

  const positions: Position[] = profitTable.map((trade) => ({
      symbol: trade.symbol,
      type: trade.contract_type === 'CALL' ? 'buy' : 'sell',
      volume: '1.00', // This is a placeholder, as volume is not in the profit_table response
      openPrice: trade.entry_spot?.toFixed(4) || 'N/A',
      currentPrice: trade.exit_spot?.toFixed(4) || 'N/A',
      profit: trade.profit_loss.toFixed(2),
  }));

  const totalProfit = positions.reduce((acc, pos) => acc + parseFloat(pos.profit), 0).toFixed(2);
  const totalProfitStr = `${totalProfit >= 0 ? '+' : ''}${totalProfit}`;
  
  const summaryData = {
    balance: balance?.value.toFixed(2) || accountSummary.balance,
    equity: balance?.value.toFixed(2) || accountSummary.equity,
    margin: accountSummary.margin,
    freeMargin: accountSummary.freeMargin,
    marginLevel: accountSummary.marginLevel,
  };

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <Header totalProfit={totalProfitStr} />
      <div className="flex-1 overflow-y-auto pb-16">
        <AccountSummary data={summaryData} />
        <PositionsList positions={positions} />
        <div className="p-4">
          <AnalysisDrawer positions={positions}>
            <Button variant="outline" className="w-full">
              <Wand2 className="mr-2" />
              AI Position Analysis
            </Button>
          </AnalysisDrawer>
        </div>
        <InstallPrompt />
      </div>
      <BottomNav />
    </div>
  );
}
