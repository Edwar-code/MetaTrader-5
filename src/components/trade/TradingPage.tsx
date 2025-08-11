import { accountSummary, positions } from '@/lib/data';
import AccountSummary from './AccountSummary';
import BottomNav from './BottomNav';
import Header from './Header';
import PositionsList from './PositionsList';

export default function TradingPage() {
  return (
    <div className="relative flex flex-col h-screen w-full max-w-sm bg-card shadow-lg">
      <Header totalProfit={accountSummary.totalProfit} />
      <div className="flex-1 overflow-y-auto pb-16">
        <AccountSummary data={accountSummary} />
        <PositionsList positions={positions} />
      </div>
      <BottomNav />
    </div>
  );
}
