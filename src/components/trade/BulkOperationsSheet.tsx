
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

interface BulkOperationsSheetProps {
  children: React.ReactNode;
}

const OperationButton = ({ label }: { label: string }) => (
  <SheetClose asChild>
    <button className="w-full text-left py-4 px-4 text-card-foreground hover:bg-muted text-[17px]">
      {label}
    </button>
  </SheetClose>
);

export function BulkOperationsSheet({ children }: BulkOperationsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg h-auto p-0 bg-card data-[state=open]:animate-none data-[state=closed]:animate-none">
        <SheetHeader className="text-center pt-3 pb-2 px-4">
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
