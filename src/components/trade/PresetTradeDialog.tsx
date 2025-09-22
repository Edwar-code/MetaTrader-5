
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTradeState } from '@/context/TradeContext';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const presetTradeSchema = z.object({
  pair: z.string().min(1, "Asset is required."),
  type: z.enum(['BUY', 'SELL']),
  size: z.coerce.number().min(0.01, "Lot size must be at least 0.01."),
  entryPrice: z.coerce.number().gt(0, "Entry price must be positive."),
});

type PresetTradeForm = z.infer<typeof presetTradeSchema>;

const assets = [
    { symbol: 'frxXAUUSD', display: 'Gold (XAUUSD)' },
    { symbol: 'cryBTCUSD', display: 'Bitcoin (BTCUSD)' },
    { symbol: 'frxEURAUD', display: 'Euro/AUD (EURAUD)' },
    { symbol: 'idx_dax_30', display: 'Germany 30 (DE30)' },
];

export function PresetTradeDialog({ children }: { children: React.ReactNode }) {
    const { addPresetTrade } = useTradeState();
    const [isOpen, setIsOpen] = useState(false);

    const { control, handleSubmit, register, formState: { errors } } = useForm<PresetTradeForm>({
        resolver: zodResolver(presetTradeSchema),
        defaultValues: {
            pair: 'frxXAUUSD',
            type: 'BUY',
            size: 0.1,
            entryPrice: 2300,
        },
    });

    const onSubmit = (data: PresetTradeForm) => {
        // Set openTime to 24 hours ago
        const openTime = (Date.now() / 1000) - (24 * 60 * 60); 
        addPresetTrade({ ...data, openTime });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Preset Trade</DialogTitle>
                    <DialogDescription>
                        Create a running trade that appears to have started in the past.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pair" className="text-right">Asset</Label>
                        <Controller
                            name="pair"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select an asset" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assets.map(asset => (
                                            <SelectItem key={asset.symbol} value={asset.symbol}>{asset.display}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                         {errors.pair && <p className="col-span-4 text-red-500 text-sm">{errors.pair.message}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Type</Label>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="col-span-3 flex items-center space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="BUY" id="buy" />
                                        <Label htmlFor="buy">BUY</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="SELL" id="sell" />
                                        <Label htmlFor="sell">SELL</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="size" className="text-right">Lot Size</Label>
                        <Input id="size" type="number" step="0.01" className="col-span-3" {...register('size')} />
                        {errors.size && <p className="col-span-4 text-red-500 text-sm">{errors.size.message}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="entryPrice" className="text-right">Entry Price</Label>
                        <Input id="entryPrice" type="number" step="0.01" className="col-span-3" {...register('entryPrice')} />
                        {errors.entryPrice && <p className="col-span-4 text-red-500 text-sm">{errors.entryPrice.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Trade</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
