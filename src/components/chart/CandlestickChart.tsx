
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { time: '10:00', open: 3343.50, high: 3345.00, low: 3342.50, close: 3344.00 },
    { time: '10:05', open: 3344.00, high: 3346.50, low: 3343.80, close: 3346.00 },
    { time: '10:10', open: 3346.00, high: 3348.90, low: 3345.50, close: 3348.20 },
    { time: '10:15', open: 3348.20, high: 3348.50, low: 3347.00, close: 3347.50 },
    { time: '10:20', open: 3347.50, high: 3348.00, low: 3345.00, close: 3345.50 },
    { time: '10:25', open: 3345.50, high: 3347.80, low: 3345.20, close: 3347.15 },
    { time: '10:30', open: 3347.15, high: 3347.85, low: 3346.00, close: 3346.50 },
    { time: '10:35', open: 3346.50, high: 3347.00, low: 3345.75, close: 3346.96 },
    { time: '10:40', open: 3346.96, high: 3347.20, low: 3345.50, close: 3345.80 },
    { time: '10:45', open: 3345.80, high: 3346.81, low: 3345.12, close: 3346.12 },
    { time: '10:50', open: 3346.12, high: 3346.52, low: 3344.00, close: 3344.50 },
];

const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;

  const isBullish = close >= open;
  const fill = isBullish ? '#00b179' : '#ff4040';
  const wickStroke = '#a7a7a7';

  const bodyY = isBullish ? y + height : y;
  const bodyHeight = height;

  return (
    <g stroke={wickStroke} strokeWidth="1">
      {/* Wick */}
      <path d={`M ${x + width / 2} ${y} L ${x + width / 2} ${y - (high - Math.max(open, close))}`} />
      <path d={`M ${x + width / 2} ${y + height} L ${x + width / 2} ${y + height + (Math.min(open, close) - low)}`} />
      
      {/* Body */}
      <rect x={x} y={bodyY} width={width} height={bodyHeight} fill={fill} />
    </g>
  );
};


export default function CandlestickChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
       <BarChart
        barGap={2}
        barCategoryGap="20%"
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: -10,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
        <YAxis
          domain={['dataMin - 1', 'dataMax + 1']}
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickFormatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: any, name: any, props: any) => {
            const { open, high, low, close } = props.payload;
            return [
              `Open: ${open}`,
              `High: ${high}`,
              `Low: ${low}`,
              `Close: ${close}`,
            ].join('\n');
          }}
        />
        <Bar dataKey="close" shape={<Candlestick />}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.close >= entry.open ? '#00b179' : '#ff4040'} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
