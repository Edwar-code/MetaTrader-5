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
export const positions: Position[] = [
  {
    symbol: 'XAUUSD',
    type: 'buy',
    volume: '0.01',
    openPrice: '2330.50',
    currentPrice: '2331.80',
    profit: '1.30',
  },
  {
    symbol: 'EURUSD',
    type: 'sell',
    volume: '0.10',
    openPrice: '1.07150',
    currentPrice: '1.07100',
    profit: '5.00',
  },
  {
    symbol: 'GBPUSD',
    type: 'buy',
    volume: '0.05',
    openPrice: '1.26500',
    currentPrice: '1.26400',
    profit: '-5.00',
  },
];

export const accountSummary = {
    balance: '10000.00',
    equity: '9996.30',
    margin: '150.00',
    freeMargin: '9846.30',
    marginLevel: '6664.20',
    totalProfit: '-3.70'
};
