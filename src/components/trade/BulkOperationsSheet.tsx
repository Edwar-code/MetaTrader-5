
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '../ui/separator';

interface BulkOperationsSheetProps {
  children: React.ReactNode;
}

const OperationButton = ({ label }: { label: string }) => (
  <button className="w-full text-left py-4 px-4 text-card-foreground hover:bg-muted text-[17px]">
    {label}
  </button>
);

export function BulkOperationsSheet({ children }: BulkOperationsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg h-auto p-0 bg-card">
        <SheetHeader className="text-left pt-3 pb-2 px-4">
          <SheetTitle className="text-sm font-normal text-muted-foreground">Bulk Operations</SheetTitle>
        </SheetHeader>
        <Separator />
        <div className="flex flex-col">
          <OperationButton label="Close All Positions" />
          <OperationButton label="Close Losing Positions" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
