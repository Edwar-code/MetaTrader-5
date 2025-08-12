// src/components/chart/TradePanel.tsx - NEW FILE

'use client';

import React, { useState } from 'react';
import { useDerivState, ActiveSymbol } from '@/context/DerivContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TradePanelProps {
    activeSymbols: ActiveSymbol[];
    asset: string;
    setAsset: (asset: string) => void;
}

export function TradePanel({ activeSymbols, asset, setAsset }: TradePanelProps) {
    const { buyContract, balance } = useDerivState();
    const [stake, setStake] = useState('10');
    const [duration, setDuration] = useState(5);
    const [durationUnit, setDurationUnit] = useState('t'); // t for ticks, m for minutes
    const { toast } = useToast();

    const handleBuy = async (contractType: 'CALL' | 'PUT') => {
        toast({ title: "Placing trade...", description: `Buying ${contractType} for ${stake} ${balance?.currency}`});
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
            toast({ title: "Trade Placed Successfully!", variant: "default" });
        } catch (e: any) {
            // The context already shows a toast on failure, so we just log here
            console.error("Trade execution failed:", e.message);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Trade Panel</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Asset Selector */}
                <div>
                    <Label htmlFor="asset-select">Asset</Label>
                    <Select value={asset} onValueChange={setAsset}>
                        <SelectTrigger id="asset-select">
                            <SelectValue placeholder="Select an asset" />
                        </SelectTrigger>
                        <SelectContent>
                            {activeSymbols
                                .filter(s => s.market === 'synthetic_index') // Filter for synthetics initially
                                .map(symbol => (
                                    <SelectItem key={symbol.symbol} value={symbol.symbol}>
                                        {symbol.display_name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Stake Input */}
                <div>
                    <Label htmlFor="stake">Stake ({balance?.currency})</Label>
                    <Input id="stake" type="number" value={stake} onChange={e => setStake(e.target.value)} />
                </div>
                
                {/* Duration Input */}
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <Label htmlFor="duration">Duration</Label>
                        <Input id="duration" type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} />
                    </div>
                    <Select value={durationUnit} onValueChange={setDurationUnit}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="t">Ticks</SelectItem>
                            <SelectItem value="m">Minutes</SelectItem>
                            <SelectItem value="h">Hours</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Buy Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button variant="success" size="lg" onClick={() => handleBuy('CALL')} className="flex flex-col h-auto">
                        <ArrowUp className="h-6 w-6" />
                        <span>Higher</span>
                        <span className="text-xs opacity-70">CALL</span>
                    </Button>
                    <Button variant="destructive" size="lg" onClick={() => handleBuy('PUT')} className="flex flex-col h-auto">
                        <ArrowDown className="h-6 w-6" />
                        <span>Lower</span>
                        <span className="text-xs opacity-70">PUT</span>
                    </Button>
                </div>
                
            </CardContent>
        </Card>
    );
}