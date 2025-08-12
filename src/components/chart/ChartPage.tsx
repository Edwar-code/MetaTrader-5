
'use client';

import BottomNav from '../trade/BottomNav';
import CandlestickChart from './CandlestickChart';

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

          {/* Right side - ALL other elements */}
          <div className="flex items-center space-x-3">
            {/* Plus Icon - Exact cross */}
            <div className="w-5 h-5 flex items-center justify-center cursor-pointer">
              <div className="relative">
                <div className="w-3.5 h-0.5 bg-gray-700"></div>
                <div className="w-0.5 h-3.5 bg-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>

            {/* Chart/Trend Icon - Exact zigzag line */}
            <div className="w-5 h-5 flex items-center justify-center cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-700">
                <path
                  d="M2 12L6 6L10 10L14 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* M1 Button - Exact styling */}
            <div className="bg-gray-100 border border-gray-300 px-2.5 py-1 rounded text-xs font-medium text-gray-800 cursor-pointer">
              M1
            </div>

            {/* First Circle - Red with white center dot - EXACT MATCH */}
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border border-gray-300 shadow-sm cursor-pointer">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>

            {/* Second Circle - Blue with MT text - EXACT MATCH */}
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold border border-gray-300 shadow-sm cursor-pointer">
              MT
            </div>
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
