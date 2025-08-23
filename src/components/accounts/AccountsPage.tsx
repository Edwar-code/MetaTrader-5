
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sidebar } from '@/components/trade/Sidebar';
import { MoreVertical, Plus } from 'lucide-react';
import BottomNav from '@/components/trade/BottomNav';
import { BellIcon, InfoIcon } from './icons';
import { useTradeState } from '@/context/TradeContext';
import Image from 'next/image';

const AccountCard = ({
  logo,
  broker,
  accountName,
  accountNumber,
  accountDetails,
  balance,
  currency,
  isMain = false,
}: {
  logo: React.ReactNode;
  broker: string;
  accountName?: string;
  accountNumber: string;
  accountDetails?: string;
  balance: string;
  currency: string;
  isMain?: boolean;
}) => (
  <Card className="shadow-sm border-none overflow-hidden bg-[#f8f9f9] rounded-none">
    <CardContent className="px-4 pt-4 pb-[2px]">
      {isMain && (
        <div className="flex flex-col items-center text-center mb-4">
          <div className="mb-3">{logo}</div>
          <p className="font-bold text-lg text-[#707175]">{accountName}</p>
          <p className="text-sm text-primary">{broker}</p>
          <p className="text-sm text-muted-foreground mt-2">{accountNumber}</p>
          <p className="text-sm text-muted-foreground">{accountDetails}</p>
          <p className="text-2xl font-light text-foreground mt-4">{balance} <span className="text-xl">{currency}</span></p>
        </div>
      )}
      {!isMain && (
         <div className="flex items-center gap-4">
            {logo}
            <div className="flex-1">
                <p className="font-semibold text-foreground">{broker}</p>
                <p className="text-sm text-primary">{accountName}</p>
                <p className="text-xs text-muted-foreground">{accountNumber}</p>
            </div>
            <div className="text-right">
                <p className="font-light text-xl text-foreground">{balance}</p>
                <p className="text-xs text-muted-foreground">{currency}, last known</p>
            </div>
         </div>
      )}
    </CardContent>
     <div className={`flex items-center justify-between px-4 pb-4 ${isMain ? '' : 'pt-2'}`}>
        <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2000.14.33_1a61dd2a.jpg" alt="Scanner Icon" width={24} height={24} />
        {isMain ? <BellIcon /> : <InfoIcon />}
     </div>
  </Card>
);

const DemoBadge = () => (
  <div className="absolute top-0 right-0">
    <div className="relative w-16 h-16">
      <div 
        className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-green-500 border-l-[40px] border-l-transparent"
      >
      </div>
      <span className="absolute top-[8px] right-[1px] text-white text-xs font-bold transform -rotate-45 -translate-y-1/2 translate-x-1/2" style={{transform: 'rotate(45deg)', top: '9px', right: '4px'}}>
        Demo
      </span>
    </div>
  </div>
);


export default function AccountsPage() {
  const { balance } = useTradeState();

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-white shadow-lg overflow-hidden">
      <header className="shrink-0 bg-white">
        <div className="flex items-center justify-between pl-2 pr-4 py-2">
          <div className="flex items-center gap-2">
            <Sidebar />
            <h1 className="text-[15.5px] font-medium">Accounts</h1>
          </div>
          <div className="flex items-center gap-[20px]">
            <Button variant="ghost" size="icon" className="h-auto w-auto p-0">
              <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2000.14.33_ea71798f.jpg" alt="Account Settings" width={28} height={28} />
            </Button>
            <Button variant="ghost" size="icon" className="h-auto w-auto p-0">
              <Plus size={28} />
            </Button>
            <Button variant="ghost" size="icon" className="h-auto w-auto p-0">
              <MoreVertical size={28} />
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto pb-20 space-y-4 p-2">
        <AccountCard
          logo={<Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2000.19.22_1608d54d.jpg" alt="FBS Logo" width={52} height={52} />}
          broker="FBS Markets Inc."
          accountName="EDWARD KIBE MUNENE"
          accountNumber="40311301 — FBS-Real"
          accountDetails="DC-305-Johannesburg-5R1, Hedge"
          balance={balance.toFixed(2)}
          currency="USD"
          isMain={true}
        />
      </div>
      <BottomNav />
    </div>
  );
}
