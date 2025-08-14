'use server';

import { analyzePositions, type AnalyzePositionsInput } from '@/ai/flows/analyze-positions';
import type { Position } from '@/lib/types';

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
