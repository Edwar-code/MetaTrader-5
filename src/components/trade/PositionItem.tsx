
'use client';

import { useState } from 'react';
import type { Position } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface PositionItemProps {
  position: Position;
}

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

export default function PositionItem({ position }: PositionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();

  const profitValue = position.pnl;
  const isLoss = profitValue < 0;

  const profitString = isLoss ? profitValue.toFixed(2) : profitValue.toFixed(2);
  const profitColor = isLoss ? '#c40909' : '#3082ff';
  const typeColor = position.type === 'BUY' ? '#337ad3' : '#932120';

  const formattedType = position.type.toLowerCase();
  
  const isGold = position.pair === 'frxXAUUSD';

  const goldImageSrc = theme === 'dark' 
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.37.32_cdd3a05d.jpg'
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2012.33.35_e00bef8a.jpg';


  return (
    <div className="flex flex-col py-2 px-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
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
                    <span className="text-sm font-bold text-card-foreground">{position.pair},</span>
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
                <span className="text-sm font-bold" style={{ color: '#838282' }}>{position.currentPrice.toFixed(2)}</span>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-base font-bold`} style={{ color: profitColor }}>
                {profitString}
                </span>
            </div>
        </div>

        {isExpanded && (
            <div className="mt-2 pt-2">
                <div className="text-sm text-muted-foreground mb-2">
                    {format(new Date(position.openTime * 1000), 'yyyy.MM.dd HH:mm:ss')}
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                    <DetailRow label="S / L:" value={position.stopLoss?.toFixed(5) || '—'} />
                    <DetailRow label="Swap:" value={'0.00'} />
                    <DetailRow label="T / P:" value={position.takeProfit?.toFixed(5) || '—'} />
                    <DetailRow label="ID:" value={`#${position.id.substring(0, 8)}`} />
                </div>
            </div>
        )}
    </div>
  );
}
