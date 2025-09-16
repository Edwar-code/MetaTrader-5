
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sidebar } from '@/components/trade/Sidebar';
import { MoreVertical, Plus } from 'lucide-react';
import BottomNav from '@/components/trade/BottomNav';
import { BellIcon, InfoIcon } from './icons';
import { useTradeState } from '@/context/TradeContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const AccountCard = ({
  logo,
  broker,
  accountName,
  accountNumber,
  accountDetails,
  balance,
  currency,
  isMain = false,
  isLoading,
  scannerIconSrc,
}: {
  logo: React.ReactNode;
  broker: string;
  accountName?: string;
  accountNumber: string;
  accountDetails?: string;
  balance: string;
  currency: string;
  isMain?: boolean;
  isLoading: boolean;
  scannerIconSrc?: string;
}) => (
  <Card className="shadow-sm border-none overflow-hidden bg-muted/20 rounded-none">
    <CardContent className={`px-4 pt-4 ${isMain ? 'pb-[2px]' : 'pb-4'}`}>
      {isMain && (
        <div className="flex flex-col items-center text-center mb-4">
          <div className="mb-3">{logo}</div>
          {isLoading ? (
            <>
              <p className="font-bold text-lg text-muted-foreground invisible">{accountName}</p>
              <p className="text-sm text-primary">{broker}</p>
              <p className="text-sm mt-2 text-muted-foreground">{accountNumber}</p>
              <p className="invisible text-sm text-muted-foreground">{accountDetails}</p>
              <p className="invisible text-2xl font-light text-foreground mt-4">{balance} {currency}</p>
              <p className="text-lg text-muted-foreground animate-pulse mt-px">Connecting...</p>
            </>
          ) : (
            <>
              <p className="font-bold text-lg text-muted-foreground">{accountName}</p>
              <p className="text-sm text-primary">{broker}</p>
              <p className="text-sm mt-2 text-muted-foreground">{accountNumber}</p>
              <p className="text-sm text-muted-foreground">{accountDetails}</p>
              <p className="text-2xl font-light text-foreground mt-4">{balance} <span className="text-2xl font-light text-foreground">{currency}</span></p>
            </>
          )}
        </div>
      )}
      {!isMain && (
         <div className="grid grid-cols-[auto_1fr] items-start gap-4">
            <div className="flex flex-col items-center gap-4 h-full" style={{ marginLeft: '10px' }}>
                {logo}
            </div>
            <div>
                <p className="font-semibold text-foreground">{accountName}</p>
                <p className="text-sm text-primary">{broker}</p>
                <p className="text-xs text-muted-foreground mt-1">{accountNumber}</p>
                <div className="mt-2">
                    <p className="font-light text-xl text-foreground">{balance}</p>
                    <p className="text-xs text-muted-foreground">{currency}, last known</p>
                </div>
            </div>
            <div className="col-start-2 flex justify-between items-end w-full">
                 {scannerIconSrc && <Image src={scannerIconSrc} alt="Scanner Icon" width={24} height={24} />}
                 <InfoIcon />
            </div>
         </div>
      )}
    </CardContent>
     {!isLoading && isMain && scannerIconSrc && (
      <div className={`flex items-center justify-between px-4 pb-4 ${isMain ? 'mt-[-4px]' : 'pt-2'}`}>
        <Image src={scannerIconSrc} alt="Scanner Icon" width={24} height={24} />
        {isMain ? <BellIcon /> : <InfoIcon />}
      </div>
     )}
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
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const headerIconSrc = mounted && resolvedTheme === 'dark'
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.52.07_eff7dc80.jpg'
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2000.14.33_ea71798f.jpg';

  const scannerIconSrc = mounted && resolvedTheme === 'dark'
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.52.36_6f401008.jpg'
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2000.14.33_1a61dd2a.jpg';

  const fbsLogoSrc = mounted && resolvedTheme === 'dark'
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.57.04_18cd5e88.jpg'
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2001.18.11_7f6bd53c.jpg';

  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-background shadow-lg overflow-hidden">
      <header className="shrink-0 bg-card border-b">
        <div className="flex items-center justify-between pl-2 pr-4 py-2">
          <div className="flex items-center gap-2">
            <Sidebar />
            <h1 className="text-[15.5px] font-medium text-foreground">Accounts</h1>
          </div>
          <div className="flex items-center gap-[35px]">
            <Button variant="ghost" size="icon" className="h-auto w-auto p-0 [&_svg]:size-auto">
              <Image src={headerIconSrc} alt="Account Settings" width={28} height={28} />
            </Button>
            <Button variant="ghost" className="h-auto w-auto p-0 [&_svg]:size-auto">
              <Plus size={25.5} className="text-foreground/80" />
            </Button>
            <Button variant="ghost" className="h-auto w-auto p-0 [&_svg]:size-auto">
                <MoreVertical size={25.5} className="text-foreground/80" />
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto pb-20 space-y-4 p-2 bg-background">
        <AccountCard
          logo={<Image src={fbsLogoSrc} alt="FBS Logo" width={40} height={40} />}
          broker="FBS Markets Inc."
          accountName="GENT KINGSTON BUSI"
          accountNumber="40311301 — FBS-Real"
          accountDetails="DC-305-Johannesburg-5R1, Hedge"
          balance={balance.toFixed(2)}
          currency="USD"
          isMain={true}
          isLoading={loading}
          scannerIconSrc={scannerIconSrc}
        />

        <div className="px-2 pt-2">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Connect to:</h2>
             <AccountCard
                logo={<Image src={fbsLogoSrc} alt="FBS Logo" width={40} height={40} />}
                broker="FBS Markets Inc."
                accountName="EDWARD KIBE MUNENE"
                accountNumber="40311301 — FBS-Real"
                balance="0.08"
                currency="USD"
                isMain={false}
                isLoading={false}
                scannerIconSrc={scannerIconSrc}
            />
            <div className="mt-4">
              <AccountCard
                  logo={<Image src={fbsLogoSrc} alt="FBS Logo" width={40} height={40} />}
                  broker="FBS Markets Inc."
                  accountName="Demo Account"
                  accountNumber="MT5-1020304"
                  balance="10000.00"
                  currency="USD"
                  isMain={false}
                  isLoading={false}
                  scannerIconSrc={scannerIconSrc}
              />
            </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
