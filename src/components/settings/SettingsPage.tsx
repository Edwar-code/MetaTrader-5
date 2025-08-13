'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  AlertTriangle,
  BadgeHelp,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDerivState, VerificationStatus } from '@/context/DerivContext';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const StatusIndicator = ({ status }: { status: VerificationStatus | null }) => {
  if (status === null) {
    return (
      <div className="flex items-center p-4 bg-muted/50 border border-muted-foreground/20 rounded-md mb-4 animate-pulse">
        <Loader2 className="h-5 w-5 text-muted-foreground mr-3 animate-spin" />
        <p className="text-sm text-muted-foreground">Checking status...</p>
      </div>
    );
  }

  const statusConfig = {
    verified: {
      icon: <CheckCircle className="h-5 w-5 text-green-500 mr-3" />,
      text: 'Verified',
      description: 'Your proof of address has been successfully verified.',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400',
    },
    pending: {
      icon: <Loader2 className="h-5 w-5 text-yellow-500 mr-3 animate-spin" />,
      text: 'Pending',
      description: 'Your document is currently under review.',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-400',
    },
    rejected: {
      icon: <AlertTriangle className="h-5 w-5 text-destructive mr-3" />,
      text: 'Rejected',
      description: 'Your document was not approved. Please check your email or Deriv account for details.',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      textColor: 'text-destructive',
    },
    expired: {
      icon: <AlertTriangle className="h-5 w-5 text-destructive mr-3" />,
      text: 'Expired',
      description: 'Your verification has expired. Please submit a new document.',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      textColor: 'text-destructive',
    },
    none: {
      icon: <BadgeHelp className="h-5 w-5 text-muted-foreground mr-3" />,
      text: 'Not Submitted',
      description: 'You have not submitted a proof of address document.',
      bgColor: 'bg-muted/50',
      borderColor: 'border-muted-foreground/20',
      textColor: 'text-muted-foreground',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-start p-4 ${config.bgColor} border ${config.borderColor} rounded-md mb-4`}>
      {config.icon}
      <div>
        <p className={`text-sm ${config.textColor}`}>
          Status: <span className="font-semibold">{config.text}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { proofOfAddressStatus, isAuthenticated } = useDerivState();
  const [authUrl, setAuthUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const APP_ID = 82243;

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

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Verification Status</CardTitle>
            <CardDescription>Your account's proof of address status.</CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <StatusIndicator status={proofOfAddressStatus} />
            ) : (
              <div className="flex items-center p-4 bg-muted/50 border border-muted-foreground/20 rounded-md">
                <XCircle className="h-5 w-5 text-muted-foreground mr-3" />
                <p className="text-sm text-muted-foreground">
                  Connect your account to see verification status.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Account Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
