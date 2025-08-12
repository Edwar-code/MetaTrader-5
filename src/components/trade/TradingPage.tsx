'use client';

import { useState } from 'react';
import BottomNav from './BottomNav';
import { TradeChart } from './TradeChart';

export default function TradingPage() {
  const [chartInterval, setChartInterval] = useState('1m');
  const [chartType, setChartType] = useState('candle');
  const asset = "frxXAUUSD"; // Deriv symbol for Gold/USD
  const assetLabel = "Gold/USD";

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="h-full w-full p-4">
            <TradeChart 
                asset={asset}
                assetLabel={assetLabel}
                chartInterval={chartInterval}
                setChartInterval={setChartInterval}
                chartType={chartType}
                setChartType={setChartType}
            />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
