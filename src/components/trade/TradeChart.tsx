
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
    
    if ([x, y, width, height, open, close, high, low].some(p => p === undefined || !isFinite(p))) {
        return null;
    }

    const isUp = close >= open;
    const color = isUp ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';

    // This calculates the y-coordinate based on the price value within the candle's high-low range.
    const yRatio = (val: number) => {
      const priceRange = high - low;
      if (priceRange === 0) return y;
      return y + height - ((val - low) / priceRange) * height;
    };

    const bodyY = yRatio(Math.max(open, close));
    const bodyHeight = Math.max(1, Math.abs(yRatio(open) - yRatio(close)));

    return (
      <g stroke={color} fill={isUp ? color : 'none'} strokeWidth="1">
        {/* Wick */}
        <path d={`M${x + width / 2},${yRatio(high)} L${x + width / 2},${yRatio(low)}`} />
        {/* Body */}
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
            <AreaChart data={data} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
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

const LiveCandlestickChart = ({ data, yAxisDomain, markers }: { data: Candle[], yAxisDomain: (string|number)[], markers: ChartMarker[] }) => {
    const candleData = useMemo(() => (
      data.map(c => ({...c, range: [c.low, c.high]}))
    ), [data]);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={candleData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'HH:mm')} domain={['dataMin', 'dataMax']} type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={yAxisDomain} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDataOverflow={true} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(5) : ''} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="range" shape={<CandleStick />} isAnimationActive={false} barSize={6}>
                </Bar>
                {markers.map((m, i) => <ReferenceDot key={i} x={m.epoch} y={m.price} r={6} shape={<MarkerDot type={m.type} />} isFront={true} />)}
            </ComposedChart>
        </ResponsiveContainer>
    );
};
LiveCandlestickChart.displayName = 'LiveCandlestickChart';


export function TradeChart({ assetLabel, markers = [], staticData }: TradeChartProps) {
    const [chartMode, setChartMode] = useState('candle-1m');
    const [candles, setCandles] = useState<Candle[]>(staticData);
    const [ticks, setTicks] = useState<Tick[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { chartType, chartInterval } = useMemo(() => {
        const [type, interval] = chartMode.split('-');
        return { chartType: type, chartInterval: interval };
    }, [chartMode]);

    const intervalSeconds = useMemo(() => {
        if (chartInterval === '1m') return 60;
        return 0;
    }, [chartInterval]);

    useEffect(() => {
        if (chartMode.startsWith('candle')) {
            // Data is already initialized, no need to set it again here
        } else { // area-tick
            const lastStaticCandle = staticData[staticData.length - 1];
            if (lastStaticCandle) {
                 const initialTicks = Array.from({ length: 100 }).map((_, i) => ({
                    epoch: Math.floor(Date.now() / 1000) - 100 + i,
                    quote: lastStaticCandle.close + (Math.random() - 0.5) * (lastStaticCandle.close * 0.001)
                }));
                setTicks(initialTicks);
            }
        }
    }, [chartMode, staticData]);
    
    useEffect(() => {
        if (chartType !== 'candle' || intervalSeconds === 0) return;

        const candleIntervalId = setInterval(() => {
            setCandles(prevCandles => {
                if (prevCandles.length === 0) return [];
                
                const newCandles = [...prevCandles];
                let lastCandle = {...newCandles[newCandles.length - 1]};
                
                const now_epoch = Math.floor(Date.now() / 1000);

                if (now_epoch >= lastCandle.epoch + intervalSeconds) {
                    const newCandle: Candle = {
                        epoch: now_epoch - (now_epoch % intervalSeconds),
                        open: lastCandle.close,
                        high: lastCandle.close,
                        low: lastCandle.close,
                        close: lastCandle.close,
                    };
                    return [...prevCandles.slice(1), newCandle]; // Keep the array size constant
                } else {
                    const movement = (Math.random() - 0.5) * (lastCandle.open * 0.0001);
                    lastCandle.close += movement;
                    lastCandle.high = Math.max(lastCandle.high, lastCandle.close);
                    lastCandle.low = Math.min(lastCandle.low, lastCandle.close);
                    newCandles[newCandles.length - 1] = lastCandle;
                    return newCandles;
                }
            });
        }, 1000);

        return () => clearInterval(candleIntervalId);
    }, [chartType, intervalSeconds]);

     useEffect(() => {
        if (chartType !== 'area') return;

        const tickIntervalId = setInterval(() => {
            setTicks(prevTicks => {
                 if (prevTicks.length === 0) return [];
                 const lastTick = prevTicks[prevTicks.length - 1];
                 const newTick = {
                     epoch: Math.floor(Date.now() / 1000),
                     quote: lastTick.quote + (Math.random() - 0.5) * (lastTick.quote * 0.0001)
                 }
                 return [...prevTicks.slice(1), newTick];
            });
        }, 1000);

        return () => clearInterval(tickIntervalId);

    }, [chartType]);


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
        const dataSet = chartType === 'area' ? ticks.map(t => t.quote) : candles.flatMap(c => [c.low, c.high]);
        if (dataSet.length === 0) return ['auto', 'auto'];
        
        const validPrices = dataSet.filter(p => p != null && isFinite(p));
        if (validPrices.length === 0) return ['auto', 'auto'];

        const min = Math.min(...validPrices);
        const max = Math.max(...validPrices);
        const padding = (max - min) * 0.1 || 0.0001; 
        return [min - padding, max + padding];
    }, [candles, ticks, chartType]);

    const handleModeChange = useCallback((val: string) => {
        setIsLoading(true);
        setChartMode(val);
        // This timeout simulates a brief loading period, improving user experience.
        setTimeout(() => setIsLoading(false), 200);
    }, []);

    const renderChart = () => {
        if (isLoading) {
            return <Skeleton className="h-full w-full" />;
        }
        if (chartType === 'area') {
             if (ticks.length === 0) return <div className="flex items-center justify-center h-full text-muted-foreground">Generating tick data...</div>;
             return <LiveAreaChart data={ticks} isUp={isUp} yAxisDomain={yAxisDomain} markers={markers} />;
        }

        if (chartType === 'candle') {
            if (candles.length === 0) return <div className="flex items-center justify-center h-full text-muted-foreground">No candle data available.</div>;
            return <LiveCandlestickChart data={candles} yAxisDomain={yAxisDomain} markers={markers} />;
        }
        return <div className="flex items-center justify-center h-full text-muted-foreground">Select a chart type.</div>;
    }

    return (
        <Card className="h-full w-full flex flex-col bg-transparent border-0 shadow-none">
            <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between p-2 sm:p-4 z-10 shrink-0">
                <div>
                    <CardTitle className="font-headline text-sm sm:text-lg">{assetLabel}</CardTitle>
                </div>
                <div className="flex-1" />
                {!isLoading && (
                    <div className="text-right">
                        <p className={`text-lg sm:text-2xl font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>{lastPrice.toFixed(5)}</p>
                        <p className={`text-xs sm:text-sm font-mono ${isUp ? 'text-green-500' : 'text-red-500'}`}>{isUp ? '+' : ''}{priceChange.toFixed(5)}</p>
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    <Tabs value={chartMode} onValueChange={handleModeChange} className="w-auto">
                        <TabsList>
                             <TabsTrigger value="candle-1m">Candle 1m</TabsTrigger>
                             <TabsTrigger value="area-tick">Area Tick</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 w-full p-0">
               {renderChart()}
            </CardContent>
        </Card>
    );
}
