
'use client';

import React from 'react';
import { ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, ReferenceArea, Line } from 'recharts';
import { useDerivState, useDerivChart, Candle, Tick } from '@/context/DerivContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, fromUnixTime } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';


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
    customChartImage?: string | null;
}

const intervalMap: { [key: string]: number | string } = {
  '1m': 60, '5m': 300, '15m': 900,
  '30m': 1800, '1h': 3600, '4h': 14400,
  '1d': 86400, '1W': '1W', '1M': '1M'
};

const getMinuteTicks = (data: { epoch: number }[], intervalMinutes: number, maxTicks: number): number[] => {
    if (!data || data.length < 2) return [];

    const dataMin = data[0].epoch;
    const dataMax = data[data.length - 1].epoch;
    const intervalSeconds = intervalMinutes * 60;

    const firstTick = Math.ceil(dataMin / intervalSeconds) * intervalSeconds;

    const ticks: number[] = [];
    for (let currentTick = firstTick; currentTick <= dataMax; currentTick += intervalSeconds) {
        ticks.push(currentTick);
    }
    
    if (ticks.length === 0) {
        ticks.push(dataMin);
        if(dataMax > dataMin) ticks.push(dataMax);
        return ticks;
    }

    if (ticks.length > maxTicks) {
      const step = Math.ceil(ticks.length / maxTicks);
      return ticks.filter((_, i) => i % step === 0);
    }
  
    return ticks;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const time = format(fromUnixTime(data.epoch), 'PPpp');
    const priceDecimalPoints = data.symbol === 'frxXAUUSD' || data.symbol === 'cryBTCUSD' || data.symbol === 'idx_germany_40' ? 2 : 5;

    return (
      <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-lg text-xs">
        <p>{time}</p>
        {data.quote !== undefined ? (
          <p>Price: <span className="font-bold">{data.quote.toFixed(priceDecimalPoints)}</span></p>
        ) : (
          <>
            <p>O: <span className="font-bold">{data.open.toFixed(priceDecimalPoints)}</span></p>
            <p>H: <span className="font-bold">{data.high.toFixed(priceDecimalPoints)}</span></p>
            <p>L: <span className="font-bold">{data.low.toFixed(priceDecimalPoints)}</span></p>
            <p>C: <span className="font-bold">{data.close.toFixed(priceDecimalPoints)}</span></p>
          </>
        )}
      </div>
    );
  }
  return null;
};
CustomTooltip.displayName = 'CustomTooltip';


const MarkerLabel = ({ viewBox, value, tradeType, lotSize }: any) => {
    const { x, y } = viewBox;
    const formattedLotSize = typeof lotSize === 'number' ? lotSize.toFixed(2) : lotSize;
    const text = `${tradeType} ${formattedLotSize}`;
    const color = tradeType === 'BUY' ? '#3082ff' : '#ea4d4a';
    return (
        <g>
            <text x={x + 10} y={y} dy={-4} fill={color} fontSize="12">
                {text}
            </text>
        </g>
    );
};
MarkerLabel.displayName = 'MarkerLabel';

const OrderPriceLabel = ({ viewBox, value, tradeType, asset }: any) => {
    if (!viewBox || value === undefined) return null;
    const { y, width } = viewBox;
    const color = tradeType === 'BUY' ? '#3082ff' : '#ea4d4a';
    const priceDecimalPoints = asset === 'frxXAUUSD' || asset === 'cryBTCUSD' || asset === 'idx_germany_40' ? 2 : 5;
  
    return (
      <g>
        <foreignObject x={width + 7} y={y - 10} width="60" height="20" className="overflow-visible">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="w-full h-full text-xs flex items-center justify-center bg-background/90 border px-1"
            style={{ borderColor: color, color: color }}
          >
            {value.toFixed(priceDecimalPoints)}
          </div>
        </foreignObject>
      </g>
    );
};
OrderPriceLabel.displayName = 'OrderPriceLabel';


const YAxisLabel = ({ viewBox, value, asset }: any) => {
    if (!viewBox || value === undefined) return null;
    const { y, width } = viewBox;
    const priceDecimalPoints = asset === 'frxXAUUSD' || asset === 'cryBTCUSD' || asset === 'idx_germany_40' ? 2 : 5;
    return (
      <g>
        <foreignObject x={width + 7} y={y - 10} width="60" height="20" className="overflow-visible">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="w-full h-full text-xs flex items-center justify-center text-white bg-[#16A085] px-1"
          >
            {value.toFixed(priceDecimalPoints)}
          </div>
        </foreignObject>
      </g>
    );
};
YAxisLabel.displayName = 'YAxisLabel';

const BuyPriceLabel = ({ viewBox, value, asset }: any) => {
    if (!viewBox || value === undefined) return null;
    const { y, width } = viewBox;
    const priceDecimalPoints = asset === 'frxXAUUSD' || asset === 'cryBTCUSD' || asset === 'idx_germany_40' ? 2 : 5;
    return (
      <g>
        <foreignObject x={width + 7} y={y - 10} width="60" height="20" className="overflow-visible">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="w-full h-full text-xs flex items-center justify-center text-white bg-[#E74C3C] px-1"
          >
            {value.toFixed(priceDecimalPoints)}
          </div>
        </foreignObject>
      </g>
    );
};
BuyPriceLabel.displayName = 'BuyPriceLabel';

const CurrentTimeIndicator = ({ viewBox }: any) => {
  if (!viewBox) return null;
  const { x, y, height } = viewBox;
  return (
    <svg x={x - 4} y={y + height - 4} width="8" height="4" viewBox="0 0 8 4" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 0L8 4H0L4 0Z" fill="#8E8E93"/>
    </svg>
  );
};
CurrentTimeIndicator.displayName = 'CurrentTimeIndicator';

function ChartComponent({ asset, markers = [], chartInterval, buyPrice, customChartImage }: TradeChartProps) {
    const { subscribeToTicks, subscribeToCandles, unsubscribeFromChart, connectionState, ticks, chartError } = useDerivState();
    const { candles } = useDerivChart();
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const isMobileFromParam = searchParams.get('mobile') === 'true';
    const { theme } = useTheme();

    React.useEffect(() => {
        if (connectionState === 'connected' && asset) {
            const mappedInterval = intervalMap[chartInterval];
            const dataCount = isMobile || isMobileFromParam ? 25 : 100;
            if (chartInterval === 'tick') {
                subscribeToTicks(asset, dataCount);
            } else if (typeof mappedInterval === 'number') {
                subscribeToCandles(asset, mappedInterval, dataCount);
            } else {
                console.warn(`String-based interval "${mappedInterval}" is not yet supported.`);
                 subscribeToCandles(asset, 86400, dataCount);
            }
        }
        return () => { unsubscribeFromChart(); };
    }, [asset, chartInterval, connectionState, subscribeToTicks, subscribeToCandles, unsubscribeFromChart, isMobile, isMobileFromParam]);
    
    const chartData = React.useMemo(() => {
        return chartInterval === 'tick' ? ticks : candles;
    }, [chartInterval, ticks, candles]);

    const { lastPrice } = React.useMemo(() => {
        if (chartData.length === 0) return { lastPrice: 0 };
        const lastDataPoint = chartData[chartData.length - 1];
        if ('quote' in lastDataPoint) {
            return { lastPrice: lastDataPoint.quote };
        }
        return { lastPrice: lastDataPoint.close };
    }, [chartData]);

    const yAxisDomain = React.useMemo(() => {
        if (!chartData || chartData.length === 0) return ['auto', 'auto'];
        const prices = chartData.flatMap((d: any) => d.quote !== undefined ? [d.quote] : [d.low, d.high]);
        if (markers) {
          markers.forEach(m => prices.push(m.price));
        }
        if (buyPrice) prices.push(buyPrice);
        if (lastPrice) prices.push(lastPrice);

        const finitePrices = prices.filter(p => isFinite(p));
        if (finitePrices.length === 0) return ['auto', 'auto'];
        const min = Math.min(...finitePrices);
        const max = Math.max(...finitePrices);
        const padding = (max - min) * 0.1 || (asset === 'frxXAUUSD' || asset === 'cryBTCUSD' || asset === 'idx_germany_40' ? 0.01 : 0.0001); 
        return [min - padding, max + padding];
    }, [chartData, markers, buyPrice, lastPrice, asset]);

    const tickStyle = React.useMemo(() => ({
        fontSize: 12,
        fontWeight: 'normal',
        fill: theme === 'dark' ? '#d3d9db' : 'hsl(var(--muted-foreground))'
    }), [theme]);

    return (
        <Card className="h-full flex flex-col border-0 shadow-none rounded-none bg-transparent">
            <CardContent className="flex-1 min-h-0 w-full relative p-0">
                <div className="h-full w-full">
                    {chartError ? (
                        <div className="flex items-center justify-center h-full text-destructive flex-col gap-2 p-4 text-center">
                            <AlertTriangle className="h-8 w-8" />
                            <p className="font-semibold">Chart Unavailable</p>
                            <p className="text-sm text-muted-foreground">{chartError}</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart 
                                data={chartData} 
                                margin={{ top: 20, right: 0, left: -10, bottom: 20 }} 
                                animationDuration={0}
                            >
                                <defs>
                                    {customChartImage && (
                                        <pattern id="chart-bg-image" patternUnits="userSpaceOnUse" width="100%" height="100%">
                                            <image href={customChartImage} x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                                        </pattern>
                                    )}
                                </defs>
                                
                                <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'dd MMM HH:mm')} domain={['dataMin', `dataMax + 10`]} type="number" tick={tickStyle} axisLine={{ stroke: '#ccc' }} tickLine={false} ticks={getMinuteTicks(chartData, 1, 15)} />
                                <YAxis domain={yAxisDomain} tick={tickStyle} axisLine={{ stroke: '#ccc' }} tickLine={{ stroke: '#888888', strokeWidth: 1, width: 0.9 }} allowDataOverflow={true} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(asset === 'frxXAUUSD' || asset === 'cryBTCUSD' || asset === 'idx_germany_40' ? 2 : 5) : ''} tickCount={18} tickMargin={1}/>

                                <Tooltip content={<CustomTooltip />} cursor={false} />
                                
                                <Line type="monotone" dataKey="close" stroke="none" dot={false} isAnimationActive={false} fill="transparent" />
                                
                                {customChartImage && chartData.length > 0 && (
                                    <ReferenceArea x1={chartData[0].epoch} x2={chartData[chartData.length - 1].epoch} y1={yAxisDomain[0]} y2={yAxisDomain[1]} strokeOpacity={0} fill="url(#chart-bg-image)" ifOverflow="visible" />
                                )}

                                {markers?.map((m, i) => (
                                    <React.Fragment key={`marker-frag-${i}`}>
                                        <ReferenceLine y={m.price} stroke="transparent" label={<MarkerLabel value={m.price} tradeType={m.tradeType} lotSize={m.lotSize} />} ifOverflow="visible" />
                                        <ReferenceLine y={m.price} stroke={m.tradeType === 'BUY' ? '#3082ff' : '#ea4d4a'} strokeDasharray="3 3" strokeWidth={1} label={<OrderPriceLabel value={m.price} tradeType={m.tradeType} asset={asset} />} ifOverflow="visible" />
                                    </React.Fragment>
                                ))}
                                
                                {lastPrice > 0 && <ReferenceLine y={lastPrice} stroke="#16A085" strokeWidth={1} label={<YAxisLabel value={lastPrice} asset={asset}/>} />}
                                {buyPrice && <ReferenceLine y={buyPrice} stroke="#E74C3C" strokeWidth={1} label={<BuyPriceLabel value={buyPrice} asset={asset}/>} />}
                                
                                { (chartData.length > 0) && <ReferenceLine x={chartData[chartData.length-1].epoch} stroke="transparent" label={<CurrentTimeIndicator />} ifOverflow="visible" /> }
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function TradeChart(props: TradeChartProps) {
    return (
        <React.Suspense fallback={<Skeleton className="h-full w-full" />}>
            <ChartComponent {...props} />
        </React.Suspense>
    )
}
