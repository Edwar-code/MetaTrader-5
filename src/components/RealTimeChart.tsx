// /components/RealTimeChart.tsx

'use client';

import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

// ====================================================================================
//  PASTE YOUR API KEY HERE
// ====================================================================================
const TWELVE_DATA_API_KEY = '0c28aa5d1ffe48eba7228111b65adb00'; // <-- IMPORTANT: REPLACE THIS
// ====================================================================================

// This is the main component for our real-time chart
export const RealTimeChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candlestickSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // State to track the connection status
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  // This effect hook runs once to initialize the chart and the WebSocket connection
  useEffect(() => {
    // Ensure this code only runs in the browser
    if (typeof window === 'undefined' || !chartContainerRef.current) {
      return;
    }
    
    // Check if API key is set
    if (TWELVE_DATA_API_KEY === '0c28aa5d1ffe48eba7228111b65adb00') {
      setConnectionStatus('Error: Please set your Twelve Data API Key in the code.');
      console.error('API key not set.');
      return;
    }

    // --- Chart Initialization ---
    chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.2)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.2)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    candlestickSeries.current = chart.current.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });

    // --- WebSocket Connection ---
    const ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${TWELVE_DATA_API_KEY}`);

    let currentCandle: CandlestickData | null = null;
    let candleInterval: NodeJS.Timeout;

    ws.onopen = () => {
      setConnectionStatus('Connected');
      console.log('WebSocket connection opened.');
      ws.send(JSON.stringify({
        action: 'subscribe',
        params: {
          symbols: 'XAU/USD',
        },
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === 'price') {
        const price = data.price;
        const time = Math.floor(data.timestamp / 1000); // Use server timestamp, convert ms to s

        if (!currentCandle) {
          // This is the first tick, create a new candle
          currentCandle = {
            time: Math.floor(time / 60) * 60, // Start of the minute
            open: price,
            high: price,
            low: price,
            close: price,
          };
        } else {
          // Update the current candle with the new price
          currentCandle.high = Math.max(currentCandle.high, price);
          currentCandle.low = Math.min(currentCandle.low, price);
          currentCandle.close = price;
        }
        
        // Update the chart with the latest candle data
        if(candlestickSeries.current) {
            candlestickSeries.current.update(currentCandle);
        }
      }
    };

    // This function runs every minute to close the old candle and start a new one
    const createNewCandle = () => {
        if(currentCandle) {
            const time = Math.floor(Date.now() / 1000);
            const price = currentCandle.close; // Start the new candle at the last close price
            currentCandle = {
                time: Math.floor(time / 60) * 60,
                open: price,
                high: price,
                low: price,
                close: price,
            }
        }
    }
    
    // Set an interval to create a new candle at the start of every minute
    const now = new Date();
    const secondsUntilNextMinute = 60 - now.getSeconds();
    setTimeout(() => {
        createNewCandle();
        candleInterval = setInterval(createNewCandle, 60000); // Then every 60 seconds
    }, secondsUntilNextMinute * 1000);


    ws.onclose = () => {
      setConnectionStatus('Disconnected');
      console.log('WebSocket connection closed.');
      clearInterval(candleInterval);
    };

    ws.onerror = (error) => {
      setConnectionStatus('Connection Error');
      console.error('WebSocket error:', error);
    };

    // --- Cleanup ---
    // This function is called when the component is unmounted
    return () => {
      ws.close();
      if (chart.current) {
        chart.current.remove();
      }
      clearInterval(candleInterval);
    };
  }, []); // The empty array [] means this effect runs only once

  return (
    <div className="w-full h-full flex flex-col">
       <div className="p-2 bg-black text-white text-sm">
        <span>XAU/USD Real-Time Chart</span>
        <span className={`ml-4 px-2 py-1 rounded text-xs ${
            connectionStatus === 'Connected' ? 'bg-green-500' :
            connectionStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
        }`}>
            {connectionStatus}
        </span>
       </div>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};