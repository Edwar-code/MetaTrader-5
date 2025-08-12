export interface Position {
  symbol: string;
  type: string;
  volume: string;
  openPrice: string;
  currentPrice: string;
  profit: string;
}

export const positions: Position[] = [
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 363.04', currentPrice: '3 363.58', profit: '-5.40' },
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 362.88', currentPrice: '3 363.58', profit: '-7.00' },
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 362.99', currentPrice: '3 363.58', profit: '-5.90' },
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 362.92', currentPrice: '3 363.58', profit: '-6.60' },
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 362.89', currentPrice: '3 363.58', profit: '-6.90' },
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 362.97', currentPrice: '3 363.58', profit: '-6.10' },
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 362.79', currentPrice: '3 363.58', profit: '-7.90' },
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 362.79', currentPrice: '3 363.58', profit: '-7.90' },
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 362.78', currentPrice: '3 363.58', profit: '-8.00' },
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 362.78', currentPrice: '3 363.58', profit: '-8.00' },
  { symbol: 'XAUUSD', type: 'sell', volume: '0.10', openPrice: '3 362.78', currentPrice: '3 363.58', profit: '-8.00' },
];

export const accountSummary = {
    balance: '1 489.02',
    equity: '1 330.72',
    margin: '1 412.39',
    freeMargin: '-81.67',
    marginLevel: '94.22',
    totalProfit: '-158.30'
};
