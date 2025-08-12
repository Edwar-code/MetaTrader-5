
'use client';

import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

const TWELVE_DATA_API_KEY = '0c28aa5d1ffe48eba7228111b65adb00';

export const RealtimeTradingViewChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candlestickSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    // Ensure this code only runs in the browser and the container is available
    if (typeof window === 'undefined' || !chartContainerRef.current) {
      return;
    }

    // --- Chart Initialization ---
    // This is where we create the chart using the new library
    chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#FFFFFF' }, // White background
        textColor: '#333333',
      },
      grid: {
        vertLines: { color: '#E1E3E6' },
        horzLines: { color: '#E1E3E6' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#D1D4DC',
      },
      rightPriceScale: {
        borderColor: '#D1D4DC',
      },
    });

    // Add the candlestick series to the chart
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

    ws.onopen = () => {
      console.log('✅ WebSocket Connected!');
      ws.send(JSON.stringify({
        action: 'subscribe',
        params: { symbols: 'XAU/USD' },
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === 'price') {
        const price = data.price;
        const time = Math.floor(data.timestamp / 1000) as UTCTimestamp; // The library needs this specific type

        // This is the core logic to make the chart MOVE on every tick
        if (!currentCandle || time >= currentCandle.time + 60) {
          // This tick belongs to a new minute, so we start a new candle
          currentCandle = {
            time: (Math.floor(time / 60) * 60) as UTCTimestamp,
            open: price,
            high: price,
            low: price,
            close: price,
          };
        } else {
          // This tick belongs to the CURRENT candle, so we update it
          currentCandle.high = Math.max(currentCandle.high, price);
          currentCandle.low = Math.min(currentCandle.low, price);
          currentCandle.close = price;
        }
        
        // THIS IS THE MAGIC LINE:
        // `series.update()` is highly optimized to update the chart smoothly on every call.
        // This makes the last candle move with every tick.
        if (candlestickSeries.current) {
          candlestickSeries.current.update(currentCandle);
        }
      }
    };

    // --- Cleanup ---
    return () => {
      ws.close();
      if (chart.current) {
        chart.current.remove();
      }
    };
  }, []);

  return (
    // This div is the container where the chart will be rendered
    <div ref={chartContainerRef} className="w-full h-full" />
  );
};