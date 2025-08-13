'use client';

import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef, useMemo } from "react";
// import DerivAPI from '@deriv/deriv-api';

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
    subscribeToTicks: (symbol: string) => void;
    subscribeToCandles: (symbol: string, granularity: number) => void;
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


export function DerivProvider({ children }: { children: ReactNode }) {
    // const apiRef = useRef<DerivAPI | null>(null);
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
    // const [activeToken, setActiveToken] = useState<string | null>(null);
    const [areLogsCleared, setAreLogsCleared] = useState(false);
    const [chartError, setChartError] = useState<string | null>("Deriv API connection is offline."); // Set initial error
    const [proofOfAddressStatus, setProofOfAddressStatus] = useState<VerificationStatus | null>(null);
    
    // const chartSubscription = useRef<any>(null);
    // const balanceSubscription = useRef<any>(null);
    // const openContractsSubscription = useRef<any>(null);
    // const transactionSubscription = useRef<any>(null);
    
    const { toast } = useToast();

    const clearProfitTable = useCallback(() => {
        setProfitTable([]);
    }, []);

    const restoreProfitTable = useCallback(async () => {
       // No-op
    }, []);

    const unsubscribeFromChart = useCallback(() => {
        // No-op
    }, []);
    
    const switchAccount = useCallback(() => {
        // No-op
    }, []);
    
    const resetDemoBalance = useCallback(async () => {
        // No-op
    }, []);

    const buyContract = useCallback(async (parameters: any) => {
        toast({ title: "Offline", description: "Cannot place trades while offline.", variant: "destructive" });
        return { error: { message: "Offline" }};
    }, [toast]);
    
    const refetchBalance = useCallback(async () => {
        // No-op
    }, []);

    const subscribeToTicks = useCallback(async (symbol: string) => {
        // No-op
    }, []);

    const subscribeToCandles = useCallback(async (symbol: string, granularity: number) => {
        // No-op
    }, []);

    const getTicks = useCallback(async (symbol: string, count: number): Promise<Tick[]> => {
        return [];
    }, []);


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
