'use server';

import { analyzePositions, type AnalyzePositionsInput } from '@/ai/flows/analyze-positions';
import { makeTradeDecision } from '@/ai/flows/trade-decision-flow';
import type { Position, TradeDecisionInput, TradeDecisionOutput } from '@/lib/types';

// This function adapts the AI flow input to match the new Position type
export async function getAnalysis(positions: Position[]) {
  try {
    const analysisInput: AnalyzePositionsInput = positions.map(p => ({
      symbol: p.pair,
      type: p.type,
      volume: p.size.toString(),
      openPrice: p.entryPrice.toString(),
      currentPrice: p.currentPrice.toString(),
      profit: p.pnl.toString(),
    }));

    const result = await analyzePositions(analysisInput);
    return { success: true, analysis: result.analysis };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return { success: false, error: 'Failed to get analysis from AI.' };
  }
}

export async function tradeDecision(input: TradeDecisionInput): Promise<{ success: boolean, decision?: TradeDecisionOutput, error?: string }> {
    try {
        const result = await makeTradeDecision(input);
        return { success: true, decision: result };
    } catch (error: any) {
        console.error('AI Trade Decision Error:', error);
        return { success: false, error: error.message || 'Failed to get trade decision from AI.' };
    }
}
