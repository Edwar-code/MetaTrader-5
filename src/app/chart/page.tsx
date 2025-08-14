import ChartPage from '@/components/chart/ChartPage';
import { TradeProvider } from '@/context/TradeContext';

export default function Chart() {
  return (
    <main className="bg-background">
      <TradeProvider>
        <ChartPage />
      </TradeProvider>
    </main>
  );
}
