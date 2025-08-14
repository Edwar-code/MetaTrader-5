
export interface Position {
  symbol: string;
  type: string;
  volume: string;
  openPrice: string;
  currentPrice: string;
  profit: string;
  date: string;
  id: string;
  sl: string;
  tp: string;
  swap: string;
}

export const accountSummary = {
  balance: '10000.00',
  equity: '9947.10',
  margin: '850.00',
  freeMargin: '9097.10',
  marginLevel: '1170.25',
  totalProfit: '-52.90',
};

export const sampleCandleData = [
  { epoch: 1718082000, open: 2310.5, high: 2312.8, low: 2309.1, close: 2311.2 },
  { epoch: 1718085600, open: 2311.2, high: 2315.4, low: 2310.9, close: 2314.8 },
  { epoch: 1718089200, open: 2314.8, high: 2316.1, low: 2313.5, close: 2315.5 },
  { epoch: 1718092800, open: 2315.5, high: 2318.9, low: 2315.0, close: 2318.2 },
  { epoch: 1718096400, open: 2318.2, high: 2320.0, low: 2317.5, close: 2319.9 },
  { epoch: 1718100000, open: 2319.9, high: 2321.3, low: 2319.0, close: 2320.7 },
  { epoch: 1718103600, open: 2320.7, high: 2322.5, low: 2319.8, close: 2322.1 },
  { epoch: 1718107200, open: 2322.1, high: 2325.0, low: 2321.5, close: 2324.5 },
  { epoch: 1718110800, open: 2324.5, high: 2326.8, low: 2323.9, close: 2325.3 },
  { epoch: 1718114400, open: 2325.3, high: 2325.5, low: 2322.1, close: 2323.0 },
  { epoch: 1718118000, open: 2323.0, high: 2324.2, low: 2320.8, close: 2321.7 },
  { epoch: 1718121600, open: 2321.7, high: 2323.6, low: 2321.0, close: 2322.9 },
  { epoch: 1718125200, open: 2322.9, high: 2328.0, low: 2322.5, close: 2327.4 },
  { epoch: 1718128800, open: 2327.4, high: 2330.1, low: 2326.8, close: 2329.5 },
  { epoch: 1718132400, open: 2329.5, high: 2331.2, low: 2328.7, close: 2330.9 },
  { epoch: 1718136000, open: 2330.9, high: 2333.0, low: 2330.1, close: 2332.5 },
  { epoch: 1718139600, open: 2332.5, high: 2332.8, low: 2329.8, close: 2330.5 },
  { epoch: 1718143200, open: 2330.5, high: 2331.9, low: 2329.0, close: 2331.8 },
];
