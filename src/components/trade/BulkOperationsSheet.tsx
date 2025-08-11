
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface BulkOperationsSheetProps {
  children: React.ReactNode;
}

const OperationButton = ({ label }: { label: string }) => (
  <button className="w-full text-left p-4 text-card-foreground hover:bg-muted text-base">
    {label}
  </button>
);

export function BulkOperationsSheet({ children }: BulkOperationsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg h-auto pb-6">
        <SheetHeader className="text-left px-4 pt-2 pb-2">
          <SheetTitle className="text-base font-semibold text-card-foreground">Bulk Operations</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col">
          <OperationButton label="Close All Positions" />
          <OperationButton label="Close Losing Positions" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
