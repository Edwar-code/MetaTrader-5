import type { ClosedPosition } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import HistoryItem from './HistoryItem';
import { format } from 'date-fns';

interface HistoryListProps {
  positions: ClosedPosition[];
}

export default function HistoryList({ positions }: HistoryListProps) {
  if (positions.length === 0) {
    return <Separator />;
  }

  // Use a fixed date for display as per the request
  const displayDate = '2025.09.06 14:56:57';
  const totalProfit = positions.reduce((acc, pos) => acc + pos.pnl, 0);

  return (
    <div>
      <div className="px-4 py-[1.7px] border-t border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] text-muted-foreground font-semibold">Balance</span>
           <div className="flex items-center text-[13.5px] text-muted-foreground font-semibold">
             <span>{displayDate}</span>
           </div>
        </div>
      </div>
      <div className="px-4 py-2 text-right">
        <span className="text-lg font-bold text-foreground">
            {totalProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </span>
      </div>
      <div className="overflow-y-auto">
        {positions.map((position, index) => (
          <div key={position.id}>
            <HistoryItem position={position} />
            {index < positions.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </div>
  );
}
