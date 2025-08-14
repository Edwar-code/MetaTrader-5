
'use client';

import { useState, useMemo } from 'react';
import BottomNav from '../trade/BottomNav';
import { TradeChart } from '../trade/TradeChart';
import { CrosshairIcon, FunctionIcon, ClockIcon, ShapesIcon } from './icons';
import { Sidebar } from '../trade/Sidebar';
import { MarketSelector } from '../trade/MarketSelector';
import { useDerivState } from '@/context/DerivContext';
import { TimeframeWheel } from './TimeframeWheel';
import { ChevronDown } from 'lucide-react';

const formatPrice = (price: number | undefined) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return { integer: '-', fractional: '--' };
  }
  const priceString = price.toFixed(2);
  const [integer, fractional] = priceString.split('.');
  return { integer, fractional };
};

export default function ChartPage() {
  const { activeSymbols, ticks } = useDerivState();
  
  const forexSymbols = activeSymbols.filter(s => s.market === 'forex');
  const initialAsset = forexSymbols.length > 0 ? forexSymbols[0].symbol : 'frxXAUUSD';

  const [selectedAsset, setSelectedAsset] = useState(initialAsset);
  const selectedSymbol = activeSymbols.find(s => s.symbol === selectedAsset);
  const assetLabel = selectedSymbol ? selectedSymbol.display_name : 'XAUUSD';

  const [chartInterval, setChartInterval] = useState('1m');
  const [chartType, setChartType] = useState('candle');
  const [isTimeframeWheelOpen, setIsTimeframeWheelOpen] = useState(false);

  const lastTick = ticks.length > 0 ? ticks[ticks.length - 1] : null;
  const sellPrice = lastTick?.quote;
  const buyPrice = sellPrice !== undefined ? sellPrice + 0.20 : undefined;

  const formattedSellPrice = useMemo(() => formatPrice(sellPrice), [sellPrice]);
  const formattedBuyPrice = useMemo(() => formatPrice(buyPrice), [buyPrice]);

  const intervalMap: { [key: string]: string } = {
    '1m': 'M1', '5m': 'M5', '15m': 'M15', '30m': 'M30', '1h': 'H1', '4h': 'H4', '1d': 'D1', '1W': 'W1', '1M': 'MN', 'tick': 'Tick'
  };
  
  const displayAsset = useMemo(() => {
    if (selectedAsset === 'frxXAUUSD') return 'XAUUSD';
    return assetLabel.split(': ').pop() || assetLabel;
  }, [assetLabel, selectedAsset]);

  const displayDescription = useMemo(() => {
      if (selectedAsset === 'frxXAUUSD') return 'Gold Spot';
      return selectedSymbol?.submarket_display_name || '...';
  }, [selectedAsset, selectedSymbol]);

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      
      {/* Chart Container - Now takes full space and is behind other elements */}
      <div className="flex-1 bg-gray-50 relative min-h-0">
         <div className="absolute top-[100px] left-3 z-10">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-primary">{displayAsset}</span>
            <ChevronDown className="w-4 h-4 text-primary" />
            <span className="font-normal text-foreground">{intervalMap[chartInterval]}</span>
          </div>
          <p className="text-sm text-muted-foreground">{displayDescription}</p>
        </div>
        <TradeChart
          asset={selectedAsset}
          assetLabel={assetLabel}
          chartInterval={chartInterval}
          setChartInterval={setChartInterval}
          chartType={chartType}
          setChartType={setChartType}
        />
      </div>

      {/* Top Navigation - Absolutely Positioned */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2.5 bg-white border-b border-gray-300 z-20">
        <div className="flex items-center">
          <Sidebar />
          <div className="w-48">
            <MarketSelector
              asset={selectedAsset}
              setAsset={setSelectedAsset}
              marketFilter="forex"
            />
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <CrosshairIcon />
          <FunctionIcon />
          <button onClick={() => setIsTimeframeWheelOpen(!isTimeframeWheelOpen)}>
            <ClockIcon />
          </button>
          <ShapesIcon />
        </div>
      </div>

      {/* SELL/BUY Section - Absolutely Positioned */}
      <div className="absolute left-0 right-0 flex z-10" style={{top: '60px'}}>
        <div className="bg-red-500 text-white flex-grow-[0.3] cursor-pointer flex flex-col justify-center items-start pl-1.5 pt-1">
          <div className="font-normal opacity-90 text-[10px] leading-none">SELL</div>
          <div className="leading-none text-center w-full">
            <span className="text-[13px] font-bold">{formattedSellPrice.integer}</span>
            <span className="text-[22px] font-bold">.{formattedSellPrice.fractional}</span>
          </div>
        </div>
        <div className="bg-white px-2 flex items-center justify-center min-w-[140px] flex-grow-[0.4]">
          <div className="flex items-center space-x-6">
            <div className="cursor-pointer p-1">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-gray-600"></div>
            </div>
            <span className="text-sm font-normal text-gray-800 min-w-[18px] text-center">10</span>
            <div className="cursor-pointer p-1">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-gray-600"></div>
            </div>
          </div>
        </div>
        <div className="bg-blue-600 text-white flex-grow-[0.3] cursor-pointer flex flex-col justify-center items-start pl-1.5 pt-1">
          <div className="font-normal opacity-90 text-[10px] leading-none">BUY</div>
          <div className="leading-none text-center w-full">
            <span className="text-[13px] font-bold">{formattedBuyPrice.integer}</span>
            <span className="text-[22px] font-bold">.{formattedBuyPrice.fractional}</span>
          </div>
        </div>
      </div>
      
      {/* Timeframe wheel stays as an overlay */}
      <TimeframeWheel
            isOpen={isTimeframeWheelOpen}
            onClose={() => setIsTimeframeWheelOpen(false)}
            selectedInterval={chartInterval}
            onSelectInterval={(interval) => {
              setChartInterval(interval);
              setIsTimeframeWheelOpen(false);
            }}
          />

      <BottomNav />
    </div>
  );
}
