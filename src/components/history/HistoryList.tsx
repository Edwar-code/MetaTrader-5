
import type { ClosedPosition } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import HistoryItem from './HistoryItem';
import { format } from 'date-fns';

interface HistoryListProps {
  positions: ClosedPosition[];
}

export default function HistoryList({ positions }: HistoryListProps) {
  if (positions.length === 0) {
    return null;
  }

  return (
    <div className="overflow-y-auto">
      {positions.map((position, index) => (
        <div key={position.id}>
          <HistoryItem position={position} />
          {index < positions.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
