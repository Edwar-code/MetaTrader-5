
'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import AccountSummary from './AccountSummary';
import BottomNav from './BottomNav';
import Header from './Header';
import PositionsList from './PositionsList';
import InstallPrompt from './InstallPrompt';
import { useTradeState } from '@/context/TradeContext';
import { CircleDollarSign, X, Play, Timer } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Position } from '@/lib/types';

export default function TradingPage() {
  const { positions, equity, balance, margin, freeMargin, marginLevel, handleTrade, handleClosePosition, handleBulkClosePositions } = useTradeState();
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [isLiquidationActive, setIsLiquidationActive] = useState(false);
  const { toast } = useToast();

  const hasOpenPositions = positions.length > 0;

  const totalProfit = useMemo(() => {
    return positions.reduce((acc, pos) => acc + pos.pnl, 0);
  }, [positions]);

  const accountSummary = useMemo(() => {
    return {
      balance: balance.toFixed(2),
      equity: equity.toFixed(2),
      margin: margin.toFixed(2),
      freeMargin: freeMargin.toFixed(2),
      marginLevel: marginLevel.toFixed(2),
    };
  }, [balance, equity, margin, freeMargin, marginLevel]);
  
  // MASTER STOP LOSS: This is now independent of the bot.
  useEffect(() => {
    const equityThreshold = 7.00;
    if (equity <= equityThreshold && !isLiquidationActive && positions.length > 0) {
      setIsLiquidationActive(true); // Prevent this from running multiple times
      console.log(`CRITICAL: Equity at $${equity.toFixed(2)}. Closing all positions.`);
      handleBulkClosePositions('all');
      
      if (isBotRunning) {
        setIsBotRunning(false);
      }
      
      toast({
        title: 'Account Protection Triggered',
        description: `All positions closed to prevent further loss. Equity hit $${equity.toFixed(2)}.`,
        variant: 'destructive',
      });
    } else if (equity > equityThreshold) {
        setIsLiquidationActive(false); // Reset if equity recovers
    }
  }, [equity, handleBulkClosePositions, toast, isBotRunning, isLiquidationActive, positions.length]);


  const runBotCycle = useCallback(async () => {
    // If the bot is told to run while in a critical state, prevent it.
    if (equity <= 7.00) {
        console.log("Bot run prevented due to low equity.");
        setIsBotRunning(false);
        return;
    }
      
    console.log('Running Bot Cycle...');

    const positionsCopy: Position[] = JSON.parse(JSON.stringify(positions));

    const currentTotalPnl = positionsCopy.reduce((acc, pos) => acc + pos.pnl, 0);
    const profitTarget = 10; // $10 profit target

    // Rule 1: Check for overall profit target first.
    if (currentTotalPnl >= profitTarget) {
        handleBulkClosePositions('all');
        return; // Stop this cycle after taking action.
    }
    
    // Rule 2: Check for individual loss cutting
    for (const pos of positionsCopy) {
      if (pos.pnl <= -200) {
        handleClosePosition(pos.id);
        return; // Stop this cycle after taking an action
      }
    }
    
    // Risk Management: Calculate current total size of all open positions
    const totalLotSize = positionsCopy.reduce((sum, pos) => sum + pos.size, 0);
    // A simplified risk check: assume 1 lot requires ~$2000 margin for this example
    const usedMargin = totalLotSize * 2000;
    const maxRiskEquity = equity * 0.80;

    // Rule 3: Randomly decide to open a new trade if we have capacity
    // 40% chance to open a new trade each cycle if not over risk limit.
    const shouldOpenNewTrade = Math.random() < 0.4;

    if (shouldOpenNewTrade && usedMargin < maxRiskEquity) {
        const action = Math.random() < 0.5 ? 'BUY' : 'SELL';
        
        // Random lot size between 0.03 and 0.20
        const lotSize = parseFloat((Math.random() * (0.20 - 0.03) + 0.03).toFixed(2));
        
        const pair = 'frxXAUUSD'; // Default to Gold

        await handleTrade({
            pair: pair,
            type: action,
            size: lotSize,
        });
    }

  }, [positions, equity, handleClosePosition, handleTrade, handleBulkClosePositions]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBotRunning) {
      // Run the first cycle immediately
      runBotCycle();
      setCountdown(600);
      
      timer = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            runBotCycle();
            return 600; // Reset countdown to 10 minutes
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBotRunning, runBotCycle]);

  const handleRunBot = () => {
    if (equity <= 7.00) {
        toast({
            title: 'Cannot Start Bot',
            description: 'Your account equity is too low to run the bot.',
            variant: 'destructive',
        });
        return;
    }
    setIsBotRunning(true);
  };
  
  const handleDisableBot = () => {
      setIsBotRunning(false);
      toast({
        title: 'Bot Disabled',
        description: 'The bot has been turned off.',
      });
  }
  
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }


  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <Header totalProfit={totalProfit.toFixed(2)} hasOpenPositions={hasOpenPositions} />
      <div className="flex-1 overflow-y-auto pb-24">
        <AccountSummary data={accountSummary} hasOpenPositions={hasOpenPositions} />
        {hasOpenPositions ? (
          <PositionsList positions={positions} />
        ) : (
          <div className="border-t"></div>
        )}
        <InstallPrompt />
      </div>
      <div className="absolute bottom-20 right-4 z-20 group">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-2">
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-28"
              onClick={handleDisableBot}
              disabled={!isBotRunning}
            >
              <X className="mr-2 h-4 w-4" /> Disable
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full w-28"
              onClick={handleRunBot}
              disabled={isBotRunning || isLiquidationActive}
            >
              <Play className="mr-2 h-4 w-4" /> Run Bot
            </Button>
          </div>
          <Button
            size="icon"
            className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg"
          >
            {isBotRunning ? (
                <div className="flex flex-col items-center justify-center">
                  <Timer className="h-5 w-5" />
                  <span className="text-xs font-bold">{formatCountdown(countdown)}</span>
                </div>
            ) : (
              <CircleDollarSign className="h-7 w-7" />
            )}
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
