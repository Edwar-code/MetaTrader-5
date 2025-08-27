'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import AccountSummary from './AccountSummary';
import BottomNav from './BottomNav';
import Header from './Header';
import PositionsList from './PositionsList';
import InstallPrompt from './InstallPrompt';
import { useTradeState } from '@/context/TradeContext';
import { Separator } from '../ui/separator';
import { Bot, X, Play } from 'lucide-react';
import { Button } from '../ui/button';
import { tradeDecision } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Position } from '@/lib/types';


export default function TradingPage() {
  const { positions, equity, balance, totalPnl, handleTrade } = useTradeState();
  const [showFab, setShowFab] = useState(true);
  const [isBotRunning, setIsBotRunning] = useState(false);
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
    if (!isBotRunning) return;

    console.log('Running AI Bot Cycle...');
    toast({
        title: "🤖 AI Bot Running",
        description: "Analyzing market and making decisions...",
    });

    try {
        const result = await tradeDecision({
            balance: balance,
            equity: equity,
            positions: positions.map(p => ({
                pair: p.pair,
                type: p.type,
                size: p.size,
                entryPrice: p.entryPrice,
                currentPrice: p.currentPrice,
                pnl: p.pnl,
                openTime: p.openTime,
                stopLoss: p.stopLoss,
                takeProfit: p.takeProfit,
                id: p.id
            })),
            marketContext: "Gold is currently in a strong uptrend after a brief consolidation. Key resistance at 2350, support at 2320. Economic data suggests potential for further upside."
        });

        if (result.success && result.decision) {
            const { action, pair, lotSize, stopLoss, takeProfit, reason } = result.decision;
            
            toast({
                title: `🤖 AI Bot Action: ${action}`,
                description: reason,
            });

            if (action === "BUY" || action === "SELL") {
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
                title: "🤖 AI Bot Error",
                description: result.error || "Could not make a trade decision.",
                variant: "destructive"
            });
        }
    } catch (e) {
        console.error("Bot cycle error:", e);
        toast({
            title: "🤖 AI Bot Crashed",
            description: "An unexpected error occurred during the bot cycle.",
            variant: "destructive"
        });
    }
  }, [isBotRunning, balance, equity, positions, handleTrade, toast]);

  useEffect(() => {
    if (isBotRunning) {
        const interval = setInterval(runBotCycle, 15000); // Run every 15 seconds
        return () => clearInterval(interval);
    }
  }, [isBotRunning, runBotCycle]);


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
                 <div 
                    className="flex flex-col items-center gap-2 transition-all duration-300 ease-in-out scale-0 group-hover:scale-100 origin-bottom"
                  >
                     <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full w-28"
                        onClick={() => {
                          setIsBotRunning(false);
                          setShowFab(false);
                          toast({ title: 'Bot Disabled', description: 'The AI bot has been turned off.'});
                        }}
                     >
                        <X className="mr-2 h-4 w-4" /> Disable
                     </Button>
                     <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full w-28"
                        onClick={() => {
                          setIsBotRunning(true);
                          toast({ title: 'Bot Enabled', description: 'The AI bot will now trade automatically.'});
                        }}
                     >
                        <Play className="mr-2 h-4 w-4" /> Run Bot
                     </Button>
                  </div>
                  <Button
                    size="icon"
                    className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg"
                  >
                    <Bot className="h-7 w-7" />
                  </Button>
              </div>
          </div>
      )}
      <BottomNav />
    </div>
  );
}
