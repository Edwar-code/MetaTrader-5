import type { Position } from '@/lib/data';

interface PositionItemProps {
  position: Position;
}

export default function PositionItem({ position }: PositionItemProps) {
  const profitValue = parseFloat(position.profit.replace(/ /g, ''));
  const isLoss = profitValue < 0;

  return (
    <div className="flex items-center justify-between py-[7px] px-4">
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-card-foreground">{position.symbol},</span>
          <span className={`text-sm font-semibold ${isLoss ? 'text-destructive' : 'text-green-500'}`}>
            {position.type}
          </span>
          <span className={`text-sm font-semibold ${isLoss ? 'text-destructive' : 'text-green-500'}`}>
            {position.volume}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-muted-foreground">{position.openPrice}</span>
          <span className="text-base font-light text-muted-foreground">→</span>
          <span className="text-sm font-bold text-muted-foreground">{position.currentPrice}</span>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-sm font-bold ${isLoss ? 'text-destructive' : 'text-green-500'}`}>
          {position.profit}
        </span>
      </div>
    </div>
  );
}
