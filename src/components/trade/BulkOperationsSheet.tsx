
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
  <button className="w-full text-left py-4 px-6 text-card-foreground hover:bg-muted text-[17px]">
    {label}
  </button>
);

export function BulkOperationsSheet({ children }: BulkOperationsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg h-auto pb-4 pt-1">
        <SheetHeader className="text-left py-3 px-6 border-b">
          <SheetTitle className="text-base font-normal text-muted-foreground">Bulk Operations</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col">
          <OperationButton label="Close All Positions" />
          <OperationButton label="Close Losing Positions" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
