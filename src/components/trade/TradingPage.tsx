
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
  const [isLiquidationActive, setIsLiquidationActive] = useState(false);
  const { toast } = useToast();

  const hasOpenPositions = positions.length > 0;

  const totalProfit = useMemo(() => {
    return positions.reduce((acc, pos) => acc + pos.pnl, 0);
  }, [positions]);

  const formatNumberWithSpaces = (num: number) => {
    const [integer, decimal] = num.toFixed(2).split('.');
    return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${decimal}`;
  };

  const accountSummary = useMemo(() => {
    return {
      balance: formatNumberWithSpaces(balance),
      equity: formatNumberWithSpaces(equity),
      margin: formatNumberWithSpaces(margin),
      freeMargin: formatNumberWithSpaces(freeMargin),
      marginLevel: formatNumberWithSpaces(marginLevel),
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


  // Continuous bot cycle logic
  useEffect(() => {
    const runBotCycle = async () => {
      // If the bot is told to run while in a critical state, prevent it.
      if (equity <= 7.00) {
          console.log("Bot run prevented due to low equity.");
          if (isBotRunning) setIsBotRunning(false);
          return;
      }
      
      console.log('Running Bot Cycle...');
      const botPositions = positions.filter(p => !p.id.startsWith('preset_'));
      const botTotalPnl = botPositions.reduce((acc, pos) => acc + pos.pnl, 0);
      const profitTarget = 10; // $10 profit target

      // Rule 1: Check for bot's overall profit target. If met, close all bot positions.
      // This will cause the useEffect to run again, and the next condition will open a new trade.
      if (botTotalPnl >= profitTarget) {
          console.log(`Profit target of $${profitTarget} reached for bot trades. Closing bot positions.`);
          handleBulkClosePositions('all', true); // true to exclude presets
          return;
      }
      
      // Rule 2: If there are no open bot positions, open a single new one.
      if (botPositions.length === 0) {
          console.log("No open bot positions. Opening a new trade.");
          await handleTrade({
              pair: 'frxXAUUSD',
              type: 'BUY',
              size: 0.1,
          });
      }
      
      // If bot positions are open but profit target is not met, do nothing and wait for next position change.
      console.log("Bot positions are open, waiting for profit target.");
    };

    if (isBotRunning) {
      runBotCycle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBotRunning, positions]);


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

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <Header totalProfit={formatNumberWithSpaces(totalProfit)} hasOpenPositions={hasOpenPositions} balance={accountSummary.balance} />
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
                  <Timer className="h-5 w-5 animate-spin" />
                  <span className="text-xs font-bold">ON</span>
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
