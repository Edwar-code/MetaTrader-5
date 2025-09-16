
'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

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
        <div className="flex items-center justify-between pl-2 pr-4 py-2">
          <div className="flex items-center gap-2">
            <Link href="/accounts" passHref>
              <Button variant="ghost" size="icon">
                <ArrowLeft />
              </Button>
            </Link>
            <h1 className="text-[15.5px] font-medium text-foreground">
              Sign in
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-background p-4">
        <Card className="w-full max-w-md mx-auto border-0 shadow-none bg-transparent">
          <CardHeader className="text-center p-2">
            <div className="flex justify-center mb-4">
              <Image
                src={fbsLogoSrc}
                alt="FBS Logo"
                width={40}
                height={40}
                className="shrink-0"
              />
            </div>
            <CardTitle className="text-lg font-semibold">
              FBS Markets Inc.
            </CardTitle>
            <CardDescription className="text-sm">
              Enter your password to sign in to account 40776538
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-2">
            <div className="space-y-2">
              <Label htmlFor="account-number">Account number</Label>
              <Input
                id="account-number"
                defaultValue="40776538"
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch space-y-4 px-2">
            <Button className="w-full" onClick={() => {
              // In a real app, you would handle login logic here.
              // For now, let's just go to the chart page on success.
              if (typeof window !== 'undefined') {
                 window.location.href = '/chart';
              }
            }}>
              Sign In
            </Button>
            <Button variant="link" className="text-primary p-0 h-auto">
              Forgot password?
            </Button>
          </CardFooter>
        </Card>
      </main>

      <footer className="p-4 border-t bg-card">
        <Button variant="outline" className="w-full">
          Create account
        </Button>
      </footer>
    </div>
  );
}
