
'use client';

import React, { useEffect } from 'react';
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot, ReferenceLine } from 'recharts';
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
}

const intervalMap: { [key: string]: number } = {
  '1m': 60, '5m': 300, '15m': 900,
  '1h': 3600, '1d': 86400,
};

// Heikin-Ashi calculation logic
const calculateHeikinAshi = (candles: Candle[]): Candle[] => {
    if (!candles || candles.length === 0) return [];

    return candles.reduce((acc: Candle[], candle, i) => {
        const prev = i > 0 ? acc[i - 1] : null;
        const ohlc = candle;

        const haClose = (ohlc.open + ohlc.high + ohlc.low + ohlc.close) / 4;
        const haOpen = prev ? (prev.open + prev.close) / 2 : (ohlc.open + ohlc.close) / 2;
        const haHigh = Math.max(ohlc.high, haOpen, haClose);
        const haLow = Math.min(ohlc.low, haOpen, haClose);

        acc.push({
            epoch: ohlc.epoch,
            open: haOpen,
            high: haHigh,
            low: haLow,
            close: haClose,
        });
        return acc;
    }, []);
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

const HeikinAshiCandleStick = (props: any) => {
    const { x, y, width, height, open, close, high, low } = props;
    if ([x, y, width, height, open, close, high, low].some(v => v === undefined || !isFinite(v))) return null;

    const isUp = close >= open;
    const color = isUp ? '#22c55e' : '#ef4444';
    
    // Y position of the body
    const yBody = isUp ? y + (high - close) / (high-low) * height : y + (high - open) / (high - low) * height;
    // Height of the body
    const bodyHeight = Math.max(1, Math.abs(open - close) / (high - low) * height);

    return (
        <g stroke={color} fill={color} strokeWidth="1">
            {/* Wick */}
            <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} />
            {/* Body */}
            <rect x={x} y={yBody} width={width} height={bodyHeight} />
        </g>
    );
};
HeikinAshiCandleStick.displayName = 'HeikinAshiCandleStick';


const MarkerDot = ({ cx, cy, payload, type }: any) => {
    const color = {
        entry: 'hsl(var(--accent-foreground))',
        win: '#22c55e',
        loss: '#ef4444',
    }[type];
    return <circle cx={cx} cy={cy} r={6} fill={color} stroke="hsl(var(--background))" strokeWidth={2} />;
};
MarkerDot.displayName = 'MarkerDot';


const YAxisLabel = ({ viewBox, value }: any) => {
    if (!viewBox || value === undefined) return null;
    const { y, width } = viewBox;
    return (
      <g>
        <foreignObject x={width} y={y - 10} width="60" height="20" className="overflow-visible">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="w-full h-full text-xs flex items-center justify-center rounded-sm text-black bg-transparent"
          >
            {value.toFixed(5)}
          </div>
        </foreignObject>
      </g>
    );
  };
YAxisLabel.displayName = 'YAxisLabel';

const LiveAreaChart = ({ data, isUp, yAxisDomain, markers }: { data: Tick[], isUp: boolean, yAxisDomain: (string|number)[], markers: ChartMarker[] }) => {
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
            <Area type="monotone" dataKey="quote" stroke={isUp ? "#22c55e" : "#ef4444"} fillOpacity={1} fill="url(#chartGradientArea)" strokeWidth={2} dot={false} isAnimationActive={false} />
            {markers.map((m, i) => <ReferenceDot key={i} x={m.epoch} y={m.price} r={6} shape={<MarkerDot type={m.type} />} isFront={true} />)}
            {lastTick && (
                <ReferenceLine 
                    y={lastTick.quote} 
                    stroke="black" 
                    strokeWidth={1} 
                    strokeDasharray="3 3"
                    label={<YAxisLabel value={lastTick.quote} />}
                />
            )}
            </AreaChart>
        </ResponsiveContainer>
    );
};
LiveAreaChart.displayName = 'LiveAreaChart';

const LiveCandlestickChart = ({ data, isUp, lastPrice, yAxisDomain, markers }: { data: (Candle & {body: [number, number]})[], isUp: boolean, lastPrice: number, yAxisDomain: (string|number)[], markers: ChartMarker[] }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} animationDuration={0}>
                <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'dd MMM HH:mm')} domain={['dataMin', 'dataMax']} type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={yAxisDomain} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDataOverflow={true} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(5) : ''} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="body" shape={<HeikinAshiCandleStick />} isAnimationActive={false} barSize={6} />
                {markers.map((m, i) => <ReferenceDot key={i} x={m.epoch} y={m.price} r={6} shape={<MarkerDot type={m.type} />} isFront={true} />)}
                {lastPrice > 0 && (
                     <ReferenceLine 
                        y={lastPrice} 
                        stroke="black" 
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        label={<YAxisLabel value={lastPrice}/>}
                    />
                )}
            </ComposedChart>
        </ResponsiveContainer>
    );
};
LiveCandlestickChart.displayName = 'LiveCandlestickChart';


export function TradeChart({ asset, assetLabel, markers = [], chartInterval, setChartInterval, chartType, setChartType }: TradeChartProps) {
    const { subscribeToTicks, subscribeToCandles, unsubscribeFromChart, connectionState, isAuthenticated, ticks, chartError } = useDerivState();
    const { candles } = useDerivChart();

    useEffect(() => {
        if (isAuthenticated && connectionState === 'connected' && asset) {
            if (chartInterval === 'tick') {
                subscribeToTicks(asset);
            } else {
                subscribeToCandles(asset, intervalMap[chartInterval]);
            }
        }
        return () => { if (isAuthenticated) unsubscribeFromChart(); };
    }, [asset, chartInterval, connectionState, isAuthenticated, subscribeToTicks, subscribeToCandles, unsubscribeFromChart]);
    
    const heikinAshiCandles = React.useMemo(() => calculateHeikinAshi(candles), [candles]);

    const { lastPrice, priceChange, isUp } = React.useMemo(() => {
        const data = chartInterval === 'tick' ? ticks : heikinAshiCandles;
        if (data.length === 0) return { lastPrice: 0, priceChange: 0, isUp: true };

        if (chartInterval === 'tick' && ticks.length > 0) {
            const last = ticks[ticks.length - 1].quote;
            const secondLast = ticks.length > 1 ? ticks[ticks.length - 2].quote : last;
            return { lastPrice: last, priceChange: last - secondLast, isUp: last >= secondLast };
        } else if (chartInterval !== 'tick' && heikinAshiCandles.length > 0) {
            const lastCandle = heikinAshiCandles[heikinAshiCandles.length - 1];
            return { lastPrice: lastCandle.close, priceChange: lastCandle.close - lastCandle.open, isUp: lastCandle.close >= lastCandle.open };
        }
        return { lastPrice: 0, priceChange: 0, isUp: true };
    }, [ticks, heikinAshiCandles, chartInterval]);

    const yAxisDomain = React.useMemo(() => {
        const dataSet = chartInterval === 'tick' ? ticks : heikinAshiCandles;
        if (!dataSet || dataSet.length === 0) return ['auto', 'auto'];

        const pricesFromData = dataSet.flatMap((d: any) => d.quote !== undefined ? [d.quote] : [d.low, d.high]);
        const finitePrices = pricesFromData.filter(p => isFinite(p));

        if (finitePrices.length === 0) return ['auto', 'auto'];
        
        const min = Math.min(...finitePrices);
        const max = Math.max(...finitePrices);
        const padding = (max - min) * 0.05 || 0.0001; 

        return [min - padding, max + padding];
    }, [ticks, heikinAshiCandles, chartInterval]);

    const chartDataForCandle = React.useMemo(() => (
        heikinAshiCandles.map(c => ({...c, body: [c.low, c.high]}))
    ), [heikinAshiCandles]);


    const showLoader = !isAuthenticated || (connectionState === 'connected' && ticks.length === 0 && candles.length === 0 && !chartError);
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
                            <TabsTrigger value="area">Area</TabsTrigger>
                            <TabsTrigger value="candle" disabled={isTickChart}>Candle</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Tabs value={chartInterval} onValueChange={(val) => {
                        if (val === 'tick') setChartType('area');
                        setChartInterval(val);
                    }} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="tick">Tick</TabsTrigger>
                            <TabsTrigger value="1m">1m</TabsTrigger>
                            <TabsTrigger value="5m">5m</TabsTrigger>
                            <TabsTrigger value="15m">15m</TabsTrigger>
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
                            <p className="z-10">{isAuthenticated ? 'Loading chart data...' : 'Connect account to see chart'}</p>
                        </div>
                    ) : (
                        (chartType === 'area' || isTickChart)
                        ? <LiveAreaChart data={ticks} isUp={isUp} yAxisDomain={yAxisDomain} markers={markers} />
                        : <LiveCandlestickChart data={chartDataForCandle} isUp={isUp} lastPrice={lastPrice} yAxisDomain={yAxisDomain} markers={markers} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}




    

    

    
