
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sidebar } from '@/components/trade/Sidebar';
import { MoreVertical, Plus } from 'lucide-react';
import BottomNav from '@/components/trade/BottomNav';
import { BellIcon, InfoIcon } from './icons';
import { useTradeState, useTradeContext } from '@/context/TradeContext';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Account {
  name: string;
  number: string;
  broker: string;
  balance?: string;
  currency?: string;
}

const initialAccounts: Account[] = [
    { name: 'GENT KINGSTON BUSI', number: '40311301 — FBS-Real', broker: 'FBS Markets Inc.', balance: '756.67', currency: 'USD' },
    { name: 'MARY KARANJA KIMEU', number: '40776538 — FBS-Real', broker: 'FBS Markets Inc.', balance: '240.45', currency: 'USD' },
    { name: 'DENNIS WAITHERA', number: '40256784 — FBS-Real', broker: 'FBS Markets Inc.', balance: '456.46', currency: 'USD' },
];

const defaultAccount: Account = initialAccounts[0];

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
  onLongPress,
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
  onLongPress: () => void;
}) => {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent Link navigation from firing immediately
    e.preventDefault();
    longPressTimer.current = setTimeout(() => {
      onLongPress();
      longPressTimer.current = null; // Prevent click after long press
    }, 1500); // 1.5-second long press
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      // If the timer was cleared, it means it was a short click.
      // We find the closest 'a' tag and click it programmatically.
      const link = (e.currentTarget as HTMLElement).closest('a');
      link?.click();
    }
    longPressTimer.current = null;
  };


  return (
    <Card 
      className="shadow-sm border-none overflow-hidden bg-muted/20 rounded-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CardContent className={`relative px-4 pt-4 ${isMain ? 'pb-[2px]' : 'pb-4'}`}>
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
           <div className="relative flex justify-between items-end">
              <div className="flex items-start">
                  <div style={{ marginLeft: '10px' }}>{logo}</div>
                  <div style={{ marginLeft: '12px' }}>
                      <p className="font-semibold text-foreground">{accountName}</p>
                      <p className="text-sm text-primary">{broker}</p>
                      <p className="text-xs mt-1" style={{ color: '#93a1b0' }}>{accountNumber}</p>
                       <div className="mt-2">
                          <p className="font-light text-xl" style={{ color: '#93a1b0' }}>{balance}</p>
                          <p className="text-xs" style={{ color: '#93a1b0' }}>{currency}, last known</p>
                      </div>
                  </div>
              </div>
              <div className="shrink-0">
                   <InfoIcon />
              </div>
           </div>
        )}
        {scannerIconSrc && !isMain && (
          <div className="absolute left-4 bottom-4">
              <Image src={scannerIconSrc} alt="Scanner Icon" width={24} height={24} />
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
  )
};

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
  const { balance, updateAccountDetails } = useTradeContext();
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [allAccounts, setAllAccounts] = useState<Account[]>(initialAccounts);
  const [activeAccount, setActiveAccount] = useState<Account>(defaultAccount);
  const [otherAccounts, setOtherAccounts] = useState<Account[]>([]);

  // State for the modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');

  const [fbsLogoSrc, setFbsLogoSrc] = useState(
    'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2001.18.11_7f6bd53c.jpg'
  );

  useEffect(() => {
    setMounted(true);

    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        // Load master list of accounts from localStorage, or initialize it
        const storedAllAccounts = localStorage.getItem('all_accounts');
        const currentAllAccounts = storedAllAccounts ? JSON.parse(storedAllAccounts) : initialAccounts;
        if (!storedAllAccounts) {
          localStorage.setItem('all_accounts', JSON.stringify(initialAccounts));
        }
        setAllAccounts(currentAllAccounts);
        
        // Determine active account
        const storedAccountJson = localStorage.getItem('active_account');
        const currentActiveAccount = storedAccountJson 
            ? JSON.parse(storedAccountJson) 
            : currentAllAccounts[0]; // Fallback to first in list
        
        // Ensure active account reflects latest from allAccounts
        const updatedActiveAccount = currentAllAccounts.find(acc => acc.number === currentActiveAccount.number) || currentActiveAccount;
        setActiveAccount(updatedActiveAccount);
        
        const inactive = currentAllAccounts.filter(acc => acc.number !== updatedActiveAccount.number);
        setOtherAccounts(inactive);
      }
    };

    handleStorageChange();
    window.addEventListener('local-storage', handleStorageChange);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (mounted) {
      if (resolvedTheme === 'dark') {
        setFbsLogoSrc('https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.57.04_18cd5e88.jpg');
      } else {
        setFbsLogoSrc('https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2001.18.11_7f6bd53c.jpg');
      }
    }
  }, [mounted, resolvedTheme]);

  const openEditModal = (account: Account) => {
    setAccountToEdit(account);
    setEditName(account.name);
    setEditBalance(''); // Always start with a blank balance field
    setIsEditModalOpen(true);
  };
  
  const handleSave = () => {
    if (!accountToEdit) return;

    const newBalance = parseFloat(editBalance);
    if (updateAccountDetails) {
        updateAccountDetails(accountToEdit.number, {
            name: editName,
            balance: isNaN(newBalance) ? undefined : newBalance
        });
    }
    setIsEditModalOpen(false);
  };

  const headerIconSrc = mounted && resolvedTheme === 'dark'
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.52.07_eff7dc80.jpg'
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2000.14.33_ea71798f.jpg';

  const scannerIconSrc = mounted && resolvedTheme === 'dark'
    ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.52.36_6f401008.jpg'
    : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2000.14.33_1a61dd2a.jpg';

  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <>
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
            broker={activeAccount.broker}
            accountName={activeAccount.name}
            accountNumber={activeAccount.number}
            accountDetails="DC-305-Johannesburg-5R1, Hedge"
            balance={balance.toFixed(2)}
            currency="USD"
            isMain={true}
            isLoading={loading}
            scannerIconSrc={scannerIconSrc}
            onLongPress={() => openEditModal(activeAccount)}
          />

          <div className="px-2 pt-2">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">Connect to:</h2>
              {otherAccounts.map((account, index) => {
                   const loginUrl = `/auth/login?name=${encodeURIComponent(account.name)}&number=${encodeURIComponent(account.number)}&broker=${encodeURIComponent(account.broker)}`;
                   return (
                      <Link key={index} href={loginUrl} passHref>
                          <div className="mt-4 first:mt-0">
                            <AccountCard
                                logo={<Image src={fbsLogoSrc} alt="FBS Logo" width={40} height={40} />}
                                broker={account.broker}
                                accountName={account.name}
                                accountNumber={account.number}
                                balance={account.balance!}
                                currency={account.currency!}
                                isMain={false}
                                isLoading={false}
                                scannerIconSrc={scannerIconSrc}
                                onLongPress={() => openEditModal(account)}
                            />
                          </div>
                      </Link>
                   )
              })}
          </div>
        </div>
        <BottomNav />
      </div>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Account Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="balance" className="text-right">Balance</Label>
                    <Input id="balance" type="number" placeholder="Leave blank to keep current" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
