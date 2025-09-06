
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import { SortIcon, AddOrderIcon, NewCustomIcon, TradeTitleIcon } from './icons';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface HeaderProps {
  totalProfit: string;
  hasOpenPositions: boolean;
}

export default function Header({ totalProfit, hasOpenPositions }: HeaderProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const profitValue = parseFloat(totalProfit.replace(/ /g, ''));
  const isLoss = profitValue < 0;
  const isZero = profitValue === 0;

  // Format profit string to always show two decimal places
  const profitString = profitValue.toFixed(2);
  const profitColor = isLoss ? 'text-[#ad3434]' : 'text-[#3082ff]';

  if (!mounted) {
    return (
      <header className="shrink-0">
        <div className="flex items-center justify-between pl-2 pr-[8px] py-3">
          <div className="flex items-center gap-[2.9px]">
            <Sidebar />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="shrink-0">
      <div className="flex items-center justify-between pl-2 pr-[8px] py-3">
        <div className="flex items-center gap-[2.9px]">
          <Sidebar />
          <div>
            {hasOpenPositions ? (
              <>
                <div className="text-foreground text-[11px]">Trade</div>
                <div className={`text-base ${isZero ? 'text-foreground' : profitColor}`}>
                  {profitString} USD
                </div>
              </>
            ) : (
              <TradeTitleIcon theme={resolvedTheme} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-[11px]">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:bg-transparent">
            <NewCustomIcon theme={resolvedTheme} />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:bg-transparent">
            <SortIcon />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:bg-transparent">
            <AddOrderIcon theme={resolvedTheme} />
          </Button>
        </div>
      </div>
    </header>
  );
}
