interface AccountSummaryProps {
  data: {
    balance: string;
    equity: string;
    margin: string;
    freeMargin: string;
    marginLevel: string;
  };
}

const SummaryItem = ({ label, value }: { label: string; value: string }) => {
  const isLoss = parseFloat(value.replace(/ /g, '')) < 0;
  return (
    <div className="flex justify-between items-center text-[14.5px]">
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
      <span className={`font-semibold ${isLoss ? 'text-destructive' : 'text-card-foreground'}`}>{value}</span>
    </div>
  );
};

export default function AccountSummary({ data }: AccountSummaryProps) {
  return (
    <div className="p-4 space-y-2">
      <SummaryItem label="Balance" value={data.balance} />
      <SummaryItem label="Equity" value={data.equity} />
      <SummaryItem label="Margin" value={data.margin} />
      <SummaryItem label="Free margin" value={data.freeMargin} />
      <SummaryItem label="Margin Level (%)" value={data.marginLevel} />
    </div>
  );
}
