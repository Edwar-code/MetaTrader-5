import { z } from 'zod';

export interface Position {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  openTime: number; // epoch
  stopLoss?: number;
  takeProfit?: number;
}

export interface ClosedPosition extends Position {
  closePrice: number;
  closeTime: number; // epoch
}

// Zod schema for a single position passed to the AI
const TradePositionSchema = z.object({
  id: z.string(),
  pair: z.string(),
  type: z.enum(['BUY', 'SELL']),
  size: z.number(),
  entryPrice: z.number(),
  currentPrice: z.number(),
  pnl: z.number(),
  openTime: z.number(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
});

// Zod schema for the input to the trade decision flow
export const TradeDecisionInputSchema = z.object({
  balance: z.number().describe('The current account balance.'),
  equity: z.number().describe('The current account equity (balance + P/L).'),
  positions: z.array(TradePositionSchema).describe('An array of all currently open trading positions.'),
  marketContext: z.string().describe('A summary of the current market structure, trends, news, and key price levels for the asset being traded (XAUUSD).'),
});
export type TradeDecisionInput = z.infer<typeof TradeDecisionInputSchema>;

// Zod schema for the output of the trade decision flow
export const TradeDecisionOutputSchema = z.object({
  action: z.enum(['BUY', 'SELL', 'HOLD']).describe("The trading action to take. 'HOLD' means do nothing."),
  pair: z.string().default('frxXAUUSD').describe("The trading pair for the action. Default to 'frxXAUUSD'."),
  lotSize: z.number().describe("The volume of the trade in lots. This should be 0 if action is 'HOLD'."),
  stopLoss: z.number().optional().describe('The price at which to set the stop loss. Must be calculated based on risk management rules.'),
  takeProfit: z.number().optional().describe('The price at which to set the take profit.'),
  reason: z.string().describe('A brief explanation for the chosen action, mentioning the patterns or logic used.'),
});
export type TradeDecisionOutput = z.infer<typeof TradeDecisionOutputSchema>;
