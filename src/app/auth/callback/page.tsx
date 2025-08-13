'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Combine hash and search parameters, as Deriv can use either.
    const params = new URLSearchParams(window.location.search || window.location.hash.substring(1));

    const accounts = [];
    let i = 1;
    while (params.has(`acct${i}`) && params.has(`token${i}`)) {
        accounts.push({
            id: params.get(`acct${i}`),
            token: params.get(`token${i}`),
            currency: params.get(`cur${i}`),
        });
        i++;
    }

    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (accounts.length > 0) {
        if (accounts.length === 1) {
            const account = accounts[0];
            localStorage.setItem('deriv_api_token', account.token!);
            localStorage.setItem('deriv_account_id', account.id!);
            localStorage.setItem('deriv_accounts', JSON.stringify(accounts));
            toast({
                title: "Connection Successful!",
                description: `Your Deriv account ${account.id} has been securely linked.`,
            });
            router.push('/chart');
        } else {
            localStorage.setItem('deriv_accounts', JSON.stringify(accounts));
            router.push('/auth/select-account');
        }
    } else {
      toast({
        title: "Connection Failed",
        description: `Could not connect to Deriv. Reason: ${errorDescription || error || 'No accounts found in the redirect.'}`,
        variant: "destructive",
      });
      router.push('/settings');
    }
  }, [router, toast]);

  return (
    <main className="flex items-center justify-center min-h-screen">
       <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
           <CardTitle className="text-2xl font-headline text-center">Finalizing Connection</CardTitle>
          <CardDescription className="text-center">
            Please wait while we process your account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    </main>
  );
}
