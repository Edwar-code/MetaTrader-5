

'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Settings,
  Calendar,
  HelpCircle,
  Info,
  Users,
  Send,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { SidebarTradeIcon, SidebarNewsIcon, SidebarJournalIcon, SidebarCommunityIcon, SidebarMQL5Icon } from './icons';

const NavItem = ({ icon, label, badge, ad, href }: { icon: React.ReactNode, label: string, href: string, badge?: number, ad?: boolean }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href} className="flex items-center gap-6 px-[23px] py-[7.4px] text-sm font-medium text-foreground">
          {icon}
          <div className="flex flex-1 justify-between items-center">
             <div className="flex items-center gap-[2px]">
                <span>{label}</span>
                {ad && <span className="text-xs border border-blue-500 text-blue-500 rounded-full px-2 py-0.5">Ads</span>}
             </div>
            {badge && badge > 0 && <span className="w-5 h-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">{badge}</span>}
          </div>
        </Link>
    );
};

interface Account {
  name: string;
  number: string;
  broker: string;
  mailboxBadge?: number;
}

const defaultAccount: Account = {
    name: 'GENT KINGSTON BUSI',
    number: '40311301 — HFMarketsSA-Live2',
    broker: 'HFM Investments Ltd',
    mailboxBadge: 8,
};

export function Sidebar() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeAccount, setActiveAccount] = useState<Account>(defaultAccount);

  useEffect(() => {
    setMounted(true);
    const handleStorageChange = () => {
        if (typeof window !== 'undefined') {
            const storedAccount = localStorage.getItem('active_account');
            if (storedAccount) {
                setActiveAccount(JSON.parse(storedAccount));
            } else {
                setActiveAccount(defaultAccount);
            }
        }
    };
    handleStorageChange();
    window.addEventListener('local-storage', handleStorageChange);
    return () => window.removeEventListener('local-storage', handleStorageChange);
  }, []);

  const hfmLogoSrc = 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-11-10%20at%2014.17.20_c0a48447.jpg';

  const menuIconSrc = mounted && resolvedTheme === 'dark'
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.19.37_df9b14de.jpg' 
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2012.16.32_d0e4afc0.jpg';

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10">
        {/* Placeholder or skeleton */}
      </Button>
    );
  }

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:bg-transparent">
            <Image src={menuIconSrc} alt="Menu" width={22} height={22} className="object-contain" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[81%] p-0 bg-card [&>[data-state=open]]:hidden">
          <div className="flex flex-col h-full">
            <div 
              className="pl-[10px] pr-4 py-4 pt-8"
            >
              <div className="flex items-start gap-6 ml-2">
                <Image src={hfmLogoSrc} alt="HFM Logo" width={34} height={34} className="shrink-0" />
                <div>
                  <h2 className="text-card-foreground">{activeAccount.name}</h2>
                  <p className="text-sm text-muted-foreground">{activeAccount.number}</p>
                  <Link href="/accounts" className="text-primary text-sm font-medium mt-1 inline-block">Manage accounts</Link>
                </div>
              </div>
            </div>
            <Separator className="my-2" />
            <nav className="flex-1 flex flex-col">
              <NavItem href="/" icon={<SidebarTradeIcon />} label="Trade" />
              <NavItem href="#" icon={<SidebarNewsIcon />} label="News" />
              <NavItem href="#" icon={<Mail size={24} />} label="Mailbox" badge={activeAccount.mailboxBadge} />
              <NavItem href="#" icon={<SidebarJournalIcon />} label="Journal" />
              <NavItem href="/settings" icon={<Settings size={24} />} label="Settings" />
              <NavItem href="#" icon={<Calendar size={24} />} label="Economic calendar" ad/>
              <NavItem href="#" icon={<SidebarCommunityIcon />} label="Traders Community" />
              <NavItem href="#" icon={<SidebarMQL5Icon />} label="MQL5 Algo Trading" />
              <NavItem href="#" icon={<HelpCircle size={24} />} label="User guide" />
              <NavItem href="#" icon={<Info size={24} />} label="About" />
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
    
