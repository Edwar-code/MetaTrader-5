
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { time: '12 Aug 13:40', open: 3350.50, high: 3351.80, low: 3350.20, close: 3351.50 }, // Bullish
    { time: '12 Aug 13:46', open: 3351.50, high: 3352.00, low: 3349.50, close: 3349.80 }, // Bearish
    { time: '12 Aug 13:52', open: 3349.80, high: 3350.10, low: 3348.00, close: 3348.20 }, // Bearish
    { time: '12 Aug 13:58', open: 3348.20, high: 3349.00, low: 3347.50, close: 3348.80 }, // Bullish
    { time: '12 Aug 14:04', open: 3348.80, high: 3349.20, low: 3348.00, close: 3348.40 }, // Bearish
    { time: '12 Aug 14:10', open: 3348.40, high: 3348.90, low: 3347.00, close: 3347.20 }, // Bearish
    { time: '12 Aug 14:16', open: 3347.20, high: 3348.00, low: 3346.50, close: 3347.80 }, // Bullish
    { time: '12 Aug 14:22', open: 3347.80, high: 3348.10, low: 3347.00, close: 3347.20 }, // Bearish
    { time: '12 Aug 14:28', open: 3347.20, high: 3347.50, low: 3346.00, close: 3346.30 }, // Bearish
    { time: '12 Aug 14:34', open: 3346.30, high: 3346.80, low: 3345.50, close: 3345.80 }, // Bearish
    { time: '12 Aug 14:40', open: 3345.80, high: 3346.00, low: 3344.00, close: 3344.20 }, // Bearish
    { time: '12 Aug 14:46', open: 3344.20, high: 3345.50, low: 3342.50, close: 3345.00 }, // Bullish
    { time: '12 Aug 14:52', open: 3345.00, high: 3345.50, low: 3343.00, close: 3343.50 }, // Bearish
    { time: '12 Aug 14:58', open: 3343.50, high: 3344.00, low: 3342.00, close: 3343.80 }, // Bullish
    { time: '12 Aug 15:04', open: 3343.80, high: 3344.50, low: 3343.00, close: 3344.20 }, // Bullish
];

const Candlestick = (props: any) => {
  const { x, y, width, height, open, close, high, low } = props;
  const isBullish = close >= open;
  const color = isBullish ? '#00b179' : '#ff4040';

  // Calculate y-coordinates and heights based on price range
  const priceRange = Math.max(...data.map(d => d.high)) - Math.min(...data.map(d => d.low));
  const yRatio = height / (high - low);
  
  const bodyY = isBullish
    ? y + (high - close) * yRatio
    : y + (high - open) * yRatio;
  const bodyHeight = Math.max(1, Math.abs(open - close) * yRatio);
  
  return (
    <g stroke={color} fill={color} strokeWidth="1">
      {/* Wick */}
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} />
      
      {/* Body */}
      <rect x={x} y={bodyY} width={width} height={bodyHeight} />
    </g>
  );
};

export default function CandlestickChart() {
  const yMin = Math.min(...data.map(d => d.low)) - 2;
  const yMax = Math.max(...data.map(d => d.high)) + 2;
  const yDomain: [number, number] = [yMin, yMax];
  
  const interval = 0.45;
  const yTicks = [];
  for (let i = Math.floor(yMin / interval) * interval; i <= yMax; i += interval) {
      yTicks.push(i);
  }

  const xAxisData = data.filter((_, index) => index % 4 === 0).map(d => d.time);

  return (
    <ResponsiveContainer width="100%" height="100%">
       <BarChart
        barGap={4}
        barCategoryGap="20%"
        data={data}
        margin={{
          top: 5,
          right: 0,
          left: -10,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
          ticks={xAxisData}
        />
        <YAxis
          domain={yDomain}
          orientation="right"
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
          tickFormatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
          yAxisId="left"
          ticks={yTicks}
        />
        <Bar dataKey="close" shape={(props) => <Candlestick {...props} />} yAxisId="left">
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.close >= entry.open ? '#00b179' : '#ff4040'} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
