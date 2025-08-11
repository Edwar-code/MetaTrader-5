import type { Position } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { MoreHorizontal } from 'lucide-react';
import PositionItem from './PositionItem';
import { AnalysisDrawer } from './AnalysisDrawer';
import { Button } from '../ui/button';

interface PositionsListProps {
  positions: Position[];
}

export default function PositionsList({ positions }: PositionsListProps) {
  return (
    <div>
      <div className="px-4 py-[2px] border-t border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] text-muted-foreground font-semibold">Positions</span>
          <AnalysisDrawer positions={positions}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </AnalysisDrawer>
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
