
'use client';

import { useState } from 'react';
import type { Position } from '@/lib/types';
import { format } from 'date-fns';

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

  const profitValue = position.pnl;
  const isLoss = profitValue < 0;

  const profitString = (isLoss ? '' : '+') + profitValue.toFixed(2);
  const profitColor = isLoss ? '#FF3B30' : '#007AFF';
  const typeColor = position.type === 'BUY' ? '#007AFF' : '#FF3B30';

  const formattedType = position.type.charAt(0) + position.type.slice(1).toLowerCase();

  return (
    <div className="flex flex-col py-2 px-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-1 leading-none">
                <span className="text-sm font-bold text-card-foreground">{position.pair},</span>
                <span className={`text-sm font-normal`} style={{ color: typeColor }}>
                    {formattedType}
                </span>
                <span className={`text-sm font-normal`} style={{ color: typeColor }}>
                    {position.size}
                </span>
                </div>
                <div className="flex items-center gap-1.5 leading-none mt-1">
                <span className="text-sm font-bold text-muted-foreground">{position.entryPrice.toFixed(5)}</span>
                <span className="text-base font-light text-muted-foreground">→</span>
                <span className="text-sm font-bold text-muted-foreground">{position.currentPrice.toFixed(2)}</span>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-sm font-bold`} style={{ color: profitColor }}>
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
