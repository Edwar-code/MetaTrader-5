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
  {
    symbol: 'USDJPY',
    type: 'buy',
    volume: '0.02',
    openPrice: '157.200',
    currentPrice: '157.350',
    profit: '3.00',
  },
  {
    symbol: 'AUDUSD',
    type: 'sell',
    volume: '0.08',
    openPrice: '0.66500',
    currentPrice: '0.66450',
    profit: '4.00',
  },
  {
    symbol: 'USDCAD',
    type: 'buy',
    volume: '0.15',
    openPrice: '1.37200',
    currentPrice: '1.37100',
    profit: '-15.00',
  },
  {
    symbol: 'USDCHF',
    type: 'sell',
    volume: '0.03',
    openPrice: '0.90100',
    currentPrice: '0.90000',
    profit: '3.30',
  },
  {
    symbol: 'NZDUSD',
    type: 'buy',
    volume: '0.07',
    openPrice: '0.61200',
    currentPrice: '0.61250',
    profit: '3.50',
  },
  {
    symbol: 'EURJPY',
    type: 'sell',
    volume: '0.01',
    openPrice: '168.500',
    currentPrice: '168.200',
    profit: '2.00',
  },
  {
    symbol: 'GBPJPY',
    type: 'buy',
    volume: '0.04',
    openPrice: '199.100',
    currentPrice: '198.900',
    profit: '-8.00',
  },
  {
    symbol: 'EURAUD',
    type: 'sell',
    volume: '0.06',
    openPrice: '1.61200',
    currentPrice: '1.61000',
    profit: '8.00',
  },
  {
    symbol: 'AUDJPY',
    type: 'buy',
    volume: '0.09',
    openPrice: '104.500',
    currentPrice: '104.600',
    profit: '9.00',
  },
  {
    symbol: 'XAGUSD',
    type: 'buy',
    volume: '0.20',
    openPrice: '29.50',
    currentPrice: '29.20',
    profit: '-60.00',
  },
  {
    symbol: 'BTCUSD',
    type: 'buy',
    volume: '0.01',
    openPrice: '67500.00',
    currentPrice: '67800.00',
    profit: '30.00',
  },
  {
    symbol: 'ETHUSD',
    type: 'sell',
    volume: '0.10',
    openPrice: '3550.00',
    currentPrice: '3540.00',
    profit: '10.00',
  }
];

export const accountSummary = {
    balance: '10000.00',
    equity: '9989.10',
    margin: '850.00',
    freeMargin: '9139.10',
    marginLevel: '1175.19',
    totalProfit: '-10.90'
};
