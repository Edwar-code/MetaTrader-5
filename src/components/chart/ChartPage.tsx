
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import BottomNav from '../trade/BottomNav';
import { TradeChart, type ChartMarker } from './TradeChart';
import { Sidebar } from '../trade/Sidebar';
import { useDerivState } from '@/context/DerivContext';
import { useTradeState } from '@/context/TradeContext';
import { TimeframeWheel } from './TimeframeWheel';
import { ChevronUp, ChevronDown, Check, ImagePlus } from 'lucide-react';
import type { Position } from '@/lib/types';
import Image from 'next/image';
import TradeNotification from './TradeNotification';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BtcIcon, De30Icon, EurAudIcon, GbpusdIcon, GoldIcon } from '../trade/icons';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


const formatPrice = (price: number | undefined) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return { integer: '-', fractional: '--' };
  }
  const priceString = price.toFixed(5);
  const parts = priceString.split('.');
  return { integer: parts[0], fractional: parts[1] };
};

interface TradeNotificationData {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  size: number;
}

const assets = [
    { symbol: 'frxXAUUSD', display: 'XAUUSD', description: 'Gold Spot' },
    { symbol: 'cryBTCUSD', display: 'BTCUSD', description: 'Bitcoin' },
    { symbol: 'frxEURAUD', display: 'EURAUD', description: 'Euro vs Australian Dollar' },
    { symbol: 'frxGBPUSD', display: 'GBPUSD', description: 'Pound Sterling vs US Dollar' },
    { symbol: 'idx_germany_40', display: 'DE30', description: 'Germany 40' },
];

const LOCAL_STORAGE_KEY = 'customChartImage';
const DEFAULT_CHART_IMAGE = 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/SDD.PNG';

export default function ChartPage() {
  const { ticks, connectionState, latestPrice } = useDerivState();
  const { positions, handleTrade } = useTradeState();
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();
  
  const [selectedAsset, setAsset] = useState('frxXAUUSD');
  const [chartInterval, setChartInterval] = useState('1m');
  const [chartType, setChartType] = useState('candle');
  const [isTimeframeWheelOpen, setIsTimeframeWheelOpen] = useState(false);
  const [lotSize, setLotSize] = useState(0.01);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [tradeNotifications, setTradeNotifications] = useState<TradeNotificationData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [customChartImage, setCustomChartImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setMounted(true);
    const savedImage = localStorage.getItem(LOCAL_STORAGE_KEY);
    setCustomChartImage(savedImage || DEFAULT_CHART_IMAGE);
  }, []);

  const prevSellPriceRef = useRef<number | undefined>();

  const chartMarkers = useMemo((): ChartMarker[] => {
    return positions
    .filter(pos => pos.pair === selectedAsset)
    .map((pos: Position) => ({
      epoch: pos.openTime,
      price: pos.entryPrice,
      type: 'entry',
      tradeType: pos.type === 'BUY' ? 'BUY' : 'SELL',
      lotSize: pos.size.toFixed(2),
    }));
  }, [positions, selectedAsset]);


  const lastTick = ticks.length > 0 ? ticks[ticks.length - 1] : null;
  // Use latestPrice for the most up-to-date quote, fallback to tick stream
  const sellPrice = latestPrice[selectedAsset] || lastTick?.quote;
  // A small, static spread for display purposes.
  let spread = 0.00015; // Default for forex
  if (selectedAsset === 'cryBTCUSD') spread = 30;
  if (selectedAsset === 'frxXAUUSD') spread = 0.20;
  if (selectedAsset === 'idx_germany_40') spread = 1.0;

  const buyPrice = sellPrice !== undefined ? sellPrice + spread : undefined;

  useEffect(() => {
    if (sellPrice !== undefined) {
      if (prevSellPriceRef.current !== undefined) {
        if (sellPrice > prevSellPriceRef.current) {
          setPriceDirection('up');
        } else if (sellPrice < prevSellPriceRef.current) {
          setPriceDirection('down');
        }
      }
      prevSellPriceRef.current = sellPrice;
    }
  }, [sellPrice]);

  const formattedSellPrice = useMemo(() => formatPrice(sellPrice), [sellPrice]);
  const formattedBuyPrice = useMemo(() => formatPrice(buyPrice), [buyPrice]);

  const onTrade = async (tradeType: 'BUY' | 'SELL') => {
    if (connectionState !== 'connected' || !sellPrice) {
      // Handle error case, maybe show a different kind of notification
      console.error('Cannot trade, not connected or price unavailable.');
      return;
    }

    const tradeData = {
      pair: selectedAsset,
      type: tradeType,
      size: lotSize,
    };
    
    const success = await handleTrade(tradeData);
    
    if (success) {
      const newNotification = { ...tradeData, id: new Date().getTime().toString() };
      setTradeNotifications(prev => [...prev, newNotification]);
    }
  };

  const handleCloseNotification = (id: string) => {
    setTradeNotifications(prev => prev.filter(n => n.id !== id));
  };


  const intervalMap: { [key: string]: string } = {
    '1m': 'M1', '5m': 'M5', '15m': 'M15', '30m': 'M30', '1h': 'H1', '4h': 'H4', '1d': 'D1', '1W': 'W1', '1M': 'MN', 'tick': 'Tick'
  };
  
  const currentAsset = assets.find(a => a.symbol === selectedAsset) || assets[0];
  const displayAsset = currentAsset.display;
  const displayDescription = currentAsset.description;


  const handleLotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single dot
    if (/^\d*\.?\d*$/.test(value)) {
      setLotSize(parseFloat(value) || 0);
    }
  };

  const adjustLotSize = (amount: number) => {
    setLotSize(prev => {
      const current = prev || 0;
      const newSize = Math.max(0.01, current + amount);
      // Format to 2 decimal places to handle floating point inaccuracies
      return parseFloat(newSize.toFixed(2));
    });
  };
  
  const chartSettingsImage = mounted && resolvedTheme === 'dark'
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.19.12_c460d5de.jpg'
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/charts.jpg';

  const priceFractionFontSize = selectedAsset === 'frxXAUUSD' || selectedAsset === 'cryBTCUSD' || selectedAsset === 'idx_germany_40' ? '22px' : '28px';

  const handleCustomChart = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem(LOCAL_STORAGE_KEY, base64String);
        setCustomChartImage(base64String);
        toast({
          title: 'Chart Updated',
          description: 'Your custom chart image has been applied.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!mounted) {
    return null; // or a loading skeleton
  }

  const handleDoubleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Chart Container - Now takes full space and is behind other elements */}
      <div 
        className="flex-1 bg-background relative min-h-0 pt-[48px] pb-[1.6rem]" 
        onDoubleClick={handleDoubleClick}
      >
         <div className="absolute top-[110px] left-3 z-10">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 focus:outline-none">
                        <span className="font-normal text-primary text-[12.5px]">{displayAsset}</span>
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-primary"></div>
                        <span className="font-normal text-muted-foreground text-[12.5px]">{intervalMap[chartInterval]}</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                {assets.map(asset => (
                    <DropdownMenuItem key={asset.symbol} onSelect={() => setAsset(asset.symbol)}>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                           {asset.symbol === 'frxXAUUSD' ? (
                                <GoldIcon width={16} height={16} /> 
                            ) : asset.symbol === 'cryBTCUSD' ? (
                                <BtcIcon width={16} height={16} />
                            ) : asset.symbol === 'idx_germany_40' ? (
                                <De30Icon width={16} height={16} />
                            ) : asset.symbol === 'frxGBPUSD' ? (
                                <GbpusdIcon width={16} height={16} />
                            ) : (
                                <EurAudIcon width={16} height={16} />
                            )}
                            {asset.symbol !== 'frxEURAUD' && <span>{asset.display}</span>}
                        </div>
                        {selectedAsset === asset.symbol && <Check className="h-4 w-4" />}
                    </div>
                    </DropdownMenuItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenu>

          <p className="text-[10.5px] text-muted-foreground">{displayDescription}</p>
        </div>
        <TradeChart
          asset={selectedAsset}
          assetLabel={displayAsset}
          markers={chartMarkers}
          chartInterval={chartInterval}
          setChartInterval={setChartInterval}
          chartType={chartType}
          setChartType={setChartType}
          buyPrice={buyPrice}
          customChartImage={customChartImage}
        />
      </div>

      {/* Top Navigation - Absolutely Positioned */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between pl-3 pr-[4px] py-2.5 bg-card border-b z-20 h-[48px]">
        <div className="flex items-center">
          <Sidebar />
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
           <button onClick={() => setIsTimeframeWheelOpen(!isTimeframeWheelOpen)} style={{ height: '80px', width: '245px' }}>
             <Image src={chartSettingsImage} alt="Chart settings" width={245} height={80} />
           </button>
        </div>
      </div>

      {/* SELL/BUY Section - Absolutely Positioned */}
      <div className="absolute left-0 right-0 flex z-10" style={{top: '48.1px'}}>
        <div 
          onClick={() => onTrade('SELL')} 
          className="text-white flex-grow-[0.3] cursor-pointer flex flex-col justify-center items-start pl-1.5 pt-1 transition-colors duration-200"
          style={{ backgroundColor: '#ea4d4a' }}
        >
          <div className="font-normal opacity-90 text-[10px] leading-none">SELL</div>
          <div className="leading-none text-center w-full">
            <span className="text-[13px] font-bold">{formattedSellPrice.integer}</span>
            <span className={`font-bold`} style={{ fontSize: priceFractionFontSize }}>.{formattedSellPrice.fractional}</span>
          </div>
        </div>
        <div className="bg-background px-2 flex items-center justify-center min-w-[140px] flex-grow-[0.4] border-b">
          <div className="flex items-center space-x-2">
            <button className="cursor-pointer p-1" onClick={() => adjustLotSize(-0.01)}>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </button>
             <input
              type="text"
              value={lotSize}
              onChange={handleLotChange}
              className="text-[13px] text-foreground min-w-[40px] w-14 text-center bg-transparent border-none focus:ring-0 focus-visible:outline-none"
            />
            <button className="cursor-pointer p-1" onClick={() => adjustLotSize(0.01)}>
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div 
          onClick={() => onTrade('BUY')} 
          className="text-white flex-grow-[0.3] cursor-pointer flex flex-col justify-center items-start pl-1.5 pt-1 transition-colors duration-200"
          style={{ backgroundColor: '#3082ff' }}
        >
          <div className="font-normal opacity-90 text-[10px] leading-none">BUY</div>
          <div className="leading-none text-center w-full">
            <span className="text-[13px] font-bold">{formattedBuyPrice.integer}</span>
            <span className={`font-bold`} style={{ fontSize: priceFractionFontSize }}>.{formattedBuyPrice.fractional}</span>
          </div>
        </div>
      </div>
      
      {/* Timeframe wheel stays as an overlay */}
      <TimeframeWheel
            isOpen={isTimeframeWheelOpen}
            onClose={() => setIsTimeframeWheelOpen(false)}
            selectedInterval={chartInterval}
            onSelectInterval={(interval) => {
              setChartInterval(interval);
              setIsTimeframeWheelOpen(false);
            }}
          />
      
      <div className="absolute bottom-16 w-[210px] flex flex-col items-center z-50" style={{ marginBottom: '11px', left: '190px' }}>
        {tradeNotifications.map((trade, index) => (
            <TradeNotification 
                key={trade.id}
                tradeDetails={trade}
                onClose={() => handleCloseNotification(trade.id)}
            />
        ))}
      </div>

      <div className="absolute bottom-20 right-4 z-20">
        <Button
          size="icon"
          className="rounded-full w-14 h-14 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg"
          onClick={handleCustomChart}
        >
          <ImagePlus className="h-7 w-7" />
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
