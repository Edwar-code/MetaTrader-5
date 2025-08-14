'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  ArrowLeft,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDerivState } from '@/context/DerivContext';
import Link from 'next/link';

export default function SettingsPage() {
  const { toast } = useToast();
  const { isAuthenticated } = useDerivState();
  const [authUrl, setAuthUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const APP_ID = 96239;

    if (typeof window !== 'undefined') {
      const redirectUri = new URL('/auth/callback', window.location.origin).href;
      const encodedRedirectUri = encodeURIComponent(redirectUri);
      setAuthUrl(
        `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&redirect_uri=${encodedRedirectUri}&l=EN&scopes=read,trade`
      );
    }
    setIsLoading(false);
  }, []);

  const handleDisconnect = () => {
    localStorage.removeItem('deriv_api_token');
    localStorage.removeItem('deriv_account_id');
    localStorage.removeItem('deriv_accounts');
    toast({
      title: 'Disconnected',
      description: 'Your Deriv account has been disconnected.',
    });
    window.location.reload();
  };

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-background shadow-lg overflow-hidden">
      <header className="p-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/chart" passHref>
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>
      <div className="p-4 space-y-6 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Deriv Connection</CardTitle>
            <CardDescription>
              {isAuthenticated
                ? 'You are securely connected to Deriv.'
                : 'Link your Deriv account to start trading.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <div>
                <div className="flex items-center p-4 bg-green-500/10 border border-green-500/20 rounded-md mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <p className="text-sm text-green-400">
                    Status: <span className="font-semibold">Connected</span>
                  </p>
                </div>
                <Button onClick={handleDisconnect} variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" /> Disconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-red-500/10 border border-red-500/20 rounded-md mb-4">
                  <XCircle className="h-5 w-5 text-red-500 mr-3" />
                  <p className="text-sm text-red-400">
                    Status: <span className="font-semibold">Disconnected</span>
                  </p>
                </div>
                <Button asChild disabled={!authUrl || isLoading}>
                  <a href={authUrl} target="_top">
                    <LinkIcon className="mr-2 h-4 w-4" /> Connect with Deriv
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
