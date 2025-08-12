// src/components/chart/ChartPage.tsx - UPDATED

'use client';

import { useState, useMemo } from 'react';
import { useDerivState, CompletedTrade, ActiveSymbol } from '@/context/DerivContext';
import { TradeChart, ChartMarker } from './TradeChart'; // Your chart component
import { formatAssetDisplayName } from '@/lib/utils';
import BottomNav from '../trade/BottomNav';
import { Sidebar } from '../trade/Sidebar';
import { TradePanel } from './TradePanel'; // Our new component for trading

export default function ChartPage() {
  const { profitTable, activeSymbols, runningTrades } = useDerivState();
  const [asset, setAsset] = useState("R_100"); // Default asset
  const [chartInterval, setChartInterval] = useState('1m');
  const [chartType, setChartType] = useState('candle');

  const selectedAssetLabel = useMemo(() => {
    const displayName = activeSymbols.find(a => a.symbol === asset)?.display_name || asset;
    return formatAssetDisplayName(displayName);
  }, [asset, activeSymbols]);

  // This logic creates the markers on the chart for your trades
  const chartMarkers = useMemo((): ChartMarker[] => {
    const allTrades = [
        ...runningTrades.map(t => ({...t, isRunning: true})),
        ...profitTable.map(t => ({...t, isRunning: false}))
    ].sort((a, b) => (a.start_time || 0) - (b.start_time || 0));
    
    return allTrades
        .filter(trade => trade.asset === asset && trade.start_time && trade.buy_price)
        .flatMap(trade => {
            const markers: ChartMarker[] = [{
                epoch: trade.start_time, price: trade.buy_price, type: 'entry'
            }];
            if (!trade.isRunning && (trade as CompletedTrade).end_time && typeof (trade as CompletedTrade).sell_price === 'number') {
                markers.push({
                    epoch: (trade as CompletedTrade).end_time,
                    price: (trade as CompletedTrade).sell_price,
                    type: (trade as CompletedTrade).profit_loss >= 0 ? 'win' : 'loss'
                });
            }
            return markers;
        });
  }, [runningTrades, profitTable, asset]);

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      {/* This main div now uses a grid to lay out the chart and trade panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-2 p-2">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-3 xl:col-span-4 h-full min-h-0">
            <TradeChart 
                asset={asset} 
                assetLabel={selectedAssetLabel} 
                markers={chartMarkers} 
                chartInterval={chartInterval}
                setChartInterval={setChartInterval}
                chartType={chartType}
                setChartType={setChartType}
            />
        </div>

        {/* Trade Execution Panel */}
        <div className="lg:col-span-1 xl:col-span-1 h-full">
            <TradePanel 
              activeSymbols={activeSymbols}
              asset={asset}
              setAsset={setAsset}
            />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}