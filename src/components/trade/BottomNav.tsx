import { ArrowUpDown, History } from 'lucide-react';
import { TradeIcon, ChartIcon, MessagesIcon } from './icons';

const NavItem = ({ icon, label, isActive = false }: { icon: React.ReactNode; label: string; isActive?: boolean }) => {
  return (
    <div className="flex flex-col items-center gap-1 p-2 relative">
      <div className={`h-6 w-6 flex items-center justify-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
      {isActive && <div className="absolute -bottom-[8px] left-1/2 transform -translate-x-1/2 w-10 h-1 rounded-full bg-primary"></div>}
    </div>
  );
};

export default function BottomNav() {
  return (
    <footer className="absolute bottom-0 left-0 right-0 border-t bg-card">
      <div className="flex items-center justify-around px-2 py-1">
        <NavItem icon={<ArrowUpDown size={20} />} label="Quotes" />
        <NavItem icon={<ChartIcon />} label="Charts" />
        <NavItem icon={<TradeIcon />} label="Trade" isActive />
        <NavItem icon={<History size={20} />} label="History" />
        <NavItem icon={<MessagesIcon />} label="Messages" />
      </div>
    </footer>
  );
}