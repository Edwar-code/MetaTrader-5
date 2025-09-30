
'use client';

import { useState, useEffect } from 'react';
import type { ClosedPosition } from '@/lib/types';
import { format } from 'date-fns';
import { BtcIcon, De30Icon, EurAudIcon, GbpusdIcon, GoldIcon } from '../trade/icons';

interface HistoryItemProps {
  position: ClosedPosition;
}

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between text-[13px] text-muted-foreground">
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

export default function HistoryItem({ position }: HistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const formatNumberWithSpaces = (num: number) => {
    const [integer, decimal] = num.toFixed(2).split('.');
    return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${decimal}`;
  };
  
  const profitValue = position.pnl;
  const isLoss = profitValue < 0;

  const profitString = formatNumberWithSpaces(profitValue);
  const profitColor = isLoss ? '#ad3434' : '#3082ff';
  const typeColor = position.type === 'BUY' ? '#337ad3' : '#ad3434';

  const formattedType = position.type.toLowerCase();
  
  const isGold = position.pair === 'frxXAUUSD';
  const isEurAud = position.pair === 'frxEURAUD';
  const isDe30 = position.pair === 'idx_germany_40';
  const isGbpusd = position.pair === 'frxGBPUSD';
  const isBtc = position.pair === 'cryBTCUSD';

  if (!mounted) {
    // Render a skeleton or null during SSR and initial client render
    return <div className="h-[48px] py-2 px-4" />;
  }

  const priceDecimalPoints = position.pair === 'frxXAUUSD' || position.pair === 'cryBTCUSD' || position.pair === 'idx_germany_40' ? 2 : 5;

  return (
    <div className="flex flex-col py-[4.5px] px-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-1 leading-none mb-[-7px]">
                  {isGold ? (
                    <div className="flex items-center">
                       <div className="relative top-[-1px]">
                        <GoldIcon width={50} height={9} />
                      </div>
                    </div>
                  ) : isBtc ? (
                     <div className="flex items-center">
                       <div className="relative top-[-1px]">
                        <BtcIcon width={50} height={9} />
                      </div>
                    </div>
                  ) : isEurAud ? (
                    <div className="flex items-center gap-1">
                       <div className="relative top-[-1px]">
                        <EurAudIcon width={50} height={9} />
                       </div>
                        <span className="text-sm font-bold text-card-foreground">,</span>
                    </div>
                  ) : isDe30 ? (
                    <div className="flex items-center gap-1">
                       <div className="relative top-[-1px]">
                        <De30Icon width={50} height={9} />
                       </div>
                        <span className="text-sm font-bold text-card-foreground">,</span>
                    </div>
                  ) : isGbpusd ? (
                    <div className="flex items-center gap-1">
                       <div className="relative top-[-1px]">
                        <GbpusdIcon width={50} height={9} />
                       </div>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-card-foreground">{position.pair},</span>
                  )}
                  <span className={`text-sm font-normal`} style={{ color: typeColor }}>
                      {formattedType}
                  </span>
                  <span className={`text-sm font-normal`} style={{ color: typeColor }}>
                      {position.size.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 leading-none mt-px">
                <span className="text-sm font-bold" style={{ color: '#838282' }}>{position.entryPrice.toFixed(priceDecimalPoints)}</span>
                <span className="text-base font-light" style={{ color: '#838282' }}>→</span>
                <span className="text-sm font-bold" style={{ color: '#838282' }}>{position.closePrice.toFixed(priceDecimalPoints)}</span>
                </div>
            </div>
            <div className="text-right">
                 <span className="text-[13.5px] text-muted-foreground">
                    {format(new Date(position.closeTime * 1000), 'yyyy.MM.dd HH:mm:ss')}
                </span>
                <span className={`block text-[13.5px] font-bold`} style={{ color: profitColor, position: 'relative', top: '-7px' }}>
                    {profitString}
                </span>
            </div>
        </div>
        {isExpanded && (
            <div className="mt-1 pt-1">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                    <DetailRow label="S / L:" value={position.stopLoss?.toFixed(priceDecimalPoints) || '—'} />
                    <DetailRow label="Swap:" value={'0.00'} />
                    <DetailRow label="T / P:" value={position.takeProfit?.toFixed(priceDecimalPoints) || '—'} />
                    <DetailRow label="ID:" value={`#${position.id.substring(0, 8)}`} />
                </div>
            </div>
        )}
    </div>
  );
}
