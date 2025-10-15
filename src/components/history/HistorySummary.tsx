interface HistorySummaryProps {
  data: {
    profit: string;
    deposit: string;
    swap: string;
    commission: string;
    balance: string;
  };
  onEditProfit: () => void;
  onEditDeposit: () => void;
}

const SummaryItem = ({ label, value, onClick, isClickable = false }: { label: string; value: string; onClick?: () => void; isClickable?: boolean }) => {
  const isLoss = parseFloat(value.replace(/ /g, '')) < 0;
  const isBalance = label === 'Balance';
  const isDefault = label === 'Deposit' || label === 'Swap' || label === 'Commission';

  const valueColorClass = isLoss
    ? '' // Use inline style for the specific color
    : isBalance || isDefault
    ? 'text-card-foreground'
    : 'text-primary';

  const valueStyle = isLoss ? { color: '#ad3434' } : {};

  const Wrapper = isClickable ? 'button' : 'div';

  return (
    <Wrapper 
        className={`flex justify-between items-center text-[14.5px] w-full text-left ${isClickable ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
      <span className="font-semibold text-card-foreground">{label}:</span>
      <div
        className="flex-1 mx-3 h-[1px]"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)/.5) 1px, transparent 1px)',
          backgroundSize: '8px 1px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
        }}
      ></div>
      <span className={`font-semibold ${valueColorClass}`} style={valueStyle}>{value}</span>
    </Wrapper>
  );
};

export default function HistorySummary({ data, onEditProfit, onEditDeposit }: HistorySummaryProps) {
  return (
    <div className="p-4 space-y-2">
      <SummaryItem label="Profit" value={data.profit} onClick={onEditProfit} isClickable={true} />
      <SummaryItem label="Deposit" value={data.deposit} onClick={onEditDeposit} isClickable={true} />
      <SummaryItem label="Swap" value={data.swap} />
      <SummaryItem label="Commission" value={data.commission} />
      <SummaryItem label="Balance" value={data.balance} />
    </div>
  );
}
