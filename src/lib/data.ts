export interface Position {
  symbol: string;
  type: string;
  volume: string;
  openPrice: string;
  currentPrice: string;
  profit: string;
}

// NOTE: This data is now static and primarily for layout purposes.
// The dynamic chart data comes from the DerivContext.
export const positions: Position[] = [];

export const accountSummary = {
    balance: '0.00',
    equity: '0.00',
    margin: '0.00',
    freeMargin: '0.00',
    marginLevel: '0.00',
    totalProfit: '0.00'
};
