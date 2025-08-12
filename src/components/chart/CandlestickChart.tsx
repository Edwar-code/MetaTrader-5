// src/components/chart/CandlestickChart.tsx - FINAL DEBUGGED VERSION

'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const TWELVE_DATA_API_KEY = '0c28aa5d1ffe48eba7228111b65adb00';

type CandleData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

const Candlestick = (props: any) => {
  const { x, y, width, height, open, close, high, low, yDomain } = props;
  const isBullish = close >= open;
  const color = isBullish ? '#00b179' : '#ff4040';

  if (!yDomain || yDomain[1] - yDomain[0] === 0) return null;
  
  const priceRange = yDomain[1] - yDomain[0];
  const scale = height / priceRange;

  const bodyHeight = Math.max(1, Math.abs(open - close) * scale);
  const bodyY = isBullish ? y + (high - close) * scale : y + (high - open) * scale;
  
  return (
    <g stroke={color} fill={color} strokeWidth="1">
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} />
      <rect x={x} y={bodyY} width={width} height={bodyHeight} />
    </g>
  );
};

export default function CandlestickChart() {
  const [data, setData] = useState<CandleData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    console.log('Attempting to connect to WebSocket...');
    const ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${TWELVE_DATA_API_KEY}`);

    ws.onopen = () => {
      console.log('✅ WebSocket Connection Successful!');
      setConnectionStatus('Connected');
      ws.send(JSON.stringify({
        action: 'subscribe',
        params: { symbols: 'XAU/USD' },
      }));
    };

    ws.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      
      // =================================================================
      // DEBUGGING: Log every message from the server
      console.log('📩 Message received from server:', messageData);
      // =================================================================

      if (messageData.event === 'price') {
        const price = messageData.price;
        const time = Math.floor(messageData.timestamp / 1000);
        
        setData(currentData => {
            const lastCandle = currentData.length > 0 ? currentData[currentData.length - 1] : null;
            
            if (lastCandle && time < lastCandle.time + 60) {
                // IMMUTABLE UPDATE: Create a new object instead of modifying the old one
                const updatedCandle = {
                    ...lastCandle,
                    high: Math.max(lastCandle.high, price),
                    low: Math.min(lastCandle.low, price),
                    close: price,
                };
                return [...currentData.slice(0, -1), updatedCandle];
            } else {
                // Create a new candle
                const newCandle: CandleData = {
                    time: Math.floor(time / 60) * 60,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                };
                const updatedData = [...currentData, newCandle];
                return updatedData.slice(-100);
            }
        });
      }
    };

    ws.onclose = () => {
      console.log('❌ WebSocket Disconnected');
      setConnectionStatus('Disconnected');
    };
    ws.onerror = (error) => {
      console.error(' WebSocket Error:', error);
      setConnectionStatus('Connection Error');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const yMin = data.length > 0 ? Math.min(...data.map(d => d.low)) - 0.5 : 0;
  const yMax = data.length > 0 ? Math.max(...data.map(d => d.high)) + 0.5 : 1;
  const yDomain: [number, number] = [yMin, yMax];

  return (
    <>
      {/* ================================================================= */}
      {/* DEBUGGING: Display the connection status on the screen */}
      <div className="absolute top-2 right-2 z-20 text-xs px-2 py-1 rounded bg-gray-800 text-white">
        Status: {connectionStatus}
      </div>
      {/* ================================================================= */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          barGap={4}
          barCategoryGap="20%"
          data={data}
          margin={{ top: 5, right: 0, left: -10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={true} horizontal={true} />
          <XAxis 
            dataKey="time" 
            tickFormatter={(unixTime) => new Date(unixTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            tickCount={7}
            interval="preserveStart"
          />
          <YAxis
            domain={yDomain}
            orientation="right"
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
            tickFormatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
            yAxisId="left"
          />
          <Bar dataKey="close" shape={(props) => <Candlestick {...props} yDomain={yDomain} />} yAxisId="left">
              {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.close >= entry.open ? '#00b179' : '#ff4040'} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}