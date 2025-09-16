
'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Checkbox } from '@/components/ui/checkbox';
import BottomNav from '@/components/trade/BottomNav';

export default function LoginPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fbsLogoSrc =
    mounted && resolvedTheme === 'dark'
      ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.57.04_18cd5e88.jpg'
      : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2001.18.11_7f6bd53c.jpg';

  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-background shadow-lg overflow-hidden">
      <header className="shrink-0 bg-card border-b">
        <div className="flex items-center justify-start pl-2 pr-4 py-2 gap-4">
          <Link href="/accounts" passHref>
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-foreground">
            Login to an account
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-background p-4 pt-6 pb-28">
        <div className="flex items-center gap-4 mb-4">
          <Image
            src={fbsLogoSrc}
            alt="FBS Logo"
            width={40}
            height={40}
            className="shrink-0 rounded-md"
          />
          <div>
            <p className="font-semibold text-foreground">FBS-Real</p>
            <p className="text-sm text-muted-foreground">FBS Markets Inc.</p>
          </div>
        </div>
        <hr className="border-t border-border my-6" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="account-number">Login</Label>
            <span className="text-sm text-foreground">40311301</span>
            <Input id="account-number" defaultValue="40311301" className="hidden" />
          </div>
           <div className="relative">
            <Label htmlFor="password" className="absolute left-0 -top-2.5 text-xs text-muted-foreground">Password</Label>
            <Input id="password" type="password" defaultValue="••••••••" className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"/>
          </div>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Checkbox id="save-password" defaultChecked/>
                <Label htmlFor="save-password">Save password</Label>
             </div>
             <Button variant="link" className="text-primary p-0 h-auto">
              Forgot password?
            </Button>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-16 left-0 right-0 p-4 border-t bg-card z-10">
        <Button className="w-full" onClick={() => {
          if (typeof window !== 'undefined') {
             window.location.href = '/chart';
          }
        }}>
          SIGN IN
        </Button>
      </footer>
       <BottomNav />
    </div>
  );
}
