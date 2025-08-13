
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
    if (high === undefined || low === undefined || open === undefined || close === undefined || !isFinite(high) || !isFinite(low)) return null;

    if (high - low === 0) {
        const color = close >= open ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
        return <path d={`M${x},${y + height/2} L${x + width},${y + height/2}`} stroke={color} strokeWidth="1.5" />;
    }
    
    const isUp = close >= open;
    const color = isUp ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
    const bodyHeightRatio = Math.abs(open - close) / (high - low);
    const bodyHeight = isFinite(bodyHeightRatio) ? Math.max(1, bodyHeightRatio * height) : 1;
    
    const bodyY = isUp 
        ? y + height - ((close - low) / (high - low)) * height
        : y + height - ((open - low) / (high - low)) * height;

    return (
      <g stroke={color} fill={isUp ? color : 'none'} strokeWidth="1">
        <path d={`M${x + width / 2},${y} L${x + width / 2},${y + height}`} />
        <rect x={x} y={bodyY - bodyHeight} width={width} height={bodyHeight} fill={color} />
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
                <Bar dataKey="body" shape={<CandleStick />} isAnimationActive={false} barSize={6} />
                {markers.map((m, i) => <ReferenceDot key={i} x={m.epoch} y={m.price} r={6} shape={<MarkerDot type={m.type} />} isFront={true} />)}
            </ComposedChart>
        </ResponsiveContainer>
    );
};
LiveCandlestickChart.displayName = 'LiveCandlestickChart';


export function TradeChart({ assetLabel, markers = [], staticData }: TradeChartProps) {
    const [chartMode, setChartMode] = useState('candle-1m');
    const [candles, setCandles] = useState<Candle[]>([]);
    const [ticks, setTicks] = useState<Tick[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { chartType, chartInterval } = useMemo(() => {
        const [type, interval] = chartMode.split('-');
        return { chartType: type, chartInterval: interval };
    }, [chartMode]);

    const intervalSeconds = useMemo(() => {
        if (chartInterval === '1m') return 60;
        return 0; // For ticks, interval is managed differently
    }, [chartInterval]);

    useEffect(() => {
        setIsLoading(true);
        setCandles(staticData);
        setTicks([]); 
        const timer = setTimeout(() => setIsLoading(false), 500); 
        return () => clearTimeout(timer);
    }, [staticData, chartMode]);
    
    useEffect(() => {
        if (chartType !== 'candle' || isLoading || intervalSeconds === 0) {
            return;
        }

        const candleIntervalId = setInterval(() => {
            setCandles(prevCandles => {
                if (prevCandles.length === 0) {
                    return [];
                }

                const now_epoch = Math.floor(Date.now() / 1000);
                const lastCandle = prevCandles[prevCandles.length - 1];

                if (now_epoch >= lastCandle.epoch + intervalSeconds) {
                    // Time for a new candle
                    const newCandle: Candle = {
                        epoch: now_epoch - (now_epoch % intervalSeconds),
                        open: lastCandle.close,
                        high: lastCandle.close,
                        low: lastCandle.close,
                        close: lastCandle.close,
                    };
                    return [...prevCandles.slice(1), newCandle];
                } else {
                    // Update the current last candle
                    const newCandles = [...prevCandles];
                    const updatedLastCandle = { ...lastCandle };

                    const movement = (Math.random() - 0.5) * (updatedLastCandle.open * 0.0001);
                    updatedLastCandle.close += movement;
                    updatedLastCandle.high = Math.max(updatedLastCandle.high, updatedLastCandle.close);
                    updatedLastCandle.low = Math.min(updatedLastCandle.low, updatedLastCandle.close);

                    newCandles[newCandles.length - 1] = updatedLastCandle;
                    return newCandles;
                }
            });
        }, 1000);

        return () => clearInterval(candleIntervalId);
    }, [chartType, isLoading, intervalSeconds]);

     useEffect(() => {
        if (chartType !== 'area' || isLoading) {
            if (chartType !== 'area') setTicks([]);
            return;
        };

        if (ticks.length === 0 && candles.length > 0) {
            const lastCandle = candles[candles.length - 1];
            const initialTicks = Array.from({ length: 50 }).map((_, i) => ({
                epoch: Math.floor(Date.now() / 1000) - 50 + i,
                quote: lastCandle.close + (Math.random() - 0.5) * (lastCandle.close * 0.001)
            }));
            setTicks(initialTicks);
        }

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

    }, [chartType, isLoading, candles]);


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
        
        const prices = dataSet.flatMap((d: any) => d.quote !== undefined ? [d.quote] : [d.low, d.high]).filter(p => p && isFinite(p));
        if (prices.length === 0) return ['auto', 'auto'];

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const padding = (max - min) * 0.01 || 0.0001; 
        return [min - padding, max + padding];
    }, [candles, ticks, chartType]);

    const chartDataForCandle = useMemo(() => (
        candles.map(c => ({...c, body: [c.low, c.high]}))
    ), [candles]);

    const handleModeChange = useCallback((val: string) => {
        setIsLoading(true);
        setChartMode(val);
        setCandles(staticData); 
        setTimeout(() => setIsLoading(false), 500);
    }, [setChartMode, staticData]);

    const renderChart = () => {
        if (isLoading) {
            return <Skeleton className="h-full w-full" />;
        }
        if (chartType === 'area') {
             if (ticks.length === 0) return <div className="flex items-center justify-center h-full text-muted-foreground">Generating tick data...</div>;
             return <LiveAreaChart data={ticks} isUp={isUp} yAxisDomain={yAxisDomain} markers={markers} />;
        }

        if (chartType === 'candle') {
            if (chartDataForCandle.length === 0) return <div className="flex items-center justify-center h-full text-muted-foreground">No candle data available.</div>;
            return <LiveCandlestickChart data={chartDataForCandle} yAxisDomain={yAxisDomain} markers={markers} />;
        }
        return <div className="flex items-center justify-center h-full text-muted-foreground">Select a chart type.</div>;
    }

    return (
        <Card className="h-full w-full flex flex-col bg-transparent border-0 shadow-none">
            <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between p-2 sm:p-4 z-10 shrink-0">
                <div>
                    <CardTitle className="font-headline text-sm sm:text-lg">{assetLabel}</CardTitle>
                </div>
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
