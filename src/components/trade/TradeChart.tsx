
'use client';

import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Label, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot } from 'recharts';
import { useDerivState, useDerivChart, Candle, Tick } from '@/context/DerivContext';
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
    if (high - low === 0) {
        // This is a doji candle or a flat line. Draw a simple horizontal line for the body.
        const color = close >= open ? '#22c55e' : '#ef4444';
        return (
             <path d={`M${x},${y + height/2} L${x + width},${y + height/2}`} stroke={color} strokeWidth="1.5" />
        );
    }
    
    const isUp = close >= open;
    const color = isUp ? '#22c55e' : '#ef4444';

    // The ratio of the body height to the total candle height (wick to wick)
    const bodyHeightRatio = Math.abs(open - close) / (high - low);
    // The actual pixel height of the candle body, with a minimum of 1px to be visible
    const bodyHeight = isFinite(bodyHeightRatio) ? Math.max(1, bodyHeightRatio * height) : 1;
    
    // Calculate the Y position of the top of the candle body
    // 'y' from props is the top of the whole candle area (top of the high wick)
    // We calculate the position based on whether the candle is up or down
    const bodyY = y + (isUp 
        ? height - ((close - low) / (high - low)) * height // Position for up candle
        : height - ((open - low) / (high - low)) * height) // Position for down candle
        - bodyHeight;

    return (
      <g stroke={color} fill={isUp ? color : 'none'} strokeWidth="1">
        {/* This path draws the wicks */}
        <path d={`M${x + width / 2},${y} L${x + width / 2},${y + height}`} />
        {/* This rect draws the body */}
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
                      value={String(lastTick.quote).slice(-1)}
                      position="right"
                      offset={10}
                      fontSize="14"
                      fontWeight="bold"
                      fill="hsl(var(--foreground))"
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
            <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} animationDuration={0}>
                <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'dd MMM HH:mm')} domain={['dataMin', 'dataMax']} type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={yAxisDomain} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDataOverflow={true} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(5) : ''} />
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
    const { connectionState, isAuthenticated, chartError: liveChartError } = useDerivState();
    
    // Local state for chart data, initialized with staticData
    const [ticks, setTicks] = useState<Tick[]>([]);
    const [candles, setCandles] = useState<Candle[]>(staticData);
    const [chartError, setChartError] = useState<string | null>(null);

    // This effect now primarily manages errors from the live context
    useEffect(() => {
        if (liveChartError) {
            setChartError(liveChartError);
        } else {
            setChartError(null);
        }
    }, [liveChartError]);

    // This effect handles switching to static data if the connection fails,
    // but primarily we are now driving the chart from static data passed via props.
    useEffect(() => {
        if (connectionState !== 'connected' && staticData.length > 0) {
            setCandles(staticData);
            setTicks([]); // Clear ticks if we're using static candle data
        }
    }, [connectionState, staticData]);


    const { lastPrice, priceChange, isUp } = React.useMemo(() => {
        const data = chartInterval === 'tick' ? ticks : candles;
        if (data.length === 0) return { lastPrice: 0, priceChange: 0, isUp: true };

        if (chartInterval === 'tick' && ticks.length > 0) {
            const last = ticks[ticks.length - 1].quote;
            const secondLast = ticks.length > 1 ? ticks[ticks.length - 2].quote : last;
            return { lastPrice: last, priceChange: last - secondLast, isUp: last >= secondLast };
        } else if (chartInterval !== 'tick' && candles.length > 0) {
            const lastCandle = candles[candles.length - 1];
            return { lastPrice: lastCandle.close, priceChange: lastCandle.close - lastCandle.open, isUp: lastCandle.close >= lastCandle.open };
        }
        return { lastPrice: 0, priceChange: 0, isUp: true };
    }, [ticks, candles, chartInterval]);

    const yAxisDomain = React.useMemo(() => {
        const dataSet = chartInterval === 'tick' ? ticks : candles;
        if (!dataSet || dataSet.length === 0) return ['auto', 'auto'];

        const pricesFromData = dataSet.flatMap((d: any) => d.quote !== undefined ? [d.quote] : [d.low, d.high]);
        const finitePrices = pricesFromData.filter(p => isFinite(p));

        if (finitePrices.length === 0) return ['auto', 'auto'];
        
        const min = Math.min(...finitePrices);
        const max = Math.max(...finitePrices);
        const padding = (max - min) * 0.05 || 0.0001; 

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
                          setCandles([]);
                          // In a real scenario, you might fetch tick data here.
                          // For now, we'll just switch and it might show 'no data' if no live ticks.
                        } else {
                          setCandles(staticData); // reload static candles
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
