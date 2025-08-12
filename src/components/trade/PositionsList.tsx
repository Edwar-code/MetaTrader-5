import type { Position } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { SpacedMoreHorizontalIcon } from './icons';
import PositionItem from './PositionItem';
import { Button } from '../ui/button';
import { BulkOperationsSheet } from './BulkOperationsSheet';

interface PositionsListProps {
  positions: Position[];
}

export default function PositionsList({ positions }: PositionsListProps) {
  return (
    <div>
      <div className="px-4 py-[1.7px] border-t border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] text-muted-foreground font-semibold">Positions</span>
          <BulkOperationsSheet>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <SpacedMoreHorizontalIcon />
            </Button>
          </BulkOperationsSheet>
        </div>
      </div>
      <div className="overflow-y-auto">
        {positions.map((position, index) => (
          <div key={index}>
            <PositionItem position={position} />
            {index < positions.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </div>
  );
}
