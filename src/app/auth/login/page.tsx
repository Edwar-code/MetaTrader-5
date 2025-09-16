// app/auth/login/page.js
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
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // Import Suspense here for the wrapper

// This is your LoginPage content component
function LoginPageContent() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize account details with fallback values
  const accountName = searchParams.get('name') || 'FBS-Real';
  const fullAccountNumber = searchParams.get('number') || 'Unknown';
  const accountNumber = fullAccountNumber.split('—')[0].trim();
  const broker = searchParams.get('broker') || 'FBS Markets Inc.';

  // State for the logo source
  const [fbsLogoSrc, setFbsLogoSrc] = useState(
    'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2001.18.11_7f6bd53c.jpg' // Default to light theme logo
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to update the logo source when theme changes or mounted state is confirmed
  useEffect(() => {
    if (mounted) { // Ensure useTheme has had a chance to hydrate
      // If you have a dark theme specific logo, set it here.
      // For now, it uses the same logo for both themes as per your initial request.
      setFbsLogoSrc('https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-24%20at%2001.18.11_7f6bd53c.jpg');
    }
  }, [mounted, resolvedTheme]);


  const handleSignIn = () => {
    if (typeof window !== 'undefined') {
        const activeAccount = {
            name: accountName, // This will now correctly use the URL param or fallback
            number: fullAccountNumber,
            broker: broker,
        };
        localStorage.setItem('active_account', JSON.stringify(activeAccount));
        window.dispatchEvent(new CustomEvent('local-storage'));
        router.push('/accounts');
    }
  };

  if (!mounted) {
    // Return null while the component is mounting to avoid flickering,
    // as the Suspense boundary handles the initial loading.
    return null;
  }

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-background shadow-lg overflow-hidden">
      <header className="shrink-0 bg-card">
        <div className="flex items-center justify-start pl-2 pr-4 py-2 gap-4">
          <Link href="/accounts" passHref>
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="font-medium text-foreground" style={{ fontSize: '15px' }}>
            Login to an account
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-background pt-6 pb-28">
        <div className="flex items-center gap-4 mb-4 px-4">
          <Image
            src={fbsLogoSrc} // Now uses state variable
            alt="FBS Logo"
            width={40}
            height={40}
            className="shrink-0 rounded-md"
          />
          <div>
            <p className="font-normal" style={{ color: '#c7ccd4' }}>{accountName}</p>
            <p className="text-sm" style={{ color: '#a1a5aa' }}>{broker}</p>
          </div>
        </div>
        <div style={{ paddingLeft: '22px', paddingRight: '22px' }}>
            <hr className="border-t border-muted-foreground/30 my-6" />
        </div>

        <div className="space-y-6">
          <div style={{ paddingLeft: '22px', paddingRight: '22px' }}>
            <div className="flex items-center justify-between gap-4 border-b">
              <Label htmlFor="account-number" className="shrink-0" style={{ color: '#87929e' }}>Login</Label>
               <Input id="account-number" defaultValue={accountNumber} readOnly className="bg-transparent border-0 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground text-right w-full"/>
            </div>
          </div>
           <div style={{ paddingLeft: '22px', paddingRight: '22px' }}>
             <div className="flex items-center justify-between gap-4 border-b">
              <Label htmlFor="password" className="shrink-0" style={{ color: '#87929e' }}>Password</Label>
              <Input id="password" type="password" defaultValue="••••••••" className="bg-transparent border-0 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-right w-full"/>
            </div>
           </div>
          <div style={{ paddingLeft: '22px', paddingRight: '22px' }} className="space-y-4">
             <div className="flex items-center justify-between">
                <Label htmlFor="save-password" style={{ color: '#838e9a' }}>Save password</Label>
                <Checkbox id="save-password" defaultChecked/>
             </div>
             <div className="text-center">
                <Button variant="link" className="text-primary p-0 h-auto">
                  Forgot password?
                </Button>
             </div>
          </div>
        </div>

        <div className="absolute bottom-16 left-0 right-0 p-4 bg-background z-10 border-t border-card">
          <Button
            className="w-full font-normal"
            style={{ borderRadius: '3px' }}
            onClick={handleSignIn}
          >
            SIGN IN
          </Button>
        </div>
      </main>
      
       <BottomNav />
    </div>
  );
}

// Wrapper component for Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-[100svh] w-full items-center justify-center bg-background text-foreground">
        Loading Login Page...
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
