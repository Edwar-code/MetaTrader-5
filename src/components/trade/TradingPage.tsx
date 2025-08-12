import { accountSummary, positions } from '@/lib/data';
import AccountSummary from './AccountSummary';
import BottomNav from './BottomNav';
import Header from './Header';
import PositionsList from './PositionsList';
import InstallPrompt from './InstallPrompt';

export default function TradingPage() {
  return (
      <Header totalProfit={accountSummary.totalProfit} />
      <div className="flex-1 overflow-y-auto pb-16">
        <InstallPrompt />
        <AccountSummary data={accountSummary} />
        <PositionsList positions={positions} />
      </div>
      <BottomNav />
    </div>
  );
}
