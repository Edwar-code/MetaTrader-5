
'use client';

import React, { useEffect } from 'react';
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { useDerivState, useDerivChart, Candle, Tick } from '@/context/DerivContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, fromUnixTime } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchParams } from 'next/navigation';


export interface ChartMarker {
    epoch: number;
    price: number;
    type: 'entry' | 'win' | 'loss';
    tradeType: 'BUY' | 'SELL';
    lotSize: string;
}

interface TradeChartProps {
    asset: string;
    assetLabel: string;
    markers?: ChartMarker[];
    chartInterval: string;
    setChartInterval: (interval: string) => void;
    chartType: string;
    setChartType: (type: string) => void;
    buyPrice?: number;
}

const intervalMap: { [key: string]: number | string } = {
  '1m': 60, '5m': 300, '15m': 900,
  '30m': 1800, '1h': 3600, '4h': 14400,
  '1d': 86400, '1W': '1W', '1M': '1M'
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
          <p>Price: <span className="font-bold">{data.quote.toFixed(2)}</span></p>
        ) : (
          <>
            <p>O: <span className="font-bold">{data.open.toFixed(2)}</span></p>
            <p>H: <span className="font-bold">{data.high.toFixed(2)}</span></p>
            <p>L: <span className="font-bold">{data.low.toFixed(2)}</span></p>
            <p>C: <span className="font-bold">{data.close.toFixed(2)}</span></p>
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
    const color = isUp ? '#16A085' : '#E74C3C';
    
    // Y position of the body
    const yBody = isUp ? y + (high - close) / (high - low) * height : y + (high - open) / (high - low) * height;
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


const MarkerLabel = ({ viewBox, value, tradeType, lotSize }: any) => {
    const { x, y } = viewBox;
    const text = `${tradeType} ${lotSize}`;
    const color = tradeType === 'BUY' ? '#007AFF' : '#FF3B30';
    return (
        <g>
            <text x={x + 10} y={y} dy={-4} fill={color} fontSize="12">
                {text}
            </text>
        </g>
    );
};
MarkerLabel.displayName = 'MarkerLabel';

const OrderPriceLabel = ({ viewBox, value, tradeType }: any) => {
    if (!viewBox || value === undefined) return null;
    const { y, width } = viewBox;
    const color = tradeType === 'BUY' ? '#007AFF' : '#FF3B30';
  
    return (
      <g>
        <foreignObject x={width} y={y - 10} width="70" height="20" className="overflow-visible">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="w-full h-full text-xs flex items-center justify-center bg-white/90 border"
            style={{ borderColor: color, color: color }}
          >
            {value.toFixed(2)}
          </div>
        </foreignObject>
      </g>
    );
};
OrderPriceLabel.displayName = 'OrderPriceLabel';


const YAxisLabel = ({ viewBox, value }: any) => {
    if (!viewBox || value === undefined) return null;
    const { y, width } = viewBox;
    return (
      <g>
        <foreignObject x={width} y={y - 10} width="70" height="20" className="overflow-visible">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="w-full h-full text-xs flex items-center justify-center text-white bg-[#16A085]"
          >
            {value.toFixed(2)}
          </div>
        </foreignObject>
      </g>
    );
};
YAxisLabel.displayName = 'YAxisLabel';

const BuyPriceLabel = ({ viewBox, value }: any) => {
    if (!viewBox || value === undefined) return null;
    const { y, width } = viewBox;
    return (
      <g>
        <foreignObject x={width} y={y - 10} width="70" height="20" className="overflow-visible">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="w-full h-full text-xs flex items-center justify-center text-white bg-[#E74C3C]"
          >
            {value.toFixed(2)}
          </div>
        </foreignObject>
      </g>
    );
};
BuyPriceLabel.displayName = 'BuyPriceLabel';

const LiveAreaChart = ({ data, isUp, yAxisDomain, markers, buyPrice }: { data: Tick[], isUp: boolean, yAxisDomain: (string|number)[], markers: ChartMarker[], buyPrice?: number }) => {
    const lastTick = data.length > 0 ? data[data.length - 1] : null;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 20 }} animationDuration={0}>
            <defs>
                <linearGradient id="chartGradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'dd MMM HH:mm')} domain={['dataMin', 'dataMax']} type="number" tick={{ fontSize: 12 }} axisLine={true} tickLine={true} tickCount={5} />
            <YAxis domain={yAxisDomain} tick={{ fontSize: 12, fill: 'black', fontWeight: 'normal' }} axisLine={false} tickLine={false} allowDataOverflow={true} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(2) : ''} tickCount={18}/>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="hsl(var(--border))" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="quote" stroke={isUp ? "#22c55e" : "#ef4444"} fillOpacity={1} fill="url(#chartGradientArea)" strokeWidth={2} dot={false} isAnimationActive={false} />
            {markers.map((m, i) => m.type === 'entry' && (
                <ReferenceLine
                    key={`marker-text-${i}`}
                    y={m.price}
                    stroke="transparent" // Hide the line for the text label
                    label={<MarkerLabel value={m.price} tradeType={m.tradeType} lotSize={m.lotSize} />}
                    ifOverflow="visible"
                />
            ))}
            {markers.map((m, i) => m.type === 'entry' && (
                <ReferenceLine 
                    key={`marker-line-${i}`}
                    y={m.price}
                    stroke={m.tradeType === 'BUY' ? '#007AFF' : '#FF3B30'}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={<OrderPriceLabel value={m.price} tradeType={m.tradeType} />}
                    ifOverflow="visible"
                />
            ))}
            {lastTick && (
                <ReferenceLine 
                    y={lastTick.quote} 
                    stroke="#16A085" 
                    strokeWidth={1} 
                    label={<YAxisLabel value={lastTick.quote} />}
                />
            )}
             {buyPrice && (
                <ReferenceLine 
                    y={buyPrice} 
                    stroke="#E74C3C" 
                    strokeWidth={1} 
                    label={<BuyPriceLabel value={buyPrice} />}
                />
            )}
            </AreaChart>
        </ResponsiveContainer>
    );
};
LiveAreaChart.displayName = 'LiveAreaChart';

const LiveCandlestickChart = ({ data, isUp, lastPrice, yAxisDomain, markers, buyPrice }: { data: (Candle & {body: [number, number]})[], isUp: boolean, lastPrice: number, yAxisDomain: (string|number)[], markers: ChartMarker[], buyPrice?: number }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 20 }} animationDuration={0}>
                <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'dd MMM HH:mm')} domain={['dataMin', 'dataMax']} type="number" tick={{ fontSize: 12 }} axisLine={true} tickLine={true} tickCount={5} />
                <YAxis domain={yAxisDomain} tick={{ fontSize: 12, fill: 'black', fontWeight: 'normal' }} axisLine={false} tickLine={false} allowDataOverflow={true} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(2) : ''} tickCount={18}/>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="hsl(var(--border))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="body" shape={<HeikinAshiCandleStick />} isAnimationActive={false} barSize={6} />
                
                {/* Render text label separately */}
                 {markers.map((m, i) => m.type === 'entry' && (
                    <ReferenceLine
                        key={`marker-text-${i}`}
                        y={m.price}
                        stroke="transparent" 
                        label={<MarkerLabel value={m.price} tradeType={m.tradeType} lotSize={m.lotSize} />}
                        ifOverflow="visible"
                    />
                ))}
                
                {/* Render the line and price label */}
                {markers.map((m, i) => m.type === 'entry' && (
                     <ReferenceLine 
                        key={`marker-line-${i}`}
                        y={m.price}
                        stroke={m.tradeType === 'BUY' ? '#007AFF' : '#FF3B30'}
                        strokeDasharray="3 3"
                        strokeWidth={1}
                        label={<OrderPriceLabel value={m.price} tradeType={m.tradeType} />}
                        ifOverflow="visible"
                    />
                ))}

                {lastPrice > 0 && (
                     <ReferenceLine 
                        y={lastPrice} 
                        stroke="#16A085" 
                        strokeWidth={1}
                        label={<YAxisLabel value={lastPrice}/>}
                    />
                )}
                {buyPrice && (
                    <ReferenceLine 
                        y={buyPrice} 
                        stroke="#E74C3C" 
                        strokeWidth={1} 
                        label={<BuyPriceLabel value={buyPrice} />}
                    />
                )}
            </ComposedChart>
        </ResponsiveContainer>
    );
};
LiveCandlestickChart.displayName = 'LiveCandlestickChart';


function ChartComponent({ asset, assetLabel, markers = [], chartInterval, setChartInterval, chartType, setChartType, buyPrice }: TradeChartProps) {
    const { subscribeToTicks, subscribeToCandles, unsubscribeFromChart, connectionState, ticks, chartError } = useDerivState();
    const { candles } = useDerivChart();
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const isMobileFromParam = searchParams.get('mobile') === 'true';

    useEffect(() => {
        if (connectionState === 'connected' && asset) {
            const mappedInterval = intervalMap[chartInterval];
            const dataCount = isMobile || isMobileFromParam ? 25 : 100;
            if (chartInterval === 'tick') {
                subscribeToTicks(asset, dataCount);
            } else if (typeof mappedInterval === 'number') {
                subscribeToCandles(asset, mappedInterval, dataCount);
            } else {
                console.warn(`String-based interval "${mappedInterval}" is not yet supported.`);
                 subscribeToCandles(asset, 86400, dataCount); // fallback to daily
            }
        }
        return () => { unsubscribeFromChart(); };
    }, [asset, chartInterval, connectionState, subscribeToTicks, subscribeToCandles, unsubscribeFromChart, isMobile, isMobileFromParam]);
    
    const heikinAshiCandles = React.useMemo(() => calculateHeikinAshi(candles), [candles]);

    const { lastPrice, isUp } = React.useMemo(() => {
        const lastTick = ticks.length > 0 ? ticks[ticks.length - 1] : null;
        if (lastTick) {
             const secondLastTick = ticks.length > 1 ? ticks[ticks.length - 2].quote : lastTick.quote;
             return { lastPrice: lastTick.quote, isUp: lastTick.quote >= secondLastTick };
        }

        if (chartInterval !== 'tick' && heikinAshiCandles.length > 0) {
            const lastCandle = heikinAshiCandles[heikinAshiCandles.length - 1];
            return { lastPrice: lastCandle.close, isUp: lastCandle.close >= lastCandle.open };
        }

        return { lastPrice: 0, isUp: true };
    }, [ticks, heikinAshiCandles, chartInterval]);

    const yAxisDomain = React.useMemo(() => {
        const dataSet = chartInterval === 'tick' ? ticks : heikinAshiCandles;
        if (!dataSet || dataSet.length === 0) return ['auto', 'auto'];

        const pricesFromData = dataSet.flatMap((d: any) => d.quote !== undefined ? [d.quote] : [d.low, d.high]);
        const finitePrices = pricesFromData.filter(p => isFinite(p));

        if (finitePrices.length === 0) return ['auto', 'auto'];
        
        const min = Math.min(...finitePrices);
        const max = Math.max(...finitePrices);
        const padding = (max - min) * 0.1 || 0.0001; 

        return [min - padding, max + padding];
    }, [ticks, heikinAshiCandles, chartInterval]);

    const chartDataForCandle = React.useMemo(() => (
        heikinAshiCandles.map(c => ({...c, body: [c.low, c.high]}))
    ), [heikinAshiCandles]);


    const showLoader = connectionState !== 'connected' || (ticks.length === 0 && candles.length === 0 && !chartError);
    const isTickChart = chartInterval === 'tick';

    return (
        <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
            <CardContent className="flex-1 min-h-0 w-full relative p-0">
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
                            <p className="z-10">{connectionState === 'connecting' ? 'Connecting to data stream...' : 'Loading chart data...'}</p>
                        </div>
                    ) : (
                        (chartType === 'area' || isTickChart)
                        ? <LiveAreaChart data={ticks} isUp={isUp} yAxisDomain={yAxisDomain} markers={markers} buyPrice={buyPrice} />
                        : <LiveCandlestickChart data={chartDataForCandle} isUp={isUp} lastPrice={lastPrice} yAxisDomain={yAxisDomain} markers={markers} buyPrice={buyPrice} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Suspense boundary to allow use of useSearchParams
export function TradeChart(props: TradeChartProps) {
    return (
        <React.Suspense fallback={<Skeleton className="h-full w-full" />}>
            <ChartComponent {...props} />
        </React.Suspense>
    )
}
