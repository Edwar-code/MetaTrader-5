
'use client';

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Newspaper,
  Mail,
  BookText,
  Settings,
  Calendar,
  Users,
  Send,
  HelpCircle,
  Info,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const NavItem = ({ icon, label, badge, ad, active, href }: { icon: React.ReactNode, label: string, href: string, badge?: number, ad?: boolean, active?: boolean }) => (
  <Link href={href} className={`flex items-center gap-6 px-[35px] py-[7.4px] text-sm font-medium ${active ? 'bg-muted text-foreground' : 'text-foreground'}`}>
    {icon}
    <span className="flex-1">{label}</span>
    {badge && <span className="w-5 h-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">{badge}</span>}
    {ad && <span className="text-xs border border-blue-500 text-blue-500 rounded-full px-2 py-0.5">Ads</span>}
  </Link>
);

export function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();

  const menuIconSrc = theme === 'dark' 
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.19.37_df9b14de.jpg' 
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2012.16.32_d0e4afc0.jpg';
    
  const fbsLogoSrc = theme === 'dark'
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.57.04_18cd5e88.jpg'
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2001.18.11_7f6bd53c.jpg';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:bg-transparent">
          <Image src={menuIconSrc} alt="Menu" width={22} height={22} className="object-contain" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[81%] p-0 bg-card [&>[data-state=open]]:hidden">
        <div className="flex flex-col h-full">
          <div className="pl-[10px] pr-4 py-4 pt-8">
            <div className="flex items-start gap-6 ml-2">
              <Image src={fbsLogoSrc} alt="FBS Logo" width={34} height={34} className="shrink-0" />
              <div>
                <h2 className="text-card-foreground">EDWARD KIBE MUNENE</h2>
                <p className="text-sm text-muted-foreground">40311301 - FBS-Real</p>
                <Link href="/accounts" className="text-primary text-sm font-medium mt-1 inline-block">Manage accounts</Link>
              </div>
            </div>
          </div>
          <Separator className="my-2" />
          <nav className="flex-1 flex flex-col">
            <NavItem href="/" icon={<LineChart size={24} />} label="Trade" active={pathname === '/' || pathname.startsWith('/chart')} />
            <NavItem href="#" icon={<Newspaper size={24} />} label="News" />
            <NavItem href="#" icon={<Mail size={24} />} label="Mailbox" badge={8} />
            <NavItem href="#" icon={<BookText size={24} />} label="Journal" />
            <NavItem href="/settings" icon={<Settings size={24} />} label="Settings" active={pathname === '/settings'}/>
            <NavItem href="#" icon={<Calendar size={24} />} label="Economic calendar" ad/>
            <NavItem href="#" icon={<Users size={24} />} label="Traders Community" />
            <NavItem href="#" icon={<Send size={24} />} label="MQL5 Algo Trading" />
            <NavItem href="#" icon={<HelpCircle size={24} />} label="User guide" />
            <NavItem href="#" icon={<Info size={24} />} label="About" />
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
