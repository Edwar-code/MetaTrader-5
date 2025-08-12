'use server';

import { analyzePositions, type AnalyzePositionsInput } from '@/ai/flows/analyze-positions';

export async function getAnalysis(positions: AnalyzePositionsInput) {
  try {
    const result = await analyzePositions(positions);
    return { success: true, analysis: result.analysis };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return { success: false, error: 'Failed to get analysis from AI.' };
  }
}
