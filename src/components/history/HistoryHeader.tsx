
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '../trade/Sidebar';
import { RefreshCw, ArrowUpDown, Calendar } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function HistoryHeader() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);


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
            <div className="text-foreground text-[11px]">History</div>
            <div className={`text-base text-foreground`}>
              All symbols
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[18px]">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
            <RefreshCw size={22} />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
            <ArrowUpDown size={22} />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
            <Calendar size={22} />
          </Button>
        </div>
      </div>
    </header>
  );
}
