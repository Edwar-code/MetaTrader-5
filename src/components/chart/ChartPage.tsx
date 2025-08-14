
'use client';

import { useState, useMemo, useEffect } from 'react';
import BottomNav from '../trade/BottomNav';
import { TradeChart, type ChartMarker } from '../trade/TradeChart';
import { CrosshairIcon, FunctionIcon, ClockIcon, ShapesIcon } from './icons';
import { Sidebar } from '../trade/Sidebar';
import { useDerivState } from '@/context/DerivContext';
import { TimeframeWheel } from './TimeframeWheel';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTrade } from '@/context/TradeContext';

const formatPrice = (price: number | undefined) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return { integer: '-', fractional: '--' };
  }
  const priceString = price.toFixed(2);
  const [integer, fractional] = priceString.split('.');
  return { integer, fractional };
};

export default function ChartPage() {
  const { ticks, isAuthenticated } = useDerivState();
  const { positions, addPosition } = useTrade();
  const { toast } = useToast();
  
  const [selectedAsset, setAsset] = useState('frxXAUUSD');
  const [chartInterval, setChartInterval] = useState('1m');
  const [chartType, setChartType] = useState('candle');
  const [isTimeframeWheelOpen, setIsTimeframeWheelOpen] = useState(false);
  const [lotSize, setLotSize] = useState('0.01');

  const chartMarkers = useMemo((): ChartMarker[] => {
    return positions.map(pos => ({
      epoch: new Date(pos.date).getTime() / 1000,
      price: parseFloat(pos.openPrice),
      type: 'entry',
      tradeType: pos.type === 'buy' ? 'BUY' : 'SELL',
      lotSize: pos.volume,
    }));
  }, [positions]);


  const lastTick = ticks.length > 0 ? ticks[ticks.length - 1] : null;
  const sellPrice = lastTick?.quote;
  const buyPrice = sellPrice !== undefined ? sellPrice + 0.20 : undefined;

  const formattedSellPrice = useMemo(() => formatPrice(sellPrice), [sellPrice]);
  const formattedBuyPrice = useMemo(() => formatPrice(buyPrice), [buyPrice]);

  const handleTrade = async (tradeType: 'buy' | 'sell') => {
    if (!isAuthenticated) {
      toast({ title: 'Authentication Error', description: 'Please connect your account to trade.', variant: 'destructive' });
      return;
    }

    const price = tradeType === 'buy' ? buyPrice : sellPrice;
    if (price === undefined || !lastTick) {
      toast({ title: 'Trade Error', description: 'Could not get the current price.', variant: 'destructive' });
      return;
    }
    
    addPosition({
      symbol: 'XAUUSD', 
      type: tradeType,
      volume: lotSize,
      openPrice: price.toFixed(2),
      currentPrice: price.toFixed(2),
      profit: '0.00',
      date: new Date().toISOString(),
      id: `sim-${Date.now()}`,
      sl: '—',
      tp: '—',
      swap: '0.00',
    });

    toast({ title: 'Trade Placed!', description: `Successfully placed a ${tradeType.toUpperCase()} order.` });
  };

  const intervalMap: { [key: string]: string } = {
    '1m': 'M1', '5m': 'M5', '15m': 'M15', '30m': 'M30', '1h': 'H1', '4h': 'H4', '1d': 'D1', '1W': 'W1', '1M': 'MN', 'tick': 'Tick'
  };
  
  const displayAsset = 'XAUUSD';
  const displayDescription = 'Gold Spot';

  const handleLotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single dot
    if (/^\d*\.?\d*$/.test(value)) {
      setLotSize(value);
    }
  };

  const adjustLotSize = (amount: number) => {
    setLotSize(prev => {
      const current = parseFloat(prev) || 0;
      const newSize = Math.max(0.01, current + amount);
      // Format to 2 decimal places to handle floating point inaccuracies
      return newSize.toFixed(2);
    });
  };

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      
      {/* Chart Container - Now takes full space and is behind other elements */}
      <div className="flex-1 bg-gray-50 relative min-h-0 pt-[48px]">
         <div className="absolute top-[110px] left-3 z-10">
          <div className="flex items-center gap-1">
            <span className="font-normal text-primary text-[12.5px]">{displayAsset}</span>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-primary"></div>
            <span className="font-normal text-muted-foreground text-[12.5px]">{intervalMap[chartInterval]}</span>
          </div>
          <p className="text-[10.5px] text-muted-foreground">{displayDescription}</p>
        </div>
        <TradeChart
          asset={selectedAsset}
          assetLabel={displayAsset}
          markers={chartMarkers}
          chartInterval={chartInterval}
          setChartInterval={setChartInterval}
          chartType={chartType}
          setChartType={setChartType}
        />
      </div>

      {/* Top Navigation - Absolutely Positioned */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2.5 bg-white border-b border-gray-300 z-20 h-[48px]">
        <div className="flex items-center">
          <Sidebar />
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
      <div className="absolute left-0 right-0 flex z-10" style={{top: '48.6px'}}>
        <div onClick={() => handleTrade('sell')} className="bg-red-500 text-white flex-grow-[0.3] cursor-pointer flex flex-col justify-center items-start pl-1.5 pt-1">
          <div className="font-normal opacity-90 text-[10px] leading-none">SELL</div>
          <div className="leading-none text-center w-full">
            <span className="text-[13px] font-bold">{formattedSellPrice.integer}</span>
            <span className="text-[22px] font-bold">.{formattedSellPrice.fractional}</span>
          </div>
        </div>
        <div className="bg-white px-2 flex items-center justify-center min-w-[140px] flex-grow-[0.4]">
          <div className="flex items-center space-x-2">
            <button className="cursor-pointer p-1" onClick={() => adjustLotSize(-0.01)}>
                <ChevronDown className="h-5 w-5 text-gray-700" />
            </button>
             <input
              type="text"
              value={lotSize}
              onChange={handleLotChange}
              className="text-[13px] text-gray-800 min-w-[40px] w-14 text-center bg-transparent border-none focus:ring-0 focus-visible:outline-none"
            />
            <button className="cursor-pointer p-1" onClick={() => adjustLotSize(0.01)}>
                <ChevronUp className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
        <div onClick={() => handleTrade('buy')} className="bg-blue-600 text-white flex-grow-[0.3] cursor-pointer flex flex-col justify-center items-start pl-1.5 pt-1">
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
