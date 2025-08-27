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
import { tradeDecision } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export default function TradingPage() {
  const { positions, equity, balance, totalPnl, handleTrade, handleClosePosition } = useTradeState();
  const [showFab, setShowFab] = useState(true);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const { toast } = useToast();

  const hasOpenPositions = positions.length > 0;

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
    console.log('Running AI Bot Cycle...');
    toast({
      title: '🤖 AI Bot Analyzing...',
      description: 'The bot is analyzing the market for opportunities.',
    });

    // Rule: Close trades with 20% profit
    const equityToConsider = equity > 0 ? equity : 1; // Avoid division by zero
    positions.forEach(pos => {
      const profitPercentage = (pos.pnl / equityToConsider) * 100;
      if (profitPercentage >= 20) {
        toast({
            title: `🤖 Taking Profit!`,
            description: `Closing position #${pos.id.substring(0, 6)} with ${profitPercentage.toFixed(2)}% profit.`
        });
        handleClosePosition(pos.id);
      }
    });

    try {
      const result = await tradeDecision({
        balance: balance,
        equity: equity,
        positions: positions.map(p => ({
          id: p.id,
          pair: p.pair,
          type: p.type,
          size: p.size,
          entryPrice: p.entryPrice,
          currentPrice: p.currentPrice,
          pnl: p.pnl,
          openTime: p.openTime,
          stopLoss: p.stopLoss,
          takeProfit: p.takeProfit,
        })),
        marketContext:
          'Gold is currently in a strong uptrend after a brief consolidation. Key resistance at 2350, support at 2320. Economic data suggests potential for further upside.',
      });

      if (result.success && result.decision) {
        const { action, pair, lotSize, stopLoss, takeProfit, reason } =
          result.decision;

        toast({
          title: `🤖 AI Bot Action: ${action}`,
          description: reason,
        });

        if (action === 'BUY' || action === 'SELL') {
          await handleTrade({
            pair: pair,
            type: action,
            size: lotSize,
            stopLoss,
            takeProfit,
          });
        }
      } else {
        toast({
          title: '🤖 AI Bot Error',
          description: result.error || 'Could not make a trade decision.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error('Bot cycle error:', e);
      toast({
        title: '🤖 AI Bot Crashed',
        description: 'An unexpected error occurred during the bot cycle.',
        variant: 'destructive',
      });
    }
  }, [equity, positions, balance, handleClosePosition, handleTrade, toast]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBotRunning) {
      timer = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            runBotCycle();
            return 15; // Reset countdown
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
      description: 'The AI bot will now trade automatically.',
    });
    // Immediately run the first cycle
    runBotCycle();
    setCountdown(15);
  };
  
  const handleDisableBot = () => {
      setIsBotRunning(false);
      setShowFab(false);
      toast({
        title: 'Bot Disabled',
        description: 'The AI bot has been turned off and the button is hidden.',
      });
  }

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <Header totalProfit={totalPnl.toFixed(2)} hasOpenPositions={hasOpenPositions} />
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
                    <span className="text-xs font-bold">{countdown}s</span>
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
