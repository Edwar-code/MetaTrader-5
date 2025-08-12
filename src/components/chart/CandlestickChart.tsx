
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '10:00', open: 100, high: 105, low: 95, close: 102 },
  { time: '10:05', open: 102, high: 108, low: 100, close: 107 },
  { time: '10:10', open: 107, high: 110, low: 105, close: 109 },
  { time: '10:15', open: 109, high: 112, low: 108, close: 110 },
  { time: '10:20', open: 110, high: 115, low: 109, close: 113 },
  { time: '10:25', open: 113, high: 114, low: 111, close: 112 },
  { time: '10:30', open: 112, high: 118, low: 112, close: 117 },
  { time: '10:35', open: 117, high: 120, low: 115, close: 118 },
  { time: '10:40', open: 118, high: 122, low: 117, close: 120 },
  { time: '10:45', open: 120, high: 121, low: 118, close: 119 },
];

export default function CandlestickChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
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
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Bar dataKey="close" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
