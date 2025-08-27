'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import AccountSummary from './AccountSummary';
import BottomNav from './BottomNav';
import Header from './Header';
import PositionsList from './PositionsList';
import InstallPrompt from './InstallPrompt';
import { useTradeState } from '@/context/TradeContext';
import { Bot, X, Play, Timer } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Position } from '@/lib/types';

export default function TradingPage() {
  const { positions, equity, balance, handleTrade, handleClosePosition } = useTradeState();
  const [showFab, setShowFab] = useState(true);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const { toast } = useToast();

  const hasOpenPositions = positions.length > 0;

  const totalProfit = useMemo(() => {
    return positions.reduce((acc, pos) => acc + pos.pnl, 0);
  }, [positions]);

  const accountSummary = useMemo(() => {
    return {
      balance: balance.toFixed(2),
      equity: equity.toFixed(2),
      margin: '0.00',
      freeMargin: equity.toFixed(2),
      marginLevel: '0.00',
    };
  }, [balance, equity]);

  const runBotCycle = useCallback(async () => {
    console.log('Running Bot Cycle...');
    toast({
      title: '🤖 Bot Analyzing...',
      description: 'The bot is checking for trade actions.',
    });

    const positionsCopy: Position[] = JSON.parse(JSON.stringify(positions));

    // Rule 1 & 2: Check for profit taking or loss cutting first
    for (const pos of positionsCopy) {
      if (pos.pnl >= 100) {
        toast({
            title: `🤖 Taking Profit!`,
            description: `Closing position #${pos.id.substring(0, 6)} with $${pos.pnl.toFixed(2)} profit.`
        });
        handleClosePosition(pos.id);
        return; // Stop this cycle after taking an action
      }
      if (pos.pnl <= -200) {
        toast({
            title: `🤖 Cutting Loss!`,
            description: `Closing position #${pos.id.substring(0, 6)} at $${pos.pnl.toFixed(2)} loss.`
        });
        handleClosePosition(pos.id);
        return; // Stop this cycle after taking an action
      }
    }

    // Rule 3: If no positions were closed and no positions are open, open a new one
    if (positionsCopy.length === 0) {
        const action = Math.random() < 0.5 ? 'BUY' : 'SELL';
        
        // Simple risk management: 0.01 lots for every $1000 in equity.
        const lotSize = Math.max(0.01, Math.floor(equity / 1000) * 0.01);
        const pair = 'frxXAUUSD'; // Default to Gold

        toast({
            title: `🤖 Placing New Trade!`,
            description: `Action: ${action}, Size: ${lotSize}, Pair: ${pair}`
        });

        await handleTrade({
            pair: pair,
            type: action,
            size: lotSize,
        });
    } else {
         toast({ title: "🤖 Bot Holding", description: "Monitoring open positions." });
    }

  }, [positions, equity, handleClosePosition, handleTrade, toast]);

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
    setIsBotRunning(true);
    toast({
      title: 'Bot Enabled',
      description: 'The AI bot will now trade automatically every 10 minutes.',
    });
  };
  
  const handleDisableBot = () => {
      setIsBotRunning(false);
      setShowFab(false);
      toast({
        title: 'Bot Disabled',
        description: 'The bot has been turned off and the button is hidden.',
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
      {showFab && (
        <div className="absolute bottom-20 right-4 z-20 group">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2 transition-all duration-300 ease-in-out scale-0 group-hover:scale-100 origin-bottom">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white rounded-full w-28"
                onClick={handleDisableBot}
              >
                <X className="mr-2 h-4 w-4" /> Disable
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white rounded-full w-28"
                onClick={handleRunBot}
                disabled={isBotRunning}
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
                <Bot className="h-7 w-7" />
              )}
            </Button>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
