'use server';

/**
 * @fileOverview A sophisticated AI agent that analyzes market data and account status to make autonomous trading decisions.
 *
 * - makeTradeDecision - The primary function that powers the trading bot.
 */

import { ai } from '@/ai/genkit';
import { TradeDecisionInputSchema, type TradeDecisionInput, TradeDecisionOutputSchema, type TradeDecisionOutput } from '@/lib/types';

export async function makeTradeDecision(input: TradeDecisionInput): Promise<TradeDecisionOutput> {
  return tradeDecisionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tradeDecisionPrompt',
  input: { schema: TradeDecisionInputSchema },
  output: { schema: TradeDecisionOutputSchema },
  prompt: `You are an expert AI trading bot for Gold (XAUUSD). Your goal is to grow the account steadily by making autonomous, logical trading decisions based on the provided data.

**Trading Strategy & Rules:**
1.  **Market Analysis:** Analyze the provided \`marketContext\` to understand the current trend, support/resistance levels, and overall market sentiment. Identify patterns like trend continuations, reversals, or breakouts.
2.  **Position Management:**
    *   Review existing \`positions\`.
    *   If a position has a reasonable profit and the market shows signs of reversal, consider closing it (by recommending the opposite trade or holding).
    *   If a position is in a deep loss and the initial strategy is clearly failing, cut losses.
    *   Avoid opening new positions if the market is too volatile or unclear.
3.  **Risk Management (CRITICAL):**
    *   Your total exposure across all trades must NOT risk more than 80% of the account equity.
    *   For any new trade, calculate a \`lotSize\` that is sensible for the account size. A common starting point is 0.01 lots for every $1000 in equity, but you can adjust based on confidence.
    *   ALWAYS set a \`stopLoss\`. A good stop loss is typically placed just below a recent support level for a BUY, or just above a recent resistance level for a SELL.
    *   Set a \`takeProfit\` at a logical level, like the next major resistance (for BUYs) or support (for SELLs). Aim for at least a 1:1.5 risk-to-reward ratio.
4.  **Decision Output:**
    *   Your final decision MUST be one of 'BUY', 'SELL', or 'HOLD'.
    *   If you decide to 'HOLD', set \`lotSize\` to 0.
    *   Provide a concise \`reason\` for your decision, explaining the strategy.

**Current Account Status:**
*   Balance: \${{{balance}}}
*   Equity: \${{{equity}}}

**Open Positions:**
{{#if positions.length}}
  {{#each positions}}
-   **{{type}} {{size}} {{pair}}** at {{entryPrice}} (P/L: \${{pnl}})
  {{/each}}
{{else}}
-   No open positions.
{{/if}}

**Market Context:**
> {{{marketContext}}}

Based on all the above information, what is your next move?`,
});

const tradeDecisionFlow = ai.defineFlow(
  {
    name: 'tradeDecisionFlow',
    inputSchema: TradeDecisionInputSchema,
    outputSchema: TradeDecisionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
