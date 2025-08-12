
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDerivState, useDerivChart, Candle, ActiveSymbol } from '@/context/DerivContext';
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, fromUnixTime } from 'date-fns';
import { ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// ========== Reusable Chart Components (from your code) ==========

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
    const { x, y, width, height, open, close, low, high } = props;
    const isUp = close >= open;
    const color = isUp ? '#22c55e' : '#ef4444';
    const bodyY = isUp ? y + (high-close) * height / (high-low) : y + (high-open) * height / (high-low);
    const bodyHeight = Math.max(1, Math.abs(open - close) * height / (high - low));

    return (
        <g>
            <path d={`M${x + width / 2},${y} L${x + width / 2},${y + height}`} stroke={color} strokeWidth="1" />
            <rect x={x} y={bodyY} width={width} height={bodyHeight} fill={color} />
        </g>
    );
};
CandleStick.displayName = 'CandleStick';


// ========== THE MAIN TRADING PAGE COMPONENT ==========

export default function TradingTerminalPage() {
    // --- State for UI control ---
    const [asset, setAsset] = useState("R_100");
    const [chartInterval, setChartInterval] = useState('1m');
    const [stake, setStake] = useState('10');
    const [duration, setDuration] = useState(5);
    const [durationUnit, setDurationUnit] = useState('t');

    // --- Hooks to get live data from your DerivContext ---
    const { 
        buyContract, balance, subscribeToCandles, 
        unsubscribeFromChart, isAuthenticated, connectionState, 
        chartError, activeSymbols 
    } = useDerivState();
    const { candles } = useDerivChart();
    const { toast } = useToast();

    // --- Effect to subscribe to chart data ---
    const intervalMap: { [key: string]: number } = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '1d': 86400 };
    useEffect(() => {
        if (isAuthenticated && connectionState === 'connected' && asset) {
            subscribeToCandles(asset, intervalMap[chartInterval]);
        }
        return () => { if (isAuthenticated) unsubscribeFromChart(); };
    }, [asset, chartInterval, connectionState, isAuthenticated, subscribeToCandles, unsubscribeFromChart]);

    // --- Function to handle trade execution ---
    const handleBuy = async (contractType: 'CALL' | 'PUT') => {
        toast({ title: "Placing trade..." });
        try {
            await buyContract({
                contract_type: contractType,
                amount: parseFloat(stake),
                duration: duration,
                duration_unit: durationUnit,
                symbol: asset,
                basis: 'stake',
                currency: balance?.currency || 'USD',
            });
            // The context already shows a toast on success/failure
        } catch (e: any) {
            console.error("Trade execution failed:", e.message);
        }
    };
    
    // --- Data processing for the chart ---
    const chartDataForCandle = useMemo(() => (
        candles.map(c => ({...c, body: [c.low, c.high]}))
    ), [candles]);

    const yAxisDomain = useMemo(() => {
        if (!candles || candles.length === 0) return ['auto', 'auto'];
        const prices = candles.flatMap(c => [c.low, c.high]);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const padding = (max - min) * 0.1;
        return [min - padding, max + padding];
    }, [candles]);

    return (
        <main className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 h-screen bg-background text-foreground">
            
            {/* Chart Section */}
            <section className="lg:col-span-3 xl:col-span-4 h-full">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>{activeSymbols.find(s => s.symbol === asset)?.display_name || 'Chart'}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {chartError ? (
                            <div className="flex items-center justify-center h-full text-destructive"><AlertTriangle/> {chartError}</div>
                        ) : candles.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">{isAuthenticated ? "Loading chart data..." : "Please log in to see the chart."}</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartDataForCandle}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="epoch" tickFormatter={(v) => format(fromUnixTime(v), 'HH:mm')} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                                    <YAxis domain={yAxisDomain} orientation="right" tickFormatter={(v) => typeof v === 'number' ? v.toFixed(4) : ''} tick={{fill: 'hsl(var(--muted-foreground))'}}/>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area dataKey="body" stroke="transparent" fill="transparent" />
                                    <Bar dataKey="body" shape={<CandleStick />} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Trade Panel Section */}
            <section className="lg:col-span-1 xl:col-span-1 h-full">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Trade Panel</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div>
                            <Label>Asset</Label>
                            <Select value={asset} onValueChange={setAsset}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {activeSymbols.filter(s => s.market === 'synthetic_index').map(symbol => (
                                        <SelectItem key={symbol.symbol} value={symbol.symbol}>{symbol.display_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Stake ({balance?.currency})</Label>
                            <Input type="number" value={stake} onChange={e => setStake(e.target.value)} />
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <Label>Duration</Label>
                                <Input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} />
                            </div>
                            <Select value={durationUnit} onValueChange={setDurationUnit}>
                                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="t">Ticks</SelectItem>
                                    <SelectItem value="m">Minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-auto">
                            <Button variant="success" size="lg" onClick={() => handleBuy('CALL')} className="h-auto flex-col"><ArrowUp/> Higher</Button>
                            <Button variant="destructive" size="lg" onClick={() => handleBuy('PUT')} className="h-auto flex-col"><ArrowDown/> Lower</Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </main>
    );
}