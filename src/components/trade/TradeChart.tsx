
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, fromUnixTime } from 'date-fns';

export interface Candle {
    epoch: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface Tick {
    epoch: number;
    quote: number;
}

export interface ChartMarker {
    epoch: number;
    price: number;
    type: 'entry' | 'win' | 'loss';
}

interface TradeChartProps {
    assetLabel: string;
    markers?: ChartMarker[];
    chartInterval: string;
    setChartInterval: (interval: string) => void;
    chartType: string;
    setChartType: (type: string) => void;
    staticData: Candle[];
}

const CustomTooltip = ({ active, payload }: any) => {
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

    if (high - low === 0) {
        const color = close >= open ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
        return <path d={`M${x},${y + height/2} L${x + width},${y + height/2}`} stroke={color} strokeWidth="1.5" />;
    }
    
    const isUp = close >= open;
    const color = isUp ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
    const bodyHeightRatio = Math.abs(open - close) / (high - low);
    const bodyHeight = isFinite(bodyHeightRatio) ? Math.max(1, bodyHeightRatio * height) : 1;
    const bodyY = y + (isUp ? height - ((close - low) / (high - low)) * height : height - ((open - low) / (high - low)) * height) - bodyHeight;

    return (
      <g stroke={color} fill={isUp ? color : 'none'} strokeWidth="1">
        <path d={`M${x + width / 2},${y} L${x + width / 2},${y + height}`} />
        <rect x={x} y={bodyY} width={width} height={bodyHeight} fill={color} />
      </g>
    );
};
CandleStick.displayName = 'CandleStick';

const MarkerDot = ({ type }: any) => {
    const color = {
        entry: 'hsl(var(--accent-foreground))',
        win: 'hsl(var(--chart-2))',
        loss: 'hsl(var(--destructive))',
    }[type];
    return <circle r={6} fill={color} stroke="hsl(var(--background))" strokeWidth={2} />;
};
MarkerDot.displayName = 'MarkerDot';

const LiveAreaChart = ({ data, isUp, yAxisDomain, markers }: { data: Tick[], isUp: boolean, yAxisDomain: (string|number)[], markers: ChartMarker[] }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: -10, bottom: 5 }} animationDuration={0}>
            <defs>
                <linearGradient id="chartGradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={isUp ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'HH:mm:ss')} domain={['dataMin', 'dataMax']} type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={yAxisDomain} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDataOverflow={true} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(5) : ''} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="quote" stroke={isUp ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"} fillOpacity={1} fill="url(#chartGradientArea)" strokeWidth={2} dot={false} isAnimationActive={false} />
            {markers.map((m, i) => <ReferenceDot key={i} x={m.epoch} y={m.price} r={6} shape={<MarkerDot type={m.type} />} isFront={true} />)}
            </AreaChart>
        </ResponsiveContainer>
    );
};
LiveAreaChart.displayName = 'LiveAreaChart';

const LiveCandlestickChart = ({ data, yAxisDomain, markers }: { data: (Candle & {body: [number, number]})[], yAxisDomain: (string|number)[], markers: ChartMarker[] }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} animationDuration={0}>
                <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'HH:mm')} domain={['dataMin', 'dataMax']} type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={yAxisDomain} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDataOverflow={true} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(5) : ''} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="body" shape={<CandleStick />} isAnimationActive={false} />
                {markers.map((m, i) => <ReferenceDot key={i} x={m.epoch} y={m.price} r={6} shape={<MarkerDot type={m.type} />} isFront={true} />)}
            </ComposedChart>
        </ResponsiveContainer>
    );
};
LiveCandlestickChart.displayName = 'LiveCandlestickChart';


export function TradeChart({ assetLabel, markers = [], chartInterval, setChartInterval, chartType, setChartType, staticData }: TradeChartProps) {
    const [candles, setCandles] = useState<Candle[]>(staticData);
    const [ticks, setTicks] = useState<Tick[]>([]);

    const intervalSeconds = useMemo(() => {
        const match = chartInterval.match(/(\d+)(\w)/);
        if (!match) return 60;
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'm') return value * 60;
        if (unit === 'h') return value * 3600;
        if (unit === 'd') return value * 86400;
        return 60;
    }, [chartInterval]);

    useEffect(() => {
        setCandles(staticData);
    }, [staticData]);
    
    // Candle Simulation
    useEffect(() => {
        const simulateCandleMove = () => {
            setCandles(prevCandles => {
                if (prevCandles.length === 0) return [];
                const newCandles = [...prevCandles];
                const lastCandle = { ...newCandles[newCandles.length - 1] };
                const now_epoch = Math.floor(Date.now() / 1000);
                
                if (now_epoch - lastCandle.epoch >= intervalSeconds) {
                    const newPrice = lastCandle.close;
                    const newCandle: Candle = {
                        epoch: now_epoch - (now_epoch % intervalSeconds),
                        open: newPrice,
                        high: newPrice,
                        low: newPrice,
                        close: newPrice,
                    };
                    return [...newCandles.slice(1), newCandle];
                } else {
                    const movement = (Math.random() - 0.5) * (lastCandle.open * 0.0002);
                    lastCandle.close += movement;
                    lastCandle.high = Math.max(lastCandle.high, lastCandle.close);
                    lastCandle.low = Math.min(lastCandle.low, lastCandle.close);
                    newCandles[newCandles.length - 1] = lastCandle;
                    return newCandles;
                }
            });
        };

        const candleIntervalId = setInterval(simulateCandleMove, 1000);
        return () => clearInterval(candleIntervalId);
    }, [intervalSeconds]);

    // Tick Simulation
     useEffect(() => {
        if (chartType !== 'area') {
            setTicks([]);
            return;
        };

        const lastCandle = candles[candles.length - 1];
        if (!lastCandle) return;

        // Initialize ticks
        const initialTicks = Array.from({ length: 50 }).map((_, i) => ({
            epoch: Math.floor(Date.now() / 1000) - 50 + i,
            quote: lastCandle.close + (Math.random() - 0.5) * (lastCandle.close * 0.001)
        }));
        setTicks(initialTicks);

        const simulateTickMove = () => {
            setTicks(prevTicks => {
                 if (prevTicks.length === 0) return [];
                 const lastTick = prevTicks[prevTicks.length - 1];
                 const newPrice = lastTick.quote + (Math.random() - 0.5) * (lastTick.quote * 0.0001);
                 const newTick = {
                     epoch: Math.floor(Date.now() / 1000),
                     quote: newPrice
                 }
                 return [...prevTicks.slice(1), newTick];
            });
        };

        const tickIntervalId = setInterval(simulateTickMove, 1000);
        return () => clearInterval(tickIntervalId);

    }, [chartType, candles]);


    const { lastPrice, priceChange, isUp } = useMemo(() => {
        if (chartType === 'area') {
            if (ticks.length < 2) return { lastPrice: 0, priceChange: 0, isUp: true };
            const last = ticks[ticks.length - 1].quote;
            const secondLast = ticks[ticks.length - 2].quote;
            return { lastPrice: last, priceChange: last - secondLast, isUp: last >= secondLast };
        }
        
        if (candles.length === 0) return { lastPrice: 0, priceChange: 0, isUp: true };
        const lastCandle = candles[candles.length - 1];
        return { lastPrice: lastCandle.close, priceChange: lastCandle.close - lastCandle.open, isUp: lastCandle.close >= lastCandle.open };
    }, [candles, ticks, chartType]);

    const yAxisDomain = useMemo(() => {
        const dataSet = chartType === 'area' ? ticks : candles;
        if (!dataSet || dataSet.length === 0) return ['auto', 'auto'];
        
        const prices = dataSet.flatMap((d: any) => d.quote !== undefined ? [d.quote] : [d.low, d.high]);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const padding = (max - min) * 0.1 || 0.0001; 
        return [min - padding, max + padding];
    }, [candles, ticks, chartType]);

    const chartDataForCandle = useMemo(() => (
        candles.map(c => ({...c, body: [c.low, c.high]}))
    ), [candles]);

    const handleIntervalChange = useCallback((val: string) => {
        setChartInterval(val);
        setCandles(staticData); // Reset on interval change
    }, [setChartInterval, staticData]);

    const showLoader = (chartType === 'candle' && candles.length === 0) || (chartType === 'area' && ticks.length === 0);

    return (
        <Card className="h-full flex flex-col bg-transparent border-0 shadow-none">
            <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between absolute top-14 left-0 right-0 z-10 p-2 sm:p-4">
                <div className="flex-1">
                    <CardTitle className="font-headline text-sm sm:text-lg">{assetLabel}</CardTitle>
                </div>
                {!showLoader && (
                    <div className="text-right">
                        <p className={`text-lg sm:text-2xl font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>{lastPrice.toFixed(5)}</p>
                        <p className={`text-xs sm:text-sm font-mono ${isUp ? 'text-green-500' : 'text-red-500'}`}>{isUp ? '+' : ''}{priceChange.toFixed(5)}</p>
                    </div>
                )}
                <div className="hidden sm:flex flex-wrap gap-2">
                    <Tabs value={chartType} onValueChange={(val) => {
                        if (val === 'candle' && chartInterval === 'tick') {
                            setChartInterval('1m');
                        }
                        setChartType(val);
                    }} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="area">Area</TabsTrigger>
                            <TabsTrigger value="candle">Candle</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Tabs value={chartInterval} onValueChange={handleIntervalChange} className="w-auto">
                        <TabsList>
                             {chartType === 'area' && <TabsTrigger value="tick">Tick</TabsTrigger>}
                             <TabsTrigger value="1m">1m</TabsTrigger>
                             <TabsTrigger value="5m">5m</TabsTrigger>
                             <TabsTrigger value="15m">15m</TabsTrigger>
                             <TabsTrigger value="1h">1h</TabsTrigger>
                             <TabsTrigger value="1d">1d</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 w-full relative p-0 pt-28 sm:pt-24">
                <div className="h-full w-full">
                    {showLoader ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground flex-col">
                            <Skeleton className="h-full w-full absolute" />
                            <p className="z-10">Loading chart data...</p>
                        </div>
                    ) : (
                        chartType === 'area'
                        ? <LiveAreaChart data={ticks} isUp={isUp} yAxisDomain={yAxisDomain} markers={markers} />
                        : <LiveCandlestickChart data={chartDataForCandle} yAxisDomain={yAxisDomain} markers={markers} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
