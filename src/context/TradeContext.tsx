
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
    updateAccountDetails: (originalAccountId: string, details: { name?: string; balance?: number, number?: string }) => void;
    handleUpdateHistoryItem: (positionId: string, updates: Partial<ClosedPosition>) => void;
}

const TradeContext = createContext<TradeState | undefined>(undefined);

export const useTradeContext = () => {
    const context = useContext(TradeContext);
    if (context === undefined) {
        throw new Error('useTradeContext must be used within a TradeProvider');
    }
    return context;
};


const LEVERAGE = 3000;

const getContractSize = (pair: string): number => {
    if (pair.includes('XAU')) return 100; // Gold
    if (pair.includes('BTC')) return 1; // Bitcoin
    return 100000; // Default for forex
};

const gentKingstonAccountId = '40311301 — HFMarketsSA-Live2';

const initialAccountsData: { [key: string]: { balance: number, positions: Position[], name: string } } = {
    [gentKingstonAccountId]: { balance: 756.67, positions: [], name: 'GENT KINGSTON BUSI' },
    '40776538 — HFMarketsSA-Live2': { balance: 240.45, positions: [], name: 'MARY KARANJA KIMEU' },
    '40256784 — HFMarketsSA-Live2': { balance: 456.46, positions: [], name: 'DENNIS WAITHERA' },
    '40889123 — HFMarketsSA-Live2': { balance: 1205.10, positions: [], name: 'DAVID MWANGI' },
    '40994567 — HFMarketsSA-Live2': { balance: 88.90, positions: [], name: 'SARAH JEPKEMOI' },
    '40112233 — HFMarketsSA-Live2': { balance: 2800.00, positions: [], name: 'BRIAN OMONDI' },
    '40558899 — HFMarketsSA-Live2': { balance: 550.75, positions: [], name: 'PETER KAMAU' },
    '40663344 — HFMarketsSA-Live2': { balance: 180.20, positions: [], name: 'JANE NJERI' },
    '40771122 — HFMarketsSA-Live2': { balance: 3105.50, positions: [], name: 'SAMUEL KIPROTICH' },
    '40334455 — HFMarketsSA-Live2': { balance: 950.00, positions: [], name: 'ALICE WAMBUI' },
    '40445566 — HFMarketsSA-Live2': { balance: 420.30, positions: [], name: 'JAMES OTIENO' },
    '40556677 — HFMarketsSA-Live2': { balance: 1500.85, positions: [], name: 'FAITH MUTUA' },
};

async function generateFakeHistory(getHistory: (symbol: string, count: number, granularity: number) => Promise<any[]>): Promise<ClosedPosition[]> {
    const fakeTrades: ClosedPosition[] = [];
    const assets = ['frxXAUUSD', 'cryBTCUSD', 'frxGBPUSD'];
    const now = Date.now() / 1000;

    for (const asset of assets) {
        try {
            const candles = await getHistory(asset, 96, 900); // 96 candles of 15-min = 24 hours
            if (candles.length < 10) continue;

            for (let i = 5; i < candles.length - 5; i++) {
                const prevCandle = candles[i-1];
                const entryCandle = candles[i];
                const exitCandle = candles[i+1];
                
                // Simple strategy: Look for a dip to buy or peak to sell
                const isDip = entryCandle.low < prevCandle.low && entryCandle.close > entryCandle.open;
                const isPeak = entryCandle.high > prevCandle.high && entryCandle.close < entryCandle.open;

                let trade: ClosedPosition | null = null;
                const lotSize = asset === 'frxXAUUSD' ? 0.05 : (asset === 'cryBTCUSD' ? 0.01 : 0.1);

                if (isDip && Math.random() > 0.7) { // Buy the dip
                    const entryPrice = entryCandle.low;
                    const closePrice = exitCandle.high;
                    const openTime = entryCandle.epoch;
                    
                    const basePosition: Position = {
                        id: `fake_${asset}_buy_${i}`, pair: asset, type: 'BUY', size: lotSize,
                        entryPrice, currentPrice: closePrice, openTime, pnl: 0
                    };
                    const pnl = calculatePnl(basePosition, closePrice);
                    trade = { ...basePosition, closePrice, closeTime: exitCandle.epoch, pnl };
                } else if (isPeak && Math.random() > 0.7) { // Sell the peak
                    const entryPrice = entryCandle.high;
                    const closePrice = exitCandle.low;
                    const openTime = entryCandle.epoch;

                    const basePosition: Position = {
                        id: `fake_${asset}_sell_${i}`, pair: asset, type: 'SELL', size: lotSize,
                        entryPrice, currentPrice: closePrice, openTime, pnl: 0
                    };
                    const pnl = calculatePnl(basePosition, closePrice);
                    trade = { ...basePosition, closePrice, closeTime: exitCandle.epoch, pnl };
                }

                if (trade && Math.abs(trade.pnl) > 0.5) { // Only add meaningful trades
                    fakeTrades.push(trade);
                    if (fakeTrades.length >= 15) break; 
                }
            }
        } catch (error) {
            console.warn(`Could not generate fake history for ${asset}:`, error);
        }
        if (fakeTrades.length >= 15) break;
    }
    
    // Sort by close time descending
    return fakeTrades.sort((a, b) => b.closeTime - a.closeTime);
}

export function TradeProvider({ children }: { children: ReactNode }) {
    const [positions, setPositions] = useState<Position[]>([]);
    const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [activeAccountId, setActiveAccountId] = useState<string>('');

    const { latestPrice, getTicks, getHistory } = useDerivState();
    const { toast } = useToast();

    useEffect(() => {
        const handleStorageChange = async () => {
            const storedAccountJson = localStorage.getItem('active_account');
            const newAccountId = storedAccountJson ? JSON.parse(storedAccountJson).number : gentKingstonAccountId;
            
            if (newAccountId !== activeAccountId) {
                if (activeAccountId) {
                    const currentState = {
                        balance,
                        positions,
                        closedPositions
                    };
                    localStorage.setItem(`account_state_${activeAccountId}`, JSON.stringify(currentState));
                }

                const newStateJson = localStorage.getItem(`account_state_${newAccountId}`);
                if (newStateJson) {
                    const newState = JSON.parse(newStateJson);
                    setBalance(newState.balance);
                    setPositions(newState.positions);
                    
                    if (newState.closedPositions && newState.closedPositions.length > 0) {
                        setClosedPositions(newState.closedPositions);
                    } else {
                        const fakeHistory = await generateFakeHistory(getHistory);
                        setClosedPositions(fakeHistory);
                    }
                } else {
                    const initialData = initialAccountsData[newAccountId] || { balance: 756.67, positions: [], name: 'GENT KINGSTON BUSI' };
                    setBalance(initialData.balance);
                    setPositions(initialData.positions);
                    
                    const fakeHistory = await generateFakeHistory(getHistory);
                    setClosedPositions(fakeHistory);

                    if (typeof window !== 'undefined' && !storedAccountJson) {
                        localStorage.setItem('active_account', JSON.stringify({ name: initialData.name, number: newAccountId, broker: 'HFM Investments Ltd' }));
                        window.dispatchEvent(new CustomEvent('local-storage'));
                    }
                }
                setActiveAccountId(newAccountId);
            }
        };

        handleStorageChange();
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage', handleStorageChange);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeAccountId, getHistory]);


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
        let closedTradeProfit = 0;
        
        setPositions(prev => {
            const positionToClose = prev.find(p => p.id === positionId);
            if (!positionToClose) return prev;

            const closePrice = customClosePrice || latestPrice[positionToClose.pair] || positionToClose.currentPrice;

            if (!closePrice || closePrice <= 0) {
                return prev;
            }

            const finalPnl = calculatePnl(positionToClose, closePrice);
            closedTradeProfit = finalPnl;
            
            const closedPosition: ClosedPosition = {
                ...positionToClose,
                pnl: finalPnl,
                currentPrice: closePrice,
                closePrice: closePrice,
                closeTime: Date.now() / 1000,
            };
            
            // This ensures that the fake history persists
            setClosedPositions(prevClosed => [closedPosition, ...prevClosed]);

            return prev.filter(p => p.id !== positionId);
        });

        setBalance(prevBalance => prevBalance + closedTradeProfit);

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

    const updateAccountDetails = useCallback((originalAccountId: string, details: { name?: string; balance?: number; number?: string }) => {
        const allAccountsJson = localStorage.getItem('all_accounts');
        let allAccounts = allAccountsJson ? JSON.parse(allAccountsJson) : [];
        const accountIndex = allAccounts.findIndex((acc: any) => acc.number === originalAccountId);

        const newNumber = details.number || originalAccountId;

        if (accountIndex !== -1) {
            if (details.name) allAccounts[accountIndex].name = details.name;
            if (details.number) allAccounts[accountIndex].number = details.number;
            if (details.balance !== undefined) allAccounts[accountIndex].balance = details.balance.toFixed(2);
        }
        localStorage.setItem('all_accounts', JSON.stringify(allAccounts));

        // Rename the state in localStorage if the number changed
        if (details.number && originalAccountId !== details.number) {
            const oldStateKey = `account_state_${originalAccountId}`;
            const newStateKey = `account_state_${details.number}`;
            const stateJson = localStorage.getItem(oldStateKey);
            if (stateJson) {
                localStorage.setItem(newStateKey, stateJson);
                localStorage.removeItem(oldStateKey);
            }
        }
        
        // Update active_account if it was the one edited
        const activeAccountJson = localStorage.getItem('active_account');
        if (activeAccountJson) {
            const activeAccount = JSON.parse(activeAccountJson);
            if (activeAccount.number === originalAccountId) {
                if (details.name) activeAccount.name = details.name;
                if (details.number) activeAccount.number = details.number;
                localStorage.setItem('active_account', JSON.stringify(activeAccount));
            }
        }

        const stateKey = `account_state_${newNumber}`;
        const currentStateJson = localStorage.getItem(stateKey);
        let currentState = currentStateJson ? JSON.parse(currentStateJson) : { balance: 0, positions: [], closedPositions: [] };
        
        if (details.balance !== undefined) {
            currentState.balance = details.balance;
            // Optionally clear positions when balance is reset
            currentState.positions = []; 
            currentState.closedPositions = [];
        }
        localStorage.setItem(stateKey, JSON.stringify(currentState));

        if (newNumber === activeAccountId || originalAccountId === activeAccountId) {
            if (details.balance !== undefined) {
                setBalance(details.balance);
                setPositions([]);
                setClosedPositions([]);
            }
             // If active account's ID changed, we need to trigger a context reload
            if(details.number && originalAccountId === activeAccountId) {
                setActiveAccountId(details.number); // This will trigger the useEffect
            }
        }
        
        window.dispatchEvent(new CustomEvent('local-storage'));
        toast({
            title: "Account Updated",
            description: "Account details have been saved.",
        });

    }, [activeAccountId, toast]);
    
    const handleUpdateHistoryItem = useCallback((positionId: string, updates: Partial<ClosedPosition>) => {
        let newBalance = balance;
        setClosedPositions(prev => {
            let originalPnl = 0;
            const newClosedPositions = prev.map(p => {
                if (p.id === positionId) {
                    originalPnl = p.pnl;
                    return { ...p, ...updates };
                }
                return p;
            });

            const updatedPosition = newClosedPositions.find(p => p.id === positionId);
            const pnlChange = (updatedPosition?.pnl ?? originalPnl) - originalPnl;
            newBalance += pnlChange;

            return newClosedPositions;
        });
        setBalance(newBalance);
    }, [balance]);

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
        addPresetTrade,
        updateAccountDetails,
        handleUpdateHistoryItem,
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
