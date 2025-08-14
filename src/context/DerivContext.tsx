
'use client';

import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef, useMemo } from "react";
import DerivAPI from '@deriv/deriv-api';
import { useTrade, TradeProvider } from "./TradeContext";

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
    balance: Balance | null;
    profitTable: CompletedTrade[];
    activeSymbols: ActiveSymbol[];
    buyContract: (params: any) => Promise<any>;
    refetchBalance: () => void;
    isAuthenticated: boolean;
    subscribeToTicks: (symbol: string, count?: number) => void;
    subscribeToCandles: (symbol: string, granularity: number, count?: number) => void;
    unsubscribeFromChart: () => void;
    fullname: string | null;
    email: string | null;
    accountId: string | null;
    switchAccount: ((newAccountId: string, newToken: string) => void) | null,
    getTicks: (symbol: string, count: number) => Promise<Tick[]>;
    ticks: Tick[];
    clearProfitTable: () => void;
    restoreProfitTable: () => Promise<void>;
    areLogsCleared: boolean;
    chartError: string | null;
    runningTrades: RunningTrade[];
    setRunningTrades: React.Dispatch<React.SetStateAction<RunningTrade[]>>;
    proofOfAddressStatus: VerificationStatus | null;
    resetDemoBalance: (() => Promise<void>) | null;
}

const DerivStateContext = createContext<DerivState | undefined>(undefined);
// #endregion

// #region Chart Context
interface DerivChartState {
    candles: Candle[];
}
const DerivChartContext = createContext<DerivChartState | undefined>(undefined);
// #endregion


function DerivProviderContent({ children }: { children: ReactNode }) {
    const apiRef = useRef<DerivAPI | null>(null);
    const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [balance, setBalance] = useState<Balance | null>(null);
    const [profitTable, setProfitTable] = useState<CompletedTrade[]>([]);
    const [runningTrades, setRunningTrades] = useState<RunningTrade[]>([]);
    const [activeSymbols, setActiveSymbols] = useState<ActiveSymbol[]>([]);
    const [ticks, setTicks] = useState<Tick[]>([]);
    const [candles, setCandles] = useState<Candle[]>([]);
    const [fullname, setFullname] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [activeToken, setActiveToken] = useState<string | null>(null);
    const [areLogsCleared, setAreLogsCleared] = useState(false);
    const [chartError, setChartError] = useState<string | null>(null);
    const [proofOfAddressStatus, setProofOfAddressStatus] = useState<VerificationStatus | null>(null);
    const { updatePositions } = useTrade();
    
    const chartSubscription = useRef<any>(null);
    const tickSubscription = useRef<any>(null);
    const balanceSubscription = useRef<any>(null);
    const openContractsSubscription = useRef<any>(null);
    const transactionSubscription = useRef<any>(null);
    
    const { toast } = useToast();

    // This useEffect sets up a 1-second interval to continuously update positions.
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (connectionState === 'connected' && ticks.length > 0) {
                const lastTick = ticks[ticks.length - 1];
                updatePositions(lastTick.quote, lastTick.symbol);
            }
        }, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [ticks, connectionState, updatePositions]);


    const clearProfitTable = useCallback(() => {
        localStorage.setItem('deriv_trade_logs_cleared', 'true');
        setAreLogsCleared(true);
        setProfitTable([]);
    }, []);

    const restoreProfitTable = useCallback(async () => {
        const api = apiRef.current;
        if (!api) return;
        localStorage.removeItem('deriv_trade_logs_cleared');
        setAreLogsCleared(false);
        toast({ title: "Restoring...", description: "Fetching trade history from Deriv." });
        try {
            const profitTableResponse = await api.basic.profitTable({ limit: 25, description: 1, sort: "DESC" });
            if (profitTableResponse.error) throw new Error(profitTableResponse.error.message);
            if (profitTableResponse.profit_table?.transactions) {
                 const initialTrades: CompletedTrade[] = profitTableResponse.profit_table.transactions.map((t: any) => {
                    const entrySpot = parseFloat(t.entry_spot);
                    const exitSpot = parseFloat(t.exit_tick);
                    return {
                        contract_id: t.contract_id, longcode: t.longcode, symbol: t.symbol, contract_type: t.contract_type,
                        buy_price: parseFloat(t.buy_price), sell_price: parseFloat(t.sell_price),
                        profit_loss: parseFloat(t.sell_price) - parseFloat(t.buy_price),
                        start_time: t.purchase_time, end_time: t.sell_time, 
                        entry_spot: !isNaN(entrySpot) ? entrySpot : null,
                        exit_spot: !isNaN(exitSpot) ? exitSpot : null,
                        exit_tick_time: t.exit_tick_time || t.sell_time,
                        transaction_id: t.transaction_id,
                    }
                });
                setProfitTable(initialTrades);
            }
        } catch (e: any) {
             toast({ title: "Error", description: "Could not restore trade logs.", variant: "destructive" });
             setAreLogsCleared(true);
             localStorage.setItem('deriv_trade_logs_cleared', 'true');
        }
    }, [toast]);

    const handleContractUpdate = useCallback((update: any) => {
        const contract = update.proposal_open_contract;
        if (contract && contract.is_sold) {
            setRunningTrades(prev => prev.filter(t => t.contract_id !== contract.contract_id));
            if (contract.balance_after) {
                 setBalance({ value: contract.balance_after, currency: contract.currency });
            }
        }
    }, []);

    const handleTransactionUpdate = useCallback((update: any) => {
        const transaction = update.transaction;
        if (transaction && transaction.action === 'sell') {
            const contractId = transaction.contract_id;

            setProfitTable(prev => {
                const newTable = [...prev];
                const existingTradeIndex = newTable.findIndex(t => t.contract_id === contractId);

                if (existingTradeIndex > -1) {
                    const existingTrade = newTable[existingTradeIndex];
                    
                    existingTrade.sell_price = parseFloat(transaction.amount);
                    existingTrade.profit_loss = parseFloat(transaction.amount) - existingTrade.buy_price;
                    existingTrade.exit_spot = parseFloat(transaction.barrier);
                    existingTrade.exit_tick_time = transaction.transaction_time;
                    existingTrade.end_time = transaction.transaction_time;
                    existingTrade.transaction_id = transaction.transaction_id;
                    
                    const isWin = existingTrade.profit_loss >= 0;
                     toast({
                        title: `Trade ${isWin ? 'Won' : 'Lost'}`,
                        description: `P/L: ${existingTrade.profit_loss.toFixed(2)}. Entry: ${existingTrade.entry_spot?.toFixed(4) || 'N/A'}, Exit: ${existingTrade.exit_spot?.toFixed(4) || 'N/A'}.`,
                        variant: isWin ? 'default' : 'destructive',
                        duration: 1000,
                    });

                    return newTable;
                }
                return prev;
            });
        }
    }, [toast]);

    const stableHandleContractUpdate = useCallback(handleContractUpdate, []);
    const stableHandleTransactionUpdate = useCallback(handleTransactionUpdate, [toast]);

    const unsubscribeFromChart = useCallback(() => {
        if (chartSubscription.current) {
            chartSubscription.current.unsubscribe();
            chartSubscription.current = null;
        }
         if (tickSubscription.current) {
            tickSubscription.current.unsubscribe();
            tickSubscription.current = null;
        }
    }, []);

    const disconnect = useCallback(() => {
        unsubscribeFromChart();
        if (balanceSubscription.current) balanceSubscription.current.unsubscribe();
        if (openContractsSubscription.current) openContractsSubscription.current.unsubscribe();
        if (transactionSubscription.current) transactionSubscription.current.unsubscribe();
        
        balanceSubscription.current = null;
        openContractsSubscription.current = null;
        transactionSubscription.current = null;
        apiRef.current = null;

        setConnectionState('disconnected');
        setIsAuthenticated(false);
        setBalance(null);
        setFullname(null);
        setEmail(null);
        setAccountId(null);
        setTicks([]);
        setCandles([]);
        setProofOfAddressStatus(null);
    }, [unsubscribeFromChart]);

    useEffect(() => {
        const initialToken = localStorage.getItem("deriv_api_token");
        setActiveToken(initialToken);
    }, []);
    
    useEffect(() => {
        if (!activeToken) {
             setConnectionState('disconnected');
            return;
        }

        const api = new DerivAPI({ app_id: 96239 });
        apiRef.current = api;
        
        const connect = async () => {
            setConnectionState('connecting');
            const logsClearedInitially = localStorage.getItem('deriv_trade_logs_cleared') === 'true';
            setAreLogsCleared(logsClearedInitially);
            
            try {
                const cachedSymbolsStr = localStorage.getItem('deriv_active_symbols');
                if (cachedSymbolsStr) {
                    try {
                        const cachedSymbols = JSON.parse(cachedSymbolsStr);
                        if (Array.isArray(cachedSymbols) && cachedSymbols.length > 0) setActiveSymbols(cachedSymbols);
                    } catch (e) {
                        localStorage.removeItem('deriv_active_symbols');
                    }
                }

                const authResponse = await api.basic.authorize({ authorize: activeToken });
                if (authResponse.error) throw new Error(authResponse.error.message);
                
                setIsAuthenticated(true);
                setConnectionState('connected');
                setFullname(authResponse.authorize?.fullname || null);
                setEmail(authResponse.authorize?.email || null);
                setAccountId(authResponse.authorize?.loginid || null);
                
                const [balanceResponse, symbolsResponse, profitTableResponse, accountStatusResponse] = await Promise.all([
                    api.basic.balance(),
                    api.basic.activeSymbols({ active_symbols: 'brief', product_type: 'basic' }),
                    logsClearedInitially ? Promise.resolve(null) : api.basic.profitTable({ limit: 25, description: 1, sort: "DESC" }),
                    api.basic.getAccountStatus()
                ]);

                if (accountStatusResponse.get_account_status?.authentication?.document?.status) {
                    setProofOfAddressStatus(accountStatusResponse.get_account_status.authentication.document.status as VerificationStatus);
                } else {
                    setProofOfAddressStatus('none');
                }
                
                if (balanceResponse.balance) setBalance({ value: balanceResponse.balance.balance, currency: balanceResponse.balance.currency });
                if(symbolsResponse.active_symbols) {
                    setActiveSymbols(symbolsResponse.active_symbols);
                    localStorage.setItem('deriv_active_symbols', JSON.stringify(symbolsResponse.active_symbols));
                }
                
                if (profitTableResponse?.profit_table?.transactions) {
                    const initialTrades: CompletedTrade[] = profitTableResponse.profit_table.transactions.map((t: any) => ({
                        contract_id: t.contract_id, longcode: t.longcode, symbol: t.symbol, contract_type: t.contract_type,
                        buy_price: parseFloat(t.buy_price), sell_price: parseFloat(t.sell_price),
                        profit_loss: parseFloat(t.sell_price) - parseFloat(t.buy_price),
                        start_time: t.purchase_time, end_time: t.sell_time, 
                        entry_spot: parseFloat(t.entry_spot) || null,
                        exit_spot: parseFloat(t.exit_tick) || null,
                        exit_tick_time: t.exit_tick_time || t.sell_time,
                        transaction_id: t.transaction_id,
                    }));
                    setProfitTable(initialTrades);
                } else {
                    setProfitTable([]);
                }

                balanceSubscription.current = await api.basic.subscribe({ balance: 1 });
                balanceSubscription.current.subscribe((response: any) => {
                    if (response.balance) setBalance({ value: response.balance.balance, currency: response.balance.currency });
                });

                openContractsSubscription.current = await api.basic.subscribe({ proposal_open_contract: 1 });
                openContractsSubscription.current.subscribe(stableHandleContractUpdate);

                transactionSubscription.current = await api.basic.subscribe({ transaction: 1 });
                transactionSubscription.current.subscribe(stableHandleTransactionUpdate);

            } catch (e: any) {
                console.error("Deriv connection failed:", e);
                toast({ title: "Connection Failed", description: (e as Error).message || "An unknown error occurred.", variant: "destructive" });
                setIsAuthenticated(false);
                setConnectionState('disconnected');
            }
        };

        connect();

        return () => {
            disconnect();
        };
    }, [activeToken, toast, disconnect, stableHandleContractUpdate, stableHandleTransactionUpdate]);


    const switchAccount = useCallback((newAccountId: string, newToken: string) => {
        if (newAccountId === accountId) return;

        localStorage.setItem('deriv_api_token', newToken);
        localStorage.setItem('deriv_account_id', newAccountId);
        
        setProfitTable([]); 
        setRunningTrades([]);
        setActiveToken( newToken);
        
        toast({
            title: "Switching Account...",
            description: `Connecting to account ${newAccountId}.`
        });
    }, [accountId, toast]);
    
    const resetDemoBalance = useCallback(async () => {
        const api = apiRef.current;
        if (!api || !isAuthenticated || !accountId?.startsWith('VRTC')) {
            toast({
                title: "Action Not Allowed",
                description: "Balance reset is only available for demo accounts.",
                variant: "destructive"
            });
            return;
        }

        toast({ title: "Resetting Balance...", description: "Please wait." });
        
        try {
            const response = await api.basic.topupVirtual();
            if (response.error) {
                throw new Error(response.error.message);
            }
            if (response.topup_virtual) {
                const newBalance = response.topup_virtual.amount;
                const currency = response.topup_virtual.currency;
                setBalance({ value: newBalance, currency: currency });
                toast({
                    title: "Balance Reset Successful!",
                    description: `Your demo account has been topped up to ${newBalance} ${currency}.`
                });
            }
        } catch (e: any) {
             toast({
                title: "Reset Failed",
                description: e.message || "An unknown error occurred.",
                variant: "destructive"
            });
        }
    }, [isAuthenticated, accountId, toast]);

    const buyContract = useCallback(async (parameters: any) => {
        const api = apiRef.current;
        if (!isAuthenticated || !api) throw new Error("Not authenticated");
        
        try {
             const result = await api.basic.buy({buy: parameters.proposal_id, price: parameters.amount});

            if (result.error) {
                let detailedMessage = result.error.message;
                if (result.error.code === 'InsufficientBalance') {
                    detailedMessage = 'Insufficient balance to place this trade.';
                } else if (result.error.details?.field === 'amount' || result.error.code === 'InvalidAmount') {
                    detailedMessage = `Invalid stake amount. ${result.error.message}`;
                }
                throw new Error(detailedMessage);
            }
            
            if (result.buy) {
                const buyInfo = result.buy;
                 const entrySpot = parseFloat(buyInfo.entry_spot);

                const newRunningTrade: RunningTrade = {
                    contract_id: buyInfo.contract_id,
                    buy_price: buyInfo.buy_price,
                    longcode: buyInfo.longcode,
                    start_time: buyInfo.start_time,
                    asset: parameters.symbol,
                    tradeType: parameters.contract_type,
                    entry_spot: !isNaN(entrySpot) ? entrySpot : null,
                };
                setRunningTrades(prev => [newRunningTrade, ...prev]);

                const newTradeForProfitTable: CompletedTrade = {
                    contract_id: buyInfo.contract_id,
                    longcode: buyInfo.longcode,
                    symbol: parameters.symbol,
                    contract_type: parameters.contract_type,
                    buy_price: buyInfo.buy_price,
                    sell_price: 0, 
                    profit_loss: -buyInfo.buy_price, 
                    start_time: buyInfo.start_time,
                    end_time: 0, 
                    entry_spot: !isNaN(entrySpot) ? entrySpot : null,
                    exit_spot: null,
                    exit_tick_time: null,
                    transaction_id: buyInfo.transaction_id,
                };

                 const logsCleared = localStorage.getItem('deriv_trade_logs_cleared') === 'true';
                if (!logsCleared) {
                    setProfitTable(prev => [newTradeForProfitTable, ...prev]);
                }
            }
            
            return result;
        } catch (e: any) {
            toast({ title: "Trade Failed", description: (e as Error).message || 'An unknown error occurred.', variant: "destructive" });
            return { error: e };
        }
    }, [isAuthenticated, toast]);
    
    const refetchBalance = useCallback(async () => {
        const api = apiRef.current;
        if (!isAuthenticated || !api) return;
        try {
            const res: any = await api.basic.balance();
            if (res.balance) {
                setBalance({ value: res.balance.balance, currency: res.balance.currency });
            }
        } catch (e: any) {
            toast({ title: "Error", description: "Could not refetch balance.", variant: "destructive" });
        }
    }, [isAuthenticated, toast]);

    const subscribeToTicks = useCallback(async (symbol: string, count: number = 100) => {
        const api = apiRef.current;
        if (!api) return;
        unsubscribeFromChart();
        setTicks([]);
        setCandles([]);
        setChartError(null);

        try {
            const historyResponse = await api.basic.ticksHistory({
                ticks_history: symbol, adjust_start_time: 1, count,
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
            }
            
            tickSubscription.current = await api.basic.subscribe({ ticks: symbol });
            tickSubscription.current.subscribe((response: any) => {
                if (response.error) {
                    setChartError(response.error.message);
                    unsubscribeFromChart();
                    return;
                }
                if (response.tick) {
                    const { tick } = response;
                    setTicks(prevTicks => {
                        const newTick = { epoch: tick.epoch, quote: parseFloat(tick.quote), symbol: tick.symbol };
                        const updatedTicks = [...prevTicks, newTick];
                        return updatedTicks.slice(Math.max(updatedTicks.length - (count * 2), 0));
                    });
                }
            });
        } catch (e: any) {
            setChartError((e as Error).message || 'Failed to load chart data.');
        }
    }, [unsubscribeFromChart]);

    const subscribeToCandles = useCallback(async (symbol: string, granularity: number, count: number = 100) => {
        const api = apiRef.current;
        if (!api) return;
        unsubscribeFromChart();
        setTicks([]);
        setCandles([]);
        setChartError(null);

        try {
             // Fetch initial history for both candles and ticks
            const [historyResponse, tickHistoryResponse] = await Promise.all([
                api.basic.ticksHistory({
                    ticks_history: symbol, adjust_start_time: 1, count,
                    end: 'latest', style: 'candles', granularity,
                }),
                api.basic.ticksHistory({
                    ticks_history: symbol, adjust_start_time: 1, count: 1,
                    end: "latest", style: "ticks",
                })
            ]);

            if (historyResponse.error) {
                setChartError(historyResponse.error.message);
                return;
            }
             if (tickHistoryResponse.error) {
                // Don't block chart for tick error, just log it
                console.warn("Could not fetch initial tick for candle chart", tickHistoryResponse.error.message);
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
            }
             if (tickHistoryResponse.history) {
                const { history } = tickHistoryResponse;
                const formattedTicks = history.prices.map((price: any, index: number) => ({
                    epoch: history.times[index], quote: parseFloat(price), symbol: symbol,
                }));
                setTicks(formattedTicks);
            }
            
            // Subscribe to candles
            chartSubscription.current = await api.basic.subscribe({ ticks_history: symbol, style: 'candles', granularity, end: 'latest' });
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

             // Subscribe to ticks
            tickSubscription.current = await api.basic.subscribe({ ticks: symbol });
            tickSubscription.current.subscribe((response: any) => {
                if (response.error) {
                    console.warn("Tick stream error on candle chart:", response.error.message);
                    if(tickSubscription.current) tickSubscription.current.unsubscribe();
                    return;
                }
                if (response.tick) {
                    const { tick } = response;
                    setTicks(prevTicks => {
                        const newTick = { epoch: tick.epoch, quote: parseFloat(tick.quote), symbol: tick.symbol };
                        // We only need the last few ticks for live price, not a long history
                        const updatedTicks = [...prevTicks, newTick];
                        return updatedTicks.slice(-5);
                    });
                }
            });

        } catch (e: any) {
            setChartError((e as Error).message || 'Failed to load chart data.');
        }
    }, [unsubscribeFromChart]);

    const getTicks = useCallback(async (symbol: string, count: number): Promise<Tick[]> => {
        const api = apiRef.current;
        if (!api || !isAuthenticated) throw new Error("Not authenticated");

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
            toast({ title: "Tick History Error", description: (e as Error).message || 'Failed to fetch tick history.', variant: "destructive" });
            throw e;
        }
    }, [isAuthenticated, toast]);


    const stateValue = useMemo(() => ({
        connectionState, balance, profitTable,
        activeSymbols, buyContract, refetchBalance, isAuthenticated,
        subscribeToTicks, subscribeToCandles, unsubscribeFromChart,
        fullname, email, getTicks, ticks, clearProfitTable,
        restoreProfitTable, areLogsCleared, chartError,
        accountId, switchAccount, runningTrades, setRunningTrades,
        proofOfAddressStatus, resetDemoBalance,
    }), [connectionState, balance, profitTable, activeSymbols, buyContract, refetchBalance, isAuthenticated, subscribeToTicks, subscribeToCandles, unsubscribeFromChart, fullname, email, getTicks, ticks, clearProfitTable, restoreProfitTable, areLogsCleared, chartError, accountId, switchAccount, runningTrades, proofOfAddressStatus, resetDemoBalance]);

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

export function DerivProvider({ children }: { children: ReactNode }) {
    return (
        // By wrapping with TradeProvider here, DerivProviderContent and its children
        // can access the trade context.
        <TradeProvider>
            <DerivProviderContent>
                {children}
            </DerivProviderContent>
        </TradeProvider>
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
