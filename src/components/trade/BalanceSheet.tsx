
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

interface BalanceSheetProps {
  children: React.ReactNode;
  balance: string;
}

const OptionButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <SheetClose asChild>
    <button onClick={onClick} className="w-full text-left py-4 px-4 text-card-foreground hover:bg-muted text-[17px]">
      {label}
    </button>
  </SheetClose>
);

export function BalanceSheet({ children, balance }: BalanceSheetProps) {
  const handleOptionClick = () => {
    // In a real app, this would trigger a deposit or withdrawal flow.
    // For now, it just closes the sheet.
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg h-auto p-0 bg-card data-[state=open]:animate-none data-[state=closed]:animate-none">
        <SheetHeader className="text-center pt-3 pb-2 px-4">
          <SheetTitle className="text-sm font-normal text-muted-foreground">Balance: {balance} USD</SheetTitle>
        </SheetHeader>
        <Separator />
        <div className="flex flex-col">
          <OptionButton label="Deposit" onClick={handleOptionClick} />
          <OptionButton label="Withdrawal" onClick={handleOptionClick} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
