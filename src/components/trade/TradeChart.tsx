
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

    // FIX: Handle division by zero when price doesn't move.
    const domain = high - low;
    if (domain === 0) {
        const color = close >= open ? '#22c55e' : '#ef4444';
        return <path d={`M${x},${y + height/2} L${x + width},${y + height/2}`} stroke={color} strokeWidth="1.5" />;
    }
    
    const isUp = close >= open;
    const color = isUp ? '#22c55e' : '#ef4444';

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


const LiveAreaChart = ({ data, isUp, yAxisDomain, markers }: { data: Tick[], isUp: boolean, yAxisDomain: (string|number)[], markers?: ChartMarker[] }) => {
    const lastTick = data.length > 0 ? data[data.length - 1] : null;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: -10, bottom: 5 }} animationDuration={0}>
            <defs>
                <linearGradient id="chartGradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'HH:mm:ss')} domain={['dataMin', 'dataMax']} type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={yAxisDomain} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDataOverflow={true} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(5) : ''} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="quote" stroke={isUp ? "#22c55e" : "#ef4444"} fillOpacity={1} fill="url(#chartGradientArea)" strokeWidth={2} dot={false} isAnimationActive={false}>
              {lastTick && (
                  <Label
                      value={String(lastTick.quote.toFixed(2)).slice(-3)}
                      position="right"
                      offset={10}
                      fontSize="14"
                      fontWeight="bold"
                      fill={isUp ? "text-green-500" : "text-red-500"}
                      style={{ pointerEvents: 'none' }}
                  />
              )}
            </Area>
            {markers?.map((m, i) => <ReferenceDot key={i} x={m.epoch} y={m.price} r={6} shape={<MarkerDot type={m.type} />} isFront={true} />)}
            </AreaChart>
        </ResponsiveContainer>
    );
};
LiveAreaChart.displayName = 'LiveAreaChart';

const LiveCandlestickChart = ({ data, yAxisDomain, markers }: { data: (Candle & {body: [number, number]})[], yAxisDomain: (string|number)[], markers?: ChartMarker[] }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 30, left: -10, bottom: 5 }} animationDuration={0}>
                <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'dd MMM HH:mm')} domain={['dataMin', 'dataMax']} type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
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
    const [ticks, setTicks] = useState<Tick[]>([]);
    const [candles, setCandles] = useState<Candle[]>(staticData);
    const [chartError, setChartError] = useState<string | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Effect for simulating live data
    useEffect(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      const isTick = chartInterval === 'tick';
      const updateInterval = 1000; // Update every second for a fluid feel

      intervalRef.current = setInterval(() => {
        if (isTick) {
          setTicks(prevTicks => {
            if(prevTicks.length === 0) return [];
            const lastTick = prevTicks[prevTicks.length - 1];
            const change = (Math.random() - 0.5) * 0.2; // Smaller, more realistic tick changes
            const newTick: Tick = {
              epoch: Math.floor(Date.now() / 1000),
              quote: lastTick.quote + change,
              symbol: asset,
            };
            return [...prevTicks, newTick].slice(-200);
          });
        } else {
          setCandles(prevCandles => {
            if (prevCandles.length === 0) return [];
            
            const lastCandle = prevCandles[prevCandles.length - 1];
            const timeSinceLastCandle = (Date.now() / 1000) - lastCandle.epoch;
            const candleDuration = intervalMap[chartInterval] || 60;
            
            // If it's time for a new candle
            if (timeSinceLastCandle > candleDuration) {
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
        }
      }, updateInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [chartInterval, asset]);


    // This effect now primarily manages errors from the live context
    useEffect(() => {
      // Only show an error if we don't have static data to display
      const chartHasData = ticks.length > 0 || candles.length > 0;
      if (!chartHasData && staticData.length === 0) {
        setChartError('Deriv API connection is offline.');
      } else {
        setChartError(null);
      }
    }, [ticks, candles, staticData]);


    const { lastPrice, priceChange, isUp } = React.useMemo(() => {
        if (chartInterval === 'tick') {
            if (ticks.length < 2) return { lastPrice: 0, priceChange: 0, isUp: true };
            const last = ticks[ticks.length - 1].quote;
            const secondLast = ticks[ticks.length - 2].quote;
            return { lastPrice: last, priceChange: last - secondLast, isUp: last >= secondLast };
        } else {
            if (candles.length === 0) return { lastPrice: 0, priceChange: 0, isUp: true };
            const lastCandle = candles[candles.length - 1];
            return { lastPrice: lastCandle.close, priceChange: lastCandle.close - lastCandle.open, isUp: lastCandle.close >= lastCandle.open };
        }
    }, [ticks, candles, chartInterval]);

    const yAxisDomain = React.useMemo((): [number, number] => {
        const dataSet = chartInterval === 'tick' ? ticks : candles;
        if (!dataSet || dataSet.length === 0) return [0,0];

        const pricesFromData = dataSet.flatMap((d: any) => d.quote !== undefined ? [d.quote] : [d.low, d.high]);
        const finitePrices = pricesFromData.filter(p => isFinite(p));

        if (finitePrices.length === 0) return [0,0];
        
        const min = Math.min(...finitePrices);
        const max = Math.max(...finitePrices);
        const padding = (max - min) * 0.1 || 0.1; // Increased padding

        return [min - padding, max + padding];
    }, [ticks, candles, chartInterval]);

    const chartDataForCandle = React.useMemo(() => (
        candles.map(c => ({...c, body: [c.low, c.high]}))
    ), [candles]);


    const showLoader = (ticks.length === 0 && candles.length === 0 && !chartError);
    const isTickChart = chartInterval === 'tick';

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                    <CardTitle className="font-headline">{assetLabel}</CardTitle>
                </div>
                {(ticks.length > 0 || candles.length > 0) && !chartError && (
                    <div className="text-right">
                        <p className={`text-2xl font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>{lastPrice.toFixed(5)}</p>
                        <p className={`text-sm font-mono ${isUp ? 'text-green-500' : 'text-red-500'}`}>{isUp ? '+' : ''}{priceChange.toFixed(5)}</p>
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    <Tabs value={chartType} onValueChange={setChartType} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="area" disabled={chartType !== 'area' && chartInterval !== 'tick'}>Area</TabsTrigger>
                            <TabsTrigger value="candle" disabled={isTickChart}>Candle</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Tabs value={chartInterval} onValueChange={(val) => {
                        if (val === 'tick') {
                          setChartType('area');
                          setCandles([]); // Clear candles
                           // Seed with some initial ticks if empty
                          if(ticks.length === 0) {
                            setTicks(staticData.slice(-50).map(c => ({ epoch: c.epoch, quote: c.close, symbol: asset })));
                          }
                        } else {
                          setChartType('candle');
                          setCandles(staticData); // reload static candles
                          setTicks([]); // Clear ticks
                        }
                        setChartInterval(val);
                    }} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="tick">Tick</TabsTrigger>
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
                        (chartType === 'area' || isTickChart) && ticks.length > 0
                        ? <LiveAreaChart data={ticks} isUp={isUp} yAxisDomain={yAxisDomain} markers={markers} />
                        : <LiveCandlestickChart data={chartDataForCandle} yAxisDomain={yAxisDomain} markers={markers} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

    