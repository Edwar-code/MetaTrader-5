'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useDerivState } from './DerivContext';
import { useToast } from '@/hooks/use-toast';
import type { Position, ClosedPosition } from '@/lib/types';
import { calculatePnl } from '@/lib/utils';

interface TradeState {
    positions: Position[];
    closedPositions: ClosedPosition[];
    balance: number;
    equity: number;
    totalPnl: number;
    handleTrade: (trade: Omit<Position, 'id' | 'currentPrice' | 'pnl' | 'entryPrice' | 'openTime'>) => void;
    handleClosePosition: (positionId: string, customClosePrice?: number) => void;
    handleBulkClosePositions: (filter: 'all' | 'profitable' | 'losing') => void;
    handleUpdatePosition: (positionId: string, updates: Partial<Pick<Position, 'stopLoss' | 'takeProfit'>>) => void;
}

const TradeContext = createContext<TradeState | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
    const [positions, setPositions] = useState<Position[]>([]);
    const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>([]);
    const [balance, setBalance] = useState<number>(10000); // Start with a 10k funded account

    const { latestPrice, getTicks } = useDerivState();
    const { toast } = useToast();

     const livePositions = useMemo(() => {
        return positions.map(pos => {
            const currentPrice = latestPrice[pos.pair] || pos.currentPrice;
            const pnl = calculatePnl(pos, currentPrice);
            return { ...pos, currentPrice, pnl };
        });
    }, [positions, latestPrice]);

    const totalPnl = useMemo(() => {
        return livePositions.reduce((acc, pos) => acc + (pos.pnl || 0), 0);
    }, [livePositions]);

    const equity = useMemo(() => balance + totalPnl, [balance, totalPnl]);


    // Effect to check for SL/TP on price change
    useEffect(() => {
        if (Object.keys(latestPrice).length === 0 || positions.length === 0) return;
        
        const checkPositions = () => {
            positions.forEach(pos => {
                const currentPrice = latestPrice[pos.pair];
                if (!currentPrice) return;

                const hasHitStopLoss = pos.stopLoss && (
                    (pos.type === 'BUY' && currentPrice <= pos.stopLoss) || 
                    (pos.type === 'SELL' && currentPrice >= pos.stopLoss)
                );
                
                if (hasHitStopLoss) {
                    toast({
                        title: "Stop Loss Triggered",
                        description: `${pos.pair} closed at ${pos.stopLoss}`,
                        variant: "destructive"
                    });
                    handleClosePosition(pos.id, pos.stopLoss);
                    return; 
                }
                
                const hasHitTakeProfit = pos.takeProfit && (
                    (pos.type === 'BUY' && currentPrice >= pos.takeProfit) || 
                    (pos.type === 'SELL' && currentPrice <= pos.takeProfit)
                );

                if (hasHitTakeProfit) {
                    toast({
                        title: "Take Profit Hit",
                        description: `${pos.pair} closed at ${pos.takeProfit}`,
                    });
                    handleClosePosition(pos.id, pos.takeProfit);
                }
            });
        };
        
        checkPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestPrice]);

    const handleTrade = useCallback(async (trade: Omit<Position, 'id' | 'currentPrice' | 'pnl' | 'entryPrice' | 'openTime'>) => {
        try {
            const ticks = await getTicks(trade.pair, 1);
            const entryPrice = ticks.length > 0 ? ticks[0].quote : latestPrice[trade.pair];

            if (!entryPrice || entryPrice <= 0) {
                toast({
                    title: "Market Closed",
                    description: "Cannot place trade, price data is not available.",
                    variant: "destructive"
                });
                return;
            }

            const newPosition: Position = {
                ...trade,
                id: new Date().getTime().toString(),
                openTime: Date.now() / 1000,
                entryPrice,
                currentPrice: entryPrice,
                pnl: 0,
            };
            setPositions(prev => [...prev, newPosition]);
            toast({
                title: "Trade Opened",
                description: `${trade.type} ${trade.size} lot of ${trade.pair} at ${entryPrice.toFixed(5)}`,
            });
        } catch (error: any) {
             toast({
                title: "Trade Failed",
                description: error.message || "Could not fetch latest price to open trade.",
                variant: "destructive"
            });
        }
    }, [getTicks, latestPrice, toast]);

    const handleClosePosition = useCallback((positionId: string, customClosePrice?: number) => {
        setPositions(prev => {
            const positionToClose = prev.find(p => p.id === positionId);
            if (!positionToClose) return prev;

            const closePrice = customClosePrice || latestPrice[positionToClose.pair] || positionToClose.currentPrice;

            if (!closePrice || closePrice <= 0) {
                toast({
                    title: "Cannot Close Trade",
                    description: "Market price is unavailable.",
                    variant: "destructive"
                });
                return prev;
            }

            const finalPnl = calculatePnl(positionToClose, closePrice);
            
            const closedPosition: ClosedPosition = {
                ...positionToClose,
                pnl: finalPnl,
                currentPrice: closePrice,
                closePrice: closePrice,
                closeTime: Date.now() / 1000,
            };

            setClosedPositions(prevClosed => [closedPosition, ...prevClosed]);
            
            setBalance(prevBalance => prevBalance + finalPnl);

            // if(!customClosePrice){
            //     toast({
            //         title: "Trade Closed Manually",
            //         description: `Closed ${positionToClose.pair} for a P/L of $${finalPnl.toFixed(2)}`,
            //         variant: finalPnl >= 0 ? "default" : "destructive"
            //     });
            // }

            return prev.filter(p => p.id !== positionId);
        });
    }, [latestPrice, toast]);

    const handleBulkClosePositions = useCallback((filter: 'all' | 'profitable' | 'losing') => {
        let positionsToClose: Position[] = [];
        const currentPositions = positions.map(pos => {
            const currentPrice = latestPrice[pos.pair] || pos.currentPrice;
            const pnl = calculatePnl(pos, currentPrice);
            return { ...pos, pnl };
        });
        
        currentPositions.forEach(pos => {
            if (filter === 'all') {
                positionsToClose.push(pos);
            } else if (filter === 'profitable' && pos.pnl >= 0) {
                positionsToClose.push(pos);
            } else if (filter === 'losing' && pos.pnl < 0) {
                positionsToClose.push(pos);
            }
        });

        if (positionsToClose.length === 0) {
            toast({
                title: 'No Trades to Close',
                description: `You have no open positions that are ${filter}.`,
            });
            return;
        }

        positionsToClose.forEach(pos => {
             // We pass the calculated PNL so we don't rely on state to close it
            handleClosePosition(pos.id, latestPrice[pos.pair] || pos.currentPrice);
        });

         const totalPnl = positionsToClose.reduce((acc, pos) => acc + (pos.pnl || 0), 0);

        // toast({
        //     title: `Bulk Close Successful`,
        //     description: `Closed ${positionsToClose.length} positions. Total P/L: $${totalPnl.toFixed(2)}`,
        //     variant: totalPnl >= 0 ? "default" : "destructive"
        // });

    }, [positions, latestPrice, handleClosePosition, toast]);

    const handleUpdatePosition = useCallback((positionId: string, updates: Partial<Pick<Position, 'stopLoss' | 'takeProfit'>>) => {
        setPositions(prev => prev.map(p => p.id === positionId ? { ...p, ...updates } : p));
         toast({
            title: "Trade Updated",
            description: `SL/TP for trade ${positionId} has been updated.`,
        });
    }, [toast]);
    
    const value = {
        positions: livePositions,
        closedPositions,
        balance,
        equity,
        totalPnl,
        handleTrade,
        handleClosePosition,
        handleBulkClosePositions,
        handleUpdatePosition
    };

    return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
}

export function useTradeState() {
    const context = useContext(TradeContext);
    if (context === undefined) {
        throw new Error('useTradeState must be used within a TradeProvider');
    }
    return context;
}
