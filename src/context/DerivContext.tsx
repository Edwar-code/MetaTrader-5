
'use client';

import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef, useMemo } from "react";
import DerivAPI from '@deriv/deriv-api';

// #region Types
export interface RunningTrade {
    contract_id: number;
    buy_price: number;
    longcode: string;
    start_time: number;
    asset: string; 
    tradeType: 'CALL' | 'PUT' | 'DIGITEVEN' | 'DIGITODD' | 'DIGITOVER' | 'DIGITUNDER' | 'DIGITMATCH' | 'DIGITDIFF' | 'ONETOUCH' | 'NOTOUCH' | 'EXPIRYRANGE' | 'EXPIRYMISS';
    entry_spot: number | null;
}

interface Balance {
    value: number;
    currency: string;
}

export interface ActiveSymbol {
    display_name: string;
    symbol: string;
    market: string;
    market_display_name: string;
    submarket: string;
    submarket_display_name: string;
}

export interface Candle {
    epoch: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface CompletedTrade {
    contract_id: number;
    longcode: string;
    symbol: string;
    contract_type: 'CALL' | 'PUT' | 'DIGITEVEN' | 'DIGITODD' | 'ONETOUCH' | 'NOTOUCH' | 'EXPIRYRANGE' | 'EXPIRYMISS' | 'DIGITOVER' | 'DIGITUNDER' | 'DIGITMATCH' | 'DIGITDIFF';
    buy_price: number;
    sell_price: number;
    profit_loss: number;
    start_time: number;
    end_time: number;
    entry_spot: number | null;
    exit_spot: number | null;
    exit_tick_time: number | null;
    transaction_id?: number;
    asset?: string; // Added for chartMarkers
    isRunning?: boolean; // Added for chartMarkers
}

export interface Tick {
    epoch: number;
    quote: number;
    symbol: string;
}

export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected' | 'expired';

// #endregion

// #region State Context
interface DerivState {
    connectionState: 'connecting' | 'connected' | 'disconnected';
    isAuthenticated: boolean;
    activeSymbols: ActiveSymbol[];
    subscribeToTicks: (symbol: string, count?: number) => void;
    subscribeToCandles: (symbol: string, granularity: number, count?: number) => void;
    unsubscribeFromChart: () => void;
    getTicks: (symbol: string, count: number) => Promise<Tick[]>;
    getHistory: (symbol: string, count: number, granularity: number) => Promise<Candle[]>;
    ticks: Tick[];
    chartError: string | null;
    latestPrice: { [symbol: string]: number };
}

const DerivStateContext = createContext<DerivState | undefined>(undefined);
// #endregion

// #region Chart Context
interface DerivChartState {
    candles: Candle[];
}
const DerivChartContext = createContext<DerivChartState | undefined>(undefined);
// #endregion


export function DerivProvider({ children }: { children: ReactNode }) {
    const apiRef = useRef<DerivAPI | null>(null);
    const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeSymbols, setActiveSymbols] = useState<ActiveSymbol[]>([]);
    const [ticks, setTicks] = useState<Tick[]>([]);
    const [candles, setCandles] = useState<Candle[]>([]);
    const [chartError, setChartError] = useState<string | null>(null);
    const [latestPrice, setLatestPrice] = useState<{ [symbol: string]: number }>({});
    
    const chartSubscription = useRef<any>(null);
    
    const { toast } = useToast();

    const unsubscribeFromChart = useCallback(() => {
        if (chartSubscription.current) {
            try {
                chartSubscription.current.unsubscribe();
            } catch (e) {
                // Ignore errors on unsubscribe
            }
            chartSubscription.current = null;
        }
    }, []);

    const disconnect = useCallback(() => {
        unsubscribeFromChart();
        if (apiRef.current) {
            apiRef.current.basic.disconnect();
        }
        apiRef.current = null;
        setConnectionState('disconnected');
        setIsAuthenticated(false);
        setTicks([]);
        setCandles([]);
    }, [unsubscribeFromChart]);

    useEffect(() => {
        const APP_ID = 96239;
        const api = new DerivAPI({ app_id: APP_ID });
        apiRef.current = api;
        
        const connect = async () => {
            setConnectionState('connecting');
            try {
                // Check for existing token
                const token = typeof window !== 'undefined' ? localStorage.getItem('deriv_api_token') : null;
                if (token) {
                    try {
                        await api.basic.authorize({ authorize: token });
                        setIsAuthenticated(true);
                    } catch (authError) {
                        console.warn("Deriv auth failed with token:", authError);
                        // If token is invalid, clear it and proceed without auth
                        localStorage.removeItem('deriv_api_token');
                        localStorage.removeItem('deriv_account_id');
                        setIsAuthenticated(false);
                    }
                }

                const symbolsResponse = await api.basic.activeSymbols({ active_symbols: 'brief', product_type: 'basic' });
                if (symbolsResponse.error) {
                    throw new Error(symbolsResponse.error.message);
                }

                if (symbolsResponse.active_symbols) {
                    setActiveSymbols(symbolsResponse.active_symbols);
                }
                setConnectionState('connected');
            } catch (e: any) {
                console.error("Deriv connection failed:", e);
                const errorMessage = e instanceof Error ? e.message : String(e);
                toast({ title: "Connection Failed", description: errorMessage || "An unknown error occurred.", variant: "destructive" });
                setConnectionState('disconnected');
            }
        };

        connect();

        return () => {
            disconnect();
        };
    }, [toast, disconnect]);

    const subscribeToTicks = useCallback(async (symbol: string, count = 100) => {
        const api = apiRef.current;
        if (!api || connectionState !== 'connected') return;
        unsubscribeFromChart();
        setTicks([]);
        setCandles([]);
        setChartError(null);

        try {
            const historyResponse = await api.basic.ticksHistory({
                ticks_history: symbol, adjust_start_time: 1, count: count,
                end: "latest", style: "ticks",
            });

            if (historyResponse.error) {
                setChartError(historyResponse.error.message);
                return;
            }
            if (historyResponse.history) {
                const { history } = historyResponse;
                const formattedTicks = history.prices.map((price: any, index: number) => ({
                    epoch: history.times[index], quote: parseFloat(price), symbol: symbol,
                }));
                setTicks(formattedTicks);
                if (formattedTicks.length > 0) {
                    setLatestPrice(prev => ({...prev, [symbol]: formattedTicks[formattedTicks.length - 1].quote}));
                }
            }
            
            chartSubscription.current = await api.basic.subscribe({ ticks: symbol });
            chartSubscription.current.subscribe((response: any) => {
                if (response.error) {
                    setChartError(response.error.message);
                    unsubscribeFromChart();
                    return;
                }
                if (response.tick) {
                    const { tick } = response;
                    const newTick = { epoch: tick.epoch, quote: parseFloat(tick.quote), symbol: tick.symbol };
                    setLatestPrice(prev => ({...prev, [tick.symbol]: newTick.quote}));
                    setTicks(prevTicks => {
                        const updatedTicks = [...prevTicks, newTick];
                        return updatedTicks.slice(Math.max(updatedTicks.length - 200, 0));
                    });
                }
            });
        } catch (e: any) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            setChartError(errorMessage || 'Failed to load chart data.');
        }
    }, [connectionState, unsubscribeFromChart]);

    const subscribeToCandles = useCallback(async (symbol: string, granularity: number, count = 500) => {
        const api = apiRef.current;
        if (!api || connectionState !== 'connected') return;
        unsubscribeFromChart();
        setTicks([]);
        setCandles([]);
        setChartError(null);

        try {
            const historyResponse = await api.basic.ticksHistory({
                ticks_history: symbol, adjust_start_time: 1, count: count,
                end: 'latest', style: 'candles', granularity,
            });

            if (historyResponse.error) {
                setChartError(historyResponse.error.message);
                return;
            }
            if (historyResponse.candles) {
                 const parsedCandles = historyResponse.candles.map((c: any) => ({
                    epoch: c.epoch,
                    open: parseFloat(c.open),
                    high: parseFloat(c.high),
                    low: parseFloat(c.low),
                    close: parseFloat(c.close),
                }));
                const uniqueCandles = Array.from(new Map(parsedCandles.map((c: Candle) => [c.epoch, c])).values());
                setCandles(uniqueCandles);
                 if (uniqueCandles.length > 0) {
                    setLatestPrice(prev => ({...prev, [symbol]: uniqueCandles[uniqueCandles.length - 1].close}));
                }
            }
            
            chartSubscription.current = await api.basic.subscribe({ ticks_history: symbol, style: 'candles', granularity, end: 'latest', adjust_start_time: 1 });
            chartSubscription.current.subscribe((response: any) => {
                if (response.error) {
                    setChartError(response.error.message);
                    unsubscribeFromChart();
                    return;
                }
                if (response.ohlc) {
                    const ohlc = response.ohlc;
                    const newCandle: Candle = {
                        epoch: ohlc.open_time,
                        open: parseFloat(ohlc.open),
                        high: parseFloat(ohlc.high),
                        low: parseFloat(ohlc.low),
                        close: parseFloat(ohlc.close),
                    };

                    setLatestPrice(prev => ({...prev, [symbol]: newCandle.close}));

                    setCandles(prevCandles => {
                        const existingIndex = prevCandles.findIndex(c => c.epoch === newCandle.epoch);
                        if (existingIndex !== -1) {
                            const updatedCandles = [...prevCandles];
                            updatedCandles[existingIndex] = newCandle;
                            return updatedCandles;
                        } else {
                            const updatedCandles = [...prevCandles, newCandle];
                            return updatedCandles.slice(Math.max(updatedCandles.length - (count * 2), 0));
                        }
                    });
                }
            });
        } catch (e: any) {
             const errorMessage = e instanceof Error ? e.message : String(e);
            setChartError(errorMessage || 'Failed to load chart data.');
        }
    }, [connectionState, unsubscribeFromChart]);

    const getTicks = useCallback(async (symbol: string, count: number): Promise<Tick[]> => {
        const api = apiRef.current;
        if (!api) throw new Error("Not connected");

        try {
            const historyResponse = await api.basic.ticksHistory({
                ticks_history: symbol,
                adjust_start_time: 1,
                count: count,
                end: "latest",
                style: "ticks",
            });

            if (historyResponse.error) {
                throw new Error(historyResponse.error.message);
            }

            if (historyResponse.history) {
                const { history } = historyResponse;
                const formattedTicks = history.prices.map((price: any, index: number) => ({
                    epoch: history.times[index],
                    quote: parseFloat(price),
                    symbol: symbol,
                }));
                return formattedTicks;
            }
            return [];
        } catch (e: any) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            toast({ title: "Tick History Error", description: errorMessage || 'Failed to fetch tick history.', variant: "destructive" });
            throw new Error(errorMessage);
        }
    }, [toast]);
    
    const getHistory = useCallback(async (symbol: string, count: number, granularity: number): Promise<Candle[]> => {
        const api = apiRef.current;
        if (!api) throw new Error("Not connected");

        try {
            const historyResponse = await api.basic.ticksHistory({
                ticks_history: symbol,
                adjust_start_time: 1,
                count: count,
                end: "latest",
                style: "candles",
                granularity,
            });

            if (historyResponse.error) {
                throw new Error(historyResponse.error.message);
            }

            if (historyResponse.candles) {
                return historyResponse.candles.map((c: any) => ({
                    epoch: c.epoch,
                    open: parseFloat(c.open),
                    high: parseFloat(c.high),
                    low: parseFloat(c.low),
                    close: parseFloat(c.close),
                }));
            }
            return [];
        } catch (e: any) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error(`History fetch error for ${symbol}: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    }, []);


    const stateValue = useMemo(() => ({
        connectionState, isAuthenticated, activeSymbols,
        subscribeToTicks, subscribeToCandles, unsubscribeFromChart,
        getTicks, getHistory, ticks, chartError,
        latestPrice
    }), [connectionState, isAuthenticated, activeSymbols, subscribeToTicks, subscribeToCandles, unsubscribeFromChart, getTicks, getHistory, ticks, chartError, latestPrice]);

    const chartValue = useMemo(() => ({
        candles
    }), [candles]);


    return (
        <DerivStateContext.Provider value={stateValue}>
            <DerivChartContext.Provider value={chartValue}>
                {children}
            </DerivChartContext.Provider>
        </DerivStateContext.Provider>
    );
}

export function useDerivState() {
    const context = useContext(DerivStateContext);
    if (context === undefined) {
        throw new Error('useDerivState must be used within a DerivProvider');
    }
    return context;
}

export function useDerivChart() {
    const context = useContext(DerivChartContext);
    if (context === undefined) {
        throw new Error('useDerivChart must be used within a DerivProvider');
    }
    return context;
}

    