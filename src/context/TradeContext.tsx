
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
    margin: number;
    freeMargin: number;
    marginLevel: number;
    totalPnl: number;
    handleTrade: (trade: Omit<Position, 'id' | 'currentPrice' | 'pnl' | 'entryPrice' | 'openTime'>, customEntryPrice?: number) => Promise<boolean>;
    handleClosePosition: (positionId: string, customClosePrice?: number) => void;
    handleBulkClosePositions: (filter: 'all' | 'profitable' | 'losing', excludePresets?: boolean) => void;
    handleUpdatePosition: (positionId: string, updates: Partial<Pick<Position, 'stopLoss' | 'takeProfit'>>) => void;
    addPresetTrade: (tradeData: Omit<Position, 'id' | 'currentPrice' | 'pnl'>) => void;
}

const TradeContext = createContext<TradeState | undefined>(undefined);

const LEVERAGE = 3000;

const getContractSize = (pair: string): number => {
    if (pair.includes('XAU')) return 100; // Gold
    if (pair.includes('BTC')) return 1; // Bitcoin
    return 100; // Default for forex
};

const gentKingstonAccountId = '40311301 — FBS-Real';

const accountInitialData: { [key: string]: { balance: number, positions: Position[] } } = {
    [gentKingstonAccountId]: { balance: 756.67, positions: [] },
    '40776538 — FBS-Real': { balance: 240.45, positions: [] },
    '40256784 — FBS-Real': { balance: 456.46, positions: [] },
};

export function TradeProvider({ children }: { children: ReactNode }) {
    const [positions, setPositions] = useState<Position[]>([]);
    const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [activeAccountId, setActiveAccountId] = useState<string>('');

    const { latestPrice, getTicks } = useDerivState();
    const { toast } = useToast();

    useEffect(() => {
        const handleStorageChange = () => {
            const storedAccountJson = localStorage.getItem('active_account');
            const newAccountId = storedAccountJson ? JSON.parse(storedAccountJson).number : gentKingstonAccountId;
            
            if (newAccountId !== activeAccountId) {
                // Save current state before switching if there's an old account ID
                if (activeAccountId) {
                    const currentState = {
                        balance,
                        positions,
                        closedPositions
                    };
                    localStorage.setItem(`account_state_${activeAccountId}`, JSON.stringify(currentState));
                }

                // Load new account state
                const newStateJson = localStorage.getItem(`account_state_${newAccountId}`);
                if (newStateJson) {
                    const newState = JSON.parse(newStateJson);
                    setBalance(newState.balance);
                    setPositions(newState.positions);
                    setClosedPositions(newState.closedPositions);
                } else {
                    // First time loading this account, use initial data
                    const initialData = accountInitialData[newAccountId] || { balance: 100, positions: [] };
                    setBalance(initialData.balance);
                    setPositions(initialData.positions);
                    setClosedPositions([]);
                }
                setActiveAccountId(newAccountId);
            }
        };

        // Initial load
        handleStorageChange();

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage', handleStorageChange);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeAccountId]);

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

    const margin = useMemo(() => {
        return livePositions.reduce((acc, pos) => {
            const contractSize = getContractSize(pos.pair);
            const marketPrice = pos.entryPrice;
            const positionMargin = (pos.size * contractSize * marketPrice) / LEVERAGE;
            return acc + positionMargin;
        }, 0);
    }, [livePositions]);

    const freeMargin = useMemo(() => equity - margin, [equity, margin]);
    const marginLevel = useMemo(() => (margin > 0 ? (equity / margin) * 100 : 0), [equity, margin]);


    useEffect(() => {
        if (Object.keys(latestPrice).length === 0 || positions.length === 0) return;
        
        const checkPositions = () => {
            positions.forEach(pos => {
                if (pos.id.startsWith('preset_')) return;

                const currentPrice = latestPrice[pos.pair];
                if (!currentPrice) return;

                const hasHitStopLoss = pos.stopLoss && (
                    (pos.type === 'BUY' && currentPrice <= pos.stopLoss) || 
                    (pos.type === 'SELL' && currentPrice >= pos.stopLoss)
                );
                
                if (hasHitStopLoss) {
                    handleClosePosition(pos.id, pos.stopLoss);
                    return; 
                }
                
                const hasHitTakeProfit = pos.takeProfit && (
                    (pos.type === 'BUY' && currentPrice >= pos.takeProfit) || 
                    (pos.type === 'SELL' && currentPrice >= pos.takeProfit)
                );

                if (hasHitTakeProfit) {
                    handleClosePosition(pos.id, pos.takeProfit);
                }
            });
        };
        
        checkPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestPrice]);

    const handleTrade = useCallback(async (trade: Omit<Position, 'id' | 'currentPrice' | 'pnl' | 'entryPrice' | 'openTime'>, customEntryPrice?: number): Promise<boolean> => {
        try {
            let entryPrice = customEntryPrice;

            if (!entryPrice) {
                const ticks = await getTicks(trade.pair, 1);
                entryPrice = ticks.length > 0 ? ticks[0].quote : latestPrice[trade.pair];
            }


            if (!entryPrice || entryPrice <= 0) {
                 toast({
                    title: "Market Closed",
                    description: "Cannot place trade, price data is not available.",
                    variant: "destructive"
                });
                return false;
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
            return true;
        } catch (error: any) {
             toast({
                title: "Trade Failed",
                description: error.message || "Could not fetch latest price to open trade.",
                variant: "destructive"
            });
            return false;
        }
    }, [getTicks, latestPrice, toast]);

    const addPresetTrade = useCallback((tradeData: Omit<Position, 'id' | 'currentPrice' | 'pnl'>) => {
        const newPosition: Position = {
            ...tradeData,
            id: `preset_${new Date().getTime()}`,
            currentPrice: tradeData.entryPrice,
            pnl: 0,
        };
        setPositions(prev => [...prev, newPosition]);
        toast({
            title: "Preset Trade Added",
            description: `${tradeData.type} ${tradeData.size} ${tradeData.pair} at ${tradeData.entryPrice} has been added.`,
        });
    }, [toast]);

    const handleClosePosition = useCallback((positionId: string, customClosePrice?: number) => {
        setPositions(prev => {
            const positionToClose = prev.find(p => p.id === positionId);
            if (!positionToClose) return prev;

            const closePrice = customClosePrice || latestPrice[positionToClose.pair] || positionToClose.currentPrice;

            if (!closePrice || closePrice <= 0) {
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

            return prev.filter(p => p.id !== positionId);
        });
    }, [latestPrice]);

    const handleBulkClosePositions = useCallback((filter: 'all' | 'profitable' | 'losing', excludePresets = false) => {
        let positionsToClose: Position[] = [];
        const currentPositions = positions.map(pos => {
            const currentPrice = latestPrice[pos.pair] || pos.currentPrice;
            const pnl = calculatePnl(pos, currentPrice);
            return { ...pos, pnl };
        });
        
        currentPositions.forEach(pos => {
            if (excludePresets && pos.id.startsWith('preset_')) {
                return;
            }

            if (filter === 'all') {
                positionsToClose.push(pos);
            } else if (filter === 'profitable' && pos.pnl >= 0) {
                positionsToClose.push(pos);
            } else if (filter === 'losing' && pos.pnl < 0) {
                positionsToClose.push(pos);
            }
        });

        if (positionsToClose.length === 0) {
            return;
        }

        positionsToClose.forEach(pos => {
            handleClosePosition(pos.id, latestPrice[pos.pair] || pos.currentPrice);
        });
    }, [positions, latestPrice, handleClosePosition]);

    const handleUpdatePosition = useCallback((positionId: string, updates: Partial<Pick<Position, 'stopLoss' | 'takeProfit'>>) => {
        setPositions(prev => prev.map(p => p.id === positionId ? { ...p, ...updates } : p));
    }, []);
    
    const value = {
        positions: livePositions,
        closedPositions,
        balance,
        equity,
        margin,
        freeMargin,
        marginLevel,
        totalPnl,
        handleTrade,
        handleClosePosition,
        handleBulkClosePositions,
        handleUpdatePosition,
        addPresetTrade
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
