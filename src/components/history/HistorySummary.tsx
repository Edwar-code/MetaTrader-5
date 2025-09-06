interface HistorySummaryProps {
  data: {
    profit: string;
    deposit: string;
    swap: string;
    commission: string;
    balance: string;
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

export default function HistorySummary({ data }: HistorySummaryProps) {
  return (
    <div className="p-4 space-y-2">
      <SummaryItem label="Profit" value={data.profit} />
      <SummaryItem label="Deposit" value={data.deposit} />
      <SummaryItem label="Swap" value={data.swap} />
      <SummaryItem label="Commission" value={data.commission} />
      <SummaryItem label="Balance" value={data.balance} />
    </div>
  );
}
