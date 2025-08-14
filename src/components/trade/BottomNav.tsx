
'use client';

import { ArrowUpDown, History } from 'lucide-react';
import { TradeIcon, ChartIcon, MessagesIcon } from './icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';

const NavItem = ({
  icon,
  label,
  href,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}) => {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 p-2 relative">
      <div className={`h-6 w-6 flex items-center justify-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
      {isActive && <div className="absolute -bottom-[8px] left-1/2 transform -translate-x-1/2 w-10 h-1 rounded-full bg-primary"></div>}
    </Link>
  );
};

export default function BottomNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const chartHref = isMobile ? '/chart?mobile=true' : '/chart';

  return (
    <footer className="absolute bottom-0 left-0 right-0 border-t bg-card">
      <div className="flex items-center justify-around px-2 py-1">
        <NavItem href="#" icon={<ArrowUpDown size={20} />} label="Quotes" />
        <NavItem href={chartHref} icon={<ChartIcon />} label="Charts" isActive={pathname === '/chart'} />
        <NavItem href="/" icon={<TradeIcon />} label="Trade" isActive={pathname === '/'} />
        <NavItem href="#" icon={<History size={20} />} label="History" />
        <NavItem href="#" icon={<MessagesIcon />} label="Messages" />
      </div>
    </footer>
  );
}
