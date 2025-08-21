import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import { SortIcon, AddOrderIcon } from './icons';

interface HeaderProps {
  totalProfit: string;
}

export default function Header({ totalProfit }: HeaderProps) {
  const profitValue = parseFloat(totalProfit.replace(/ /g, ''));
  const isLoss = profitValue < 0;
  const isZero = profitValue === 0;

  // Format profit string to always show two decimal places
  const profitString = profitValue.toFixed(2);
  const profitColor = isLoss ? 'text-[#bf655c]' : 'text-[#3082ff]';

  return (
    <header className="shrink-0">
      <div className="flex items-center justify-between pl-2 pr-[8px] py-3">
        <div className="flex items-center gap-1">
          <Sidebar />
          <div>
            <div className="text-[11px] font-medium text-foreground">Trade</div>
            <div className={`text-sm font-semibold ${isZero ? 'text-foreground' : profitColor}`}>
              {profitString} USD
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[11px]">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:bg-transparent">
            <SortIcon />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:bg-transparent">
            <AddOrderIcon />
          </Button>
        </div>
      </div>
    </header>
  );
}
