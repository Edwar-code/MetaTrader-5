
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { time: '12 Aug 09:00', open: 3343.50, high: 3345.00, low: 3342.50, close: 3344.00 },
    { time: '12 Aug 09:05', open: 3344.00, high: 3346.50, low: 3343.80, close: 3346.00 },
    { time: '12 Aug 09:10', open: 3346.00, high: 3348.90, low: 3345.50, close: 3348.20 },
    { time: '12 Aug 09:15', open: 3348.20, high: 3348.50, low: 3347.00, close: 3347.50 },
    { time: '12 Aug 09:20', open: 3347.50, high: 3348.00, low: 3345.00, close: 3345.50 },
    { time: '12 Aug 09:25', open: 3345.50, high: 3347.80, low: 3345.20, close: 3347.15 },
    { time: '12 Aug 09:31', open: 3347.15, high: 3347.85, low: 3346.00, close: 3346.50 },
    { time: '12 Aug 09:37', open: 3346.50, high: 3347.00, low: 3345.75, close: 3346.96 },
    { time: '12 Aug 09:43', open: 3346.96, high: 3347.20, low: 3345.50, close: 3345.80 },
    { time: '12 Aug 09:49', open: 3345.80, high: 3346.81, low: 3345.12, close: 3346.12 },
    { time: '12 Aug 09:55', open: 3346.12, high: 3346.52, low: 3344.00, close: 3344.50 },
];

const Candlestick = (props: any) => {
  const { x, y, width, height, open, close, high, low, fill } = props;
  const isBullish = close >= open;

  const yRatio = height / (high - low);
  const bodyHeight = Math.abs(open - close) * yRatio;
  const bodyY = isBullish
    ? y + (high - close) * yRatio
    : y + (high - open) * yRatio;

  return (
    <g stroke={isBullish ? '#00b179' : '#ff4040'} fill={isBullish ? '#00b179' : '#ff4040'} strokeWidth="1">
      {/* Wick */}
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} strokeWidth="1" />
      
      {/* Body */}
      <rect x={x} y={bodyY} width={width} height={bodyHeight} />
    </g>
  );
};

export default function CandlestickChart() {
  const yMin = Math.min(...data.map(d => d.low)) - 5;
  const yMax = Math.max(...data.map(d => d.high)) + 5;
  const yDomain: [number, number] = [yMin, yMax];
  
  const interval = 0.45;
  const yTicks = [];
  for (let i = Math.floor(yMin / interval) * interval; i <= yMax; i += interval) {
      yTicks.push(i);
  }

  const xAxisData = data.filter((_, index) => index % 3 === 0).map(d => d.time);

  return (
    <ResponsiveContainer width="100%" height="100%">
       <BarChart
        barGap={4}
        barCategoryGap="20%"
        data={data}
        margin={{
          top: 20,
          right: 0,
          left: -10,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
          axisLine={true} 
          tickLine={true} 
          ticks={xAxisData} 
          tickFormatter={(value) => value.replace(' ', '\n')}
        />
        <YAxis
          domain={yDomain}
          orientation="right"
          axisLine={false}
          tickLine={false}
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
