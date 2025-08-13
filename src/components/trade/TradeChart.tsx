
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot, Label } from 'recharts';
import { Candle, Tick } from '@/context/DerivContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, fromUnixTime } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

export interface ChartMarker {
    epoch: number;
    price: number;
    type: 'entry' | 'win' | 'loss';
}

interface TradeChartProps {
    asset: string;
    assetLabel: string;
    markers?: ChartMarker[];
    chartInterval: string;
    setChartInterval: (interval: string) => void;
    chartType: string;
    setChartType: (type: string) => void;
    staticData?: Candle[];
}

const intervalMap: { [key: string]: number } = {
  '1m': 60, '5m': 300, '15m': 900,
  '1h': 3600, '1d': 86400,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const time = format(fromUnixTime(data.epoch), 'PPpp');

    return (
      <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-lg text-xs">
        <p>{time}</p>
        {data.quote !== undefined ? (
          <p>Price: <span className="font-bold">{data.quote.toFixed(5)}</span></p>
        ) : (
          <>
            <p>O: <span className="font-bold">{data.open.toFixed(5)}</span></p>
            <p>H: <span className="font-bold">{data.high.toFixed(5)}</span></p>
            <p>L: <span className="font-bold">{data.low.toFixed(5)}</span></p>
            <p>C: <span className="font-bold">{data.close.toFixed(5)}</span></p>
          </>
        )}
      </div>
    );
  }
  return null;
};
CustomTooltip.displayName = 'CustomTooltip';

const CandleStick = (props: any) => {
    const { x, y, width, height, open, close, high, low } = props;
    if (high === undefined || low === undefined || open === undefined || close === undefined || !isFinite(high) || !isFinite(low)) return null;

    const domain = high - low;
    const isUp = close >= open;
    const color = isUp ? '#22c55e' : '#ef4444';
    
    if (domain === 0) {
        return <path d={`M${x},${y + height/2} L${x + width},${y + height/2}`} stroke={color} strokeWidth="1.5" />;
    }
    
    const bodyHeightRatio = Math.abs(open - close) / domain;
    const bodyHeight = isFinite(bodyHeightRatio) ? Math.max(1, bodyHeightRatio * height) : 1;
    
    const bodyY = y + ((high - Math.max(open, close)) / domain) * height;

    return (
      <g stroke={color} fill={isUp ? color : 'none'} strokeWidth="1">
        <path d={`M${x + width / 2},${y} L${x + width / 2},${y + height}`} />
        <rect x={x} y={bodyY} width={width} height={bodyHeight} fill={color} />
      </g>
    );
};
CandleStick.displayName = 'CandleStick';


const MarkerDot = ({ cx, cy, payload, type }: any) => {
    const color = {
        entry: 'hsl(var(--accent-foreground))',
        win: '#22c55e',
        loss: '#ef4444',
    }[type];
    return <circle cx={cx} cy={cy} r={6} fill={color} stroke="hsl(var(--background))" strokeWidth={2} />;
};
MarkerDot.displayName = 'MarkerDot';


const LiveCandlestickChart = ({ data, yAxisDomain, markers }: { data: (Candle & {body: [number, number]})[], yAxisDomain: (string|number)[], markers?: ChartMarker[] }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 30, left: -10, bottom: 5 }} animationDuration={0}>
                <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'HH:mm')} domain={['dataMin', 'dataMax']} type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={yAxisDomain} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDataOverflow={true} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(2) : ''} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="body" shape={<CandleStick />} isAnimationActive={false} />
                {markers?.map((m, i) => <ReferenceDot key={i} x={m.epoch} y={m.price} r={6} shape={<MarkerDot type={m.type} />} isFront={true} />)}
            </ComposedChart>
        </ResponsiveContainer>
    );
};
LiveCandlestickChart.displayName = 'LiveCandlestickChart';


export function TradeChart({ asset, assetLabel, markers = [], chartInterval, setChartInterval, chartType, setChartType, staticData = [] }: TradeChartProps) {
    const [candles, setCandles] = useState<Candle[]>(staticData);
    const [chartError, setChartError] = useState<string | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Effect for simulating live data
    useEffect(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      const updateInterval = 1000; // Update every second for a fluid feel

      intervalRef.current = setInterval(() => {
          setCandles(prevCandles => {
            if (prevCandles.length === 0) return [];
            
            const lastCandle = prevCandles[prevCandles.length - 1];
            const now = Math.floor(Date.now() / 1000);
            const timeSinceLastCandle = now - lastCandle.epoch;
            const candleDuration = intervalMap[chartInterval] || 60;
            
            // If it's time for a new candle
            if (timeSinceLastCandle >= candleDuration) {
                const newCandle: Candle = {
                    epoch: lastCandle.epoch + candleDuration,
                    open: lastCandle.close,
                    close: lastCandle.close,
                    high: lastCandle.close,
                    low: lastCandle.close,
                };
                return [...prevCandles, newCandle].slice(-100);
            } else { // Otherwise, update the current candle
                const updatedCandles = [...prevCandles];
                const currentCandle = updatedCandles[updatedCandles.length - 1];
                const change = (Math.random() - 0.49) * 0.3; // Bias slightly upwards, smaller change
                currentCandle.close += change;
                currentCandle.high = Math.max(currentCandle.high, currentCandle.close);
                currentCandle.low = Math.min(currentCandle.low, currentCandle.close);
                return updatedCandles;
            }
          });
      }, updateInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [chartInterval, asset]);


    useEffect(() => {
      if (staticData.length === 0) {
        setChartError('Deriv API connection is offline.');
      } else {
        setChartError(null);
      }
    }, [staticData]);


    const { lastPrice, priceChange, isUp } = React.useMemo(() => {
        if (candles.length === 0) return { lastPrice: 0, priceChange: 0, isUp: true };
        const lastCandle = candles[candles.length - 1];
        return { lastPrice: lastCandle.close, priceChange: lastCandle.close - lastCandle.open, isUp: lastCandle.close >= lastCandle.open };
    }, [candles]);

    const yAxisDomain = React.useMemo((): [number, number] => {
        const dataSet = candles;
        if (!dataSet || dataSet.length === 0) return [0,0];

        const pricesFromData = dataSet.flatMap((d: any) => [d.low, d.high]);
        const finitePrices = pricesFromData.filter(p => isFinite(p));

        if (finitePrices.length === 0) return [0,0];
        
        const min = Math.min(...finitePrices);
        const max = Math.max(...finitePrices);
        const padding = (max - min) * 0.1 || 0.1;

        return [min - padding, max + padding];
    }, [candles]);

    const chartDataForCandle = React.useMemo(() => (
        candles.map(c => ({...c, body: [c.low, c.high]}))
    ), [candles]);


    const showLoader = (candles.length === 0 && !chartError);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                    <CardTitle className="font-headline">{assetLabel}</CardTitle>
                </div>
                {(candles.length > 0) && !chartError && (
                    <div className="text-right">
                        <p className={`text-2xl font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>{lastPrice.toFixed(5)}</p>
                        <p className={`text-sm font-mono ${isUp ? 'text-green-500' : 'text-red-500'}`}>{isUp ? '+' : ''}{priceChange.toFixed(5)}</p>
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    <Tabs value={chartType} onValueChange={setChartType} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="candle">Candle</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Tabs value={chartInterval} onValueChange={(val) => {
                        setCandles(staticData); // reload static candles
                        setChartInterval(val);
                    }} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="1m">1m</TabsTrigger>
                            <TabsTrigger value="5m">5m</TabsTrigger>
                            <TabsTrigger value="1h">1h</TabsTrigger>
                            <TabsTrigger value="1d">1d</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 w-full relative">
                <div className="h-full w-full">
                    {chartError ? (
                        <div className="flex items-center justify-center h-full text-destructive flex-col gap-2 p-4 text-center">
                            <AlertTriangle className="h-8 w-8" />
                            <p className="font-semibold">Chart Unavailable</p>
                            <p className="text-sm text-muted-foreground">{chartError}</p>
                        </div>
                    ) : showLoader ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground flex-col">
                            <Skeleton className="h-full w-full absolute" />
                            <p className="z-10">{ 'Loading chart data...' }</p>
                        </div>
                    ) : (
                       <LiveCandlestickChart data={chartDataForCandle} yAxisDomain={yAxisDomain} markers={markers} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
