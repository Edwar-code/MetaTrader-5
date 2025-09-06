
'use client';

import { useState, useEffect } from 'react';
import type { ClosedPosition } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface HistoryItemProps {
  position: ClosedPosition;
}

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

export default function HistoryItem({ position }: HistoryItemProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const profitValue = position.pnl;
  const isLoss = profitValue < 0;

  const profitString = isLoss ? profitValue.toFixed(2) : `+${profitValue.toFixed(2)}`;
  const profitColor = isLoss ? '#70231f' : '#3082ff';
  const typeColor = position.type === 'BUY' ? '#337ad3' : '#70231f';

  const formattedType = position.type.toLowerCase();
  
  const isGold = position.pair === 'frxXAUUSD';
  let displayPair = position.pair;
  if (position.pair === 'cryBTCUSD') displayPair = 'BTCUSD';

  const goldImageSrc = mounted && resolvedTheme === 'dark'
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.37.32_cdd3a05d.jpg'
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2012.33.35_e00bef8a.jpg';

  if (!mounted) {
    // Render a skeleton or null during SSR and initial client render
    return <div className="h-[48px] py-2 px-4" />;
  }

  return (
    <div className="flex flex-col py-2 px-4">
        <div className="flex justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-1 leading-none mb-[-7px]">
                  {isGold ? (
                    <div className="flex items-center">
                       <div className="relative top-[-1px]">
                        <Image src={goldImageSrc} alt="XAUUSD" width={50} height={9} className="object-contain" />
                      </div>
                      <span className="text-sm font-bold text-card-foreground">.m,</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-card-foreground">{displayPair},</span>
                  )}
                  <span className={`text-sm font-normal`} style={{ color: typeColor }}>
                      {formattedType}
                  </span>
                  <span className={`text-sm font-normal`} style={{ color: typeColor }}>
                      {position.size}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 leading-none mt-px">
                <span className="text-sm font-bold" style={{ color: '#838282' }}>{position.entryPrice.toFixed(2)}</span>
                <span className="text-base font-light" style={{ color: '#838282' }}>→</span>
                <span className="text-sm font-bold" style={{ color: '#838282' }}>{position.closePrice.toFixed(2)}</span>
                </div>
            </div>
            <div className="text-right">
                 <span className="text-[13.5px] text-muted-foreground">
                    {format(new Date(position.closeTime * 1000), 'yyyy.MM.dd HH:mm:ss')}
                </span>
                <span className={`block text-[13.5px] font-bold`} style={{ color: profitColor, position: 'relative', top: '-8px' }}>
                    {profitString}
                </span>
            </div>
        </div>
    </div>
  );
}
