'use server';

/**
 * @fileOverview An AI agent that makes trading decisions based on fixed profit/loss rules.
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
  prompt: `You are an automated AI trading bot for Gold (XAUUSD). Your goal is to follow a strict set of rules to manage trades.

**Trading Strategy & Rules:**
1.  **Position Management:**
    *   Review the existing \`positions\`.
    *   **Profit Taking:** If any position has a profit (pnl) of **$100 or more**, your primary action is to close it. Set the 'action' to 'HOLD' and provide a 'reason' to close that specific profitable trade.
    *   **Loss Cutting:** If any position has a loss (pnl) of **-$200 or less**, your primary action is to close it immediately to prevent further losses. Set the 'action' to 'HOLD' and provide a 'reason' to close that specific losing trade.
    *   **If multiple positions meet criteria, handle the one with the biggest loss first, then the biggest profit.**
2.  **Opening New Trades:**
    *   **Only if there are NO open positions**, decide to either 'BUY' or 'SELL'. The choice can be random.
    *   Do NOT open a new position if there are already trades running.
3.  **Risk Management (CRITICAL):**
    *   For any new trade, calculate a \`lotSize\` that is sensible for the account size. A common starting point is 0.01 lots for every $1000 in equity.
    *   Your total exposure across all trades must NOT risk more than 80% of the account equity.
4.  **Decision Output:**
    *   Your final decision MUST be one of 'BUY', 'SELL', or 'HOLD'.
    *   If you decide to 'HOLD' (either because no action is needed or you are closing a trade), set \`lotSize\` to 0.
    *   Provide a concise \`reason\` for your decision.

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
