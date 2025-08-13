'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [token, setToken] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem('deriv_api_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleSave = () => {
    if (token) {
      localStorage.setItem('deriv_api_token', token);
      toast({
        title: 'Token Saved',
        description: 'Your Deriv API token has been saved. The app will now try to connect.',
      });
      // Optional: force a reload to re-initialize the context
      window.location.href = '/chart';
    } else {
      toast({
        title: 'Error',
        description: 'Please enter a token.',
        variant: 'destructive',
      });
    }
  };
  
  const handleClear = () => {
    localStorage.removeItem('deriv_api_token');
    setToken('');
    toast({
        title: 'Token Cleared',
        description: 'Your Deriv API token has been removed.',
    });
    window.location.href = '/chart';
  }

  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
        <header className="p-4 border-b">
            <div className="flex items-center gap-4">
                 <Link href="/chart" passHref>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Settings</h1>
            </div>
        </header>
        <div className="p-4">
            <Card>
                <CardHeader>
                <CardTitle>Deriv API Token</CardTitle>
                <CardDescription>
                    Enter your Deriv API token to connect your account. You can create a token in your Deriv account settings under &quot;API token&quot;.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="token">API Token</Label>
                    <Input
                    id="token"
                    type="password"
                    placeholder="Enter your token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSave}>Save Token</Button>
                    <Button variant="destructive" onClick={handleClear}>Clear Token</Button>
                </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
