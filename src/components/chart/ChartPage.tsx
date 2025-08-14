
'use client';

import { useState } from 'react';
import BottomNav from '../trade/BottomNav';
import { TradeChart } from '../trade/TradeChart';
import { CrosshairIcon, FunctionIcon, ClockIcon, ShapesIcon } from './icons';
import { Sidebar } from '../trade/Sidebar';
import { MarketSelector } from '../trade/MarketSelector';
import { useDerivState } from '@/context/DerivContext';
import { TimeframeWheel } from './TimeframeWheel';

export default function ChartPage() {
  const { activeSymbols } = useDerivState();
  
  const forexSymbols = activeSymbols.filter(s => s.market === 'forex');
  const initialAsset = forexSymbols.length > 0 ? forexSymbols[0].symbol : 'frxXAUUSD';

  const [selectedAsset, setSelectedAsset] = useState(initialAsset);
  const selectedSymbol = activeSymbols.find(s => s.symbol === selectedAsset);
  const assetLabel = selectedSymbol ? selectedSymbol.display_name : 'XAUUSD';

  const [chartInterval, setChartInterval] = useState('1m');
  const [chartType, setChartType] = useState('candle');
  const [isTimeframeWheelOpen, setIsTimeframeWheelOpen] = useState(false);


  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      
      {/* Chart Container - Now takes full space and is behind other elements */}
      <div className="flex-1 bg-gray-50 relative min-h-0">
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
            <span className="text-[13px] font-bold">3346</span>
            <span className="text-[22px] font-bold">.12</span>
          </div>
        </div>
        <div className="bg-gray-100 px-2 flex items-center justify-center min-w-[140px] flex-grow-[0.4]">
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
            <span className="text-[13px] font-bold">3346</span>
            <span className="text-[22px] font-bold">.32</span>
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
