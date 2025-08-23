
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

const NavItem = ({ icon, label, badge, ad, active, href }: { icon: React.ReactNode, label: string, href: string, badge?: number, ad?: boolean, active?: boolean }) => (
  <Link href={href} className={`flex items-center gap-6 px-6 py-3 text-sm font-medium ${active ? 'bg-[#f8f9f9] text-primary' : 'text-foreground'}`}>
    {icon}
    <span className="flex-1">{label}</span>
    {badge && <span className="w-5 h-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">{badge}</span>}
    {ad && <span className="text-xs border border-blue-500 text-blue-500 rounded-full px-2 py-0.5">Ads</span>}
  </Link>
);

export function Sidebar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:bg-transparent">
          <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2012.16.32_d0e4afc0.jpg" alt="Menu" width={22} height={22} className="object-contain" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[81%] p-0 bg-card [&>[data-state=open]]:hidden">
        <div className="flex flex-col h-full">
          <div className="p-4 pt-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 flex items-center justify-center rounded-md">
                <span className="text-white font-bold text-lg">FBS</span>
              </div>
              <div>
                <h2 className="font-semibold text-card-foreground">Market Maker</h2>
                <p className="text-sm text-muted-foreground">103498268 - FBS-Demo</p>
              </div>
            </div>
            <div className="text-center">
                <a href="#" className="text-primary text-sm font-medium mt-3">Manage accounts</a>
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
