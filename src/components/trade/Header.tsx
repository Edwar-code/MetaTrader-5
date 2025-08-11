import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import { SortIcon, AddOrderIcon } from './icons';

interface HeaderProps {
  totalProfit: string;
}

export default function Header({ totalProfit }: HeaderProps) {
  const isLoss = parseFloat(totalProfit.replace(/ /g, '')) < 0;

  return (
    <header className="shrink-0">
      <div className="flex items-center justify-between pl-2 pr-4 py-3">
        <div className="flex items-center gap-1">
          <Sidebar />
          <div>
            <div className="text-sm font-medium text-foreground">Trade</div>
            <div className={`text-base font-semibold ${isLoss ? 'text-destructive' : 'text-green-500'}`}>
              {totalProfit} USD
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
            <SortIcon />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
            <AddOrderIcon />
          </Button>
        </div>
      </div>
    </header>
  );
}
