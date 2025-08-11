import { ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';

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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <ChevronsUpDown className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
