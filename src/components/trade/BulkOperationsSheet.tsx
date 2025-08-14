
'use client';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '../ui/separator';
import type { Position } from '@/lib/types';
import { useTradeState } from '@/context/TradeContext';
import { useMemo } from 'react';

interface BulkOperationsSheetProps {
  children: React.ReactNode;
  positions: Position[];
}

const OperationButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <SheetClose asChild>
    <button onClick={onClick} className="w-full text-left py-4 px-4 text-card-foreground hover:bg-muted text-[17px]">
      {label}
    </button>
  </SheetClose>
);

export function BulkOperationsSheet({ children, positions }: BulkOperationsSheetProps) {
  const { handleBulkClosePositions } = useTradeState();

  const positionStats = useMemo(() => {
    const hasProfit = positions.some(p => p.pnl >= 0);
    const hasLoss = positions.some(p => p.pnl < 0);
    return { hasProfit, hasLoss };
  }, [positions]);

  if (positions.length === 0) {
    // Return the trigger but nothing to do if no positions
    return <>{children}</>;
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg h-auto p-0 bg-card data-[state=open]:animate-none data-[state=closed]:animate-none">
        <SheetHeader className="text-center pt-3 pb-2 px-4">
          <SheetTitle className="text-sm font-normal text-muted-foreground">Bulk Operations</SheetTitle>
        </SheetHeader>
        <Separator />
        <div className="flex flex-col">
          <OperationButton label="Close All Positions" onClick={() => handleBulkClosePositions('all')} />
          {positionStats.hasLoss && (
            <OperationButton label="Close Losing Positions" onClick={() => handleBulkClosePositions('losing')} />
          )}
           {positionStats.hasProfit && (
            <OperationButton label="Close Profitable Positions" onClick={() => handleBulkClosePositions('profitable')} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
