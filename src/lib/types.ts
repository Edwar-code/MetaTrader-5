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
