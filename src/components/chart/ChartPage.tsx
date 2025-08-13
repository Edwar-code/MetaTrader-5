
'use client';

import { useState } from 'react';
import BottomNav from '../trade/BottomNav';
import { TradeChart } from '../trade/TradeChart';
import { CrosshairIcon, FunctionIcon, ClockIcon, ShapesIcon } from './icons';
import { Sidebar } from '../trade/Sidebar';
import { sampleCandleData } from '@/lib/data';

export default function ChartPage() {
  const assetLabel = "Gold/USD";

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white border-b border-gray-300 z-20 shrink-0">
        <div className="flex items-center">
          <Sidebar />
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <CrosshairIcon />
          <FunctionIcon />
          <ClockIcon />
          <ShapesIcon />
        </div>
      </div>

      {/* SELL/BUY Section */}
      <div className="flex z-10 relative shrink-0">
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
      
      {/* Chart Container */}
      <div className="flex-1 bg-gray-50 relative min-h-0">
        <TradeChart
          assetLabel={assetLabel}
          staticData={sampleCandleData}
        />
      </div>

      <BottomNav />
    </div>
  );
}
