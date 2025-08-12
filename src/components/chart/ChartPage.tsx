
'use client';

import BottomNav from '../trade/BottomNav';
import CandlestickChart from './CandlestickChart';
import { CrosshairIcon, FunctionIcon, ClockIcon, ShapesIcon } from './icons';

export default function ChartPage() {
  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <div className="h-screen bg-white flex flex-col">
        {/* Top Navigation - EXACT REPLICA */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-white border-b border-gray-300">
          {/* Left side - ONLY hamburger menu */}
          <div className="flex items-center">
            {/* Hamburger Menu - Exact 3 lines */}
            <div className="w-5 h-5 flex flex-col justify-center items-center cursor-pointer">
              <div className="w-4 h-0.5 bg-gray-700 mb-0.5"></div>
              <div className="w-4 h-0.5 bg-gray-700 mb-0.5"></div>
              <div className="w-4 h-0.5 bg-gray-700"></div>
            </div>
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

        {/* SELL/BUY Section with Lots Feature - EXACT REPLICA */}
        <div className="flex">
          {/* SELL Section - Exact Red */}
          <div className="bg-red-500 text-white flex-1 py-2 flex flex-col cursor-pointer relative sm:py-[3px] px-[17px]">
            <div className="font-normal opacity-90 text-left text-[14px] my-[0px]">SELL</div>
            <div className="text-center">
              <span className="text-2xl font-bold sm:text-[18px]">3346</span>
              <span className="text-lg font-bold sm:text-[24px]">.12</span>
            </div>
          </div>

          {/* Lots Feature - Gray Middle Section */}
          <div className="bg-gray-100 px-4 flex items-center justify-center min-w-[80px] sm:mx-[3px] py-[1px]">
            <div className="flex items-center space-x-1 mx-[1px]">
              {/* Down Arrow - Exact CSS Triangle */}
              <div className="cursor-pointer p-1 mx-[29px] px-[0px] py-[1px]">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-gray-600 sm:mx-[30px] mx-[27px]"></div>
              </div>

              {/* Lots Number */}
              <span className="text-lg font-medium text-gray-800 mx-3 min-w-[20px] text-center">10</span>

              {/* Up Arrow - Exact CSS Triangle */}
              <div className="cursor-pointer p-1 sm:mx-[20px] mx-[29px]">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-gray-600 sm:mx-[30px] mx-[27px] px-[1px] py-[0px]"></div>
              </div>
            </div>
          </div>

          {/* BUY Section - Exact Blue */}
          <div className="bg-blue-600 text-white flex-1 py-2 flex flex-col cursor-pointer relative sm:py-[3px] px-[17px]">
            <div className="font-normal opacity-90 text-left text-[14px] my-[0px]">BUY</div>
            <div className="text-center">
              <span className="text-2xl font-bold sm:text-[19px]">3346</span>
              <span className="text-lg font-bold sm:text-[24px]">.32</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-4">
          <CandlestickChart />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
