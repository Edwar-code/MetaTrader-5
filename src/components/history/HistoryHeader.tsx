
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '../trade/Sidebar';
import { useTheme } from 'next-themes';
import { SortIcon } from '../trade/icons';
import Image from 'next/image';

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
            <div className="text-base" style={{ color: '#a0adbd' }}>
              All symbols
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[18px]">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
            <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-09-06%20at%2015.15.09_aa47dbcc.jpg" alt="Refresh History" width={22} height={22} />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:bg-transparent">
            <SortIcon />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
            <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-09-06%20at%2015.15.34_492037f3.jpg" alt="Filter History" width={22} height={22} />
          </Button>
        </div>
      </div>
    </header>
  );
}
