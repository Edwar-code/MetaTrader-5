
'use client';

import { useState } from 'react';
import type { Position } from '@/lib/data';

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

  const profitValue = parseFloat(position.profit.replace(/ /g, ''));
  const isLoss = profitValue < 0;

  const profitString = isLoss ? position.profit : `+${position.profit}`;
  const profitColor = isLoss ? '#FF3B30' : '#007AFF';
  const typeColor = position.type === 'buy' ? '#007AFF' : '#FF3B30';

  return (
    <div className="flex flex-col py-2 px-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-1 leading-none">
                <span className="text-sm font-bold text-card-foreground">{position.symbol},</span>
                <span className={`text-sm font-semibold`} style={{ color: typeColor }}>
                    {position.type}
                </span>
                <span className={`text-sm font-semibold`} style={{ color: typeColor }}>
                    {position.volume}
                </span>
                </div>
                <div className="flex items-center gap-1.5 leading-none mt-1">
                <span className="text-sm font-bold text-muted-foreground">{position.openPrice}</span>
                <span className="text-base font-light text-muted-foreground">→</span>
                <span className="text-sm font-bold text-muted-foreground">{position.currentPrice}</span>
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
                    {position.date}
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                    <DetailRow label="S / L:" value={position.sl} />
                    <DetailRow label="Swap:" value={position.swap} />
                    <DetailRow label="T / P:" value={position.tp} />
                    <DetailRow label="" value={`#${position.id}`} />
                </div>
            </div>
        )}
    </div>
  );
}
