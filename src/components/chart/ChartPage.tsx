
'use client';

import BottomNav from '../trade/BottomNav';
import CandlestickChart from './CandlestickChart';
import { CrosshairIcon, FunctionIcon, ClockIcon, ShapesIcon } from './icons';
import { Sidebar } from '../trade/Sidebar';

export default function ChartPage() {
  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <div className="h-screen bg-white flex flex-col">
        {/* Top Navigation - EXACT REPLICA */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-white border-b border-gray-300 z-20">
          {/* Left side - ONLY hamburger menu */}
          <div className="flex items-center">
            <Sidebar />
          </div>

          <div className="flex-1"></div>

          {/* Right side - Icons */}
          <div className="flex items-center space-x-4">
            <CrosshairIcon />
            <FunctionIcon />
            <ClockIcon />
            <ShapesIcon />
          </div>
        </div>

        <div className="relative flex-1">
          {/* SELL/BUY Section with Lots Feature - EXACT REPLICA */}
          <div className="flex z-10 relative">
            {/* SELL Section - Exact Red */}
            <div className="bg-red-500 text-white flex-grow-[0.3] cursor-pointer flex flex-col justify-center items-start pl-1.5 pt-1">
              <div className="font-normal opacity-90 text-[10px] leading-none">SELL</div>
              <div className="leading-none text-center w-full">
                <span className="text-[13px] font-bold">3346</span>
                <span className="text-[22px] font-bold">.12</span>
              </div>
            </div>

            {/* Lots Feature - Gray Middle Section */}
            <div className="bg-gray-100 px-2 flex items-center justify-center min-w-[140px] flex-grow-[0.4]">
              <div className="flex items-center space-x-6">
                {/* Down Arrow - Exact CSS Triangle */}
                <div className="cursor-pointer p-1">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-gray-600"></div>
                </div>

                {/* Lots Number */}
                <span className="text-sm font-normal text-gray-800 min-w-[18px] text-center">10</span>

                {/* Up Arrow - Exact CSS Triangle */}
                <div className="cursor-pointer p-1">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-gray-600"></div>
                </div>
              </div>
            </div>

            {/* BUY Section - Exact Blue */}
            <div className="bg-blue-600 text-white flex-grow-[0.3] cursor-pointer flex flex-col justify-center items-start pl-1.5 pt-1">
              <div className="font-normal opacity-90 text-[10px] leading-none">BUY</div>
              <div className="leading-none text-center w-full">
                <span className="text-[13px] font-bold">3346</span>
                <span className="text-[22px] font-bold">.32</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <div className="absolute top-12 left-2 z-10 text-gray-600">
              <div className="text-[13px] font-medium text-foreground">
                <span className="text-primary">XAUUSD</span>, <span className="font-normal">M1</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Gold Spot</div>
            </div>
            <CandlestickChart />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
