// use server'

/**
 * @fileOverview Provides AI analysis of current trading positions, suggesting actions and highlighting risks.
 *
 * - analyzePositions - Analyzes trading positions and suggests actions.
 * - AnalyzePositionsInput - Input type for the analyzePositions function.
 * - AnalyzePositionsOutput - Return type for the analyzePositions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PositionSchema = z.object({
  symbol: z.string().describe('The symbol of the trading position (e.g., XAUUSD)'),
  type: z.string().describe('The type of the trading position (e.g., buy or sell)'),
  volume: z.string().describe('The volume of the trading position'),
  openPrice: z.string().describe('The opening price of the trading position'),
  currentPrice: z.string().describe('The current price of the trading position'),
  profit: z.string().describe('The profit or loss of the trading position'),
});

const AnalyzePositionsInputSchema = z.array(PositionSchema).describe('An array of trading positions to analyze.');
export type AnalyzePositionsInput = z.infer<typeof AnalyzePositionsInputSchema>;

const AnalyzePositionsOutputSchema = z.object({
  analysis: z.string().describe('An analysis of the current positions, potential actions, and key risk factors.'),
});
export type AnalyzePositionsOutput = z.infer<typeof AnalyzePositionsOutputSchema>;

export async function analyzePositions(input: AnalyzePositionsInput): Promise<AnalyzePositionsOutput> {
  return analyzePositionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePositionsPrompt',
  input: {schema: AnalyzePositionsInputSchema},
  output: {schema: AnalyzePositionsOutputSchema},
  prompt: `You are an AI trading assistant. Analyze the current trading positions and suggest potential actions, highlighting key risk factors.

Positions:
{{#each this}}
- Symbol: {{symbol}}, Type: {{type}}, Volume: {{volume}}, Open Price: {{openPrice}}, Current Price: {{currentPrice}}, Profit: {{profit}}
{{/each}}
`,
});

const analyzePositionsFlow = ai.defineFlow(
  {
    name: 'analyzePositionsFlow',
    inputSchema: AnalyzePositionsInputSchema,
    outputSchema: AnalyzePositionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
