'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Info } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface DerivAccount {
    id: string;
    token: string;
    currency: string;
}

export default function SelectAccountPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<DerivAccount[]>([]);

    useEffect(() => {
        const storedAccounts = localStorage.getItem('deriv_accounts');
        if (storedAccounts) {
            try {
                const parsedAccounts = JSON.parse(storedAccounts);
                // Filter out any potentially empty/malformed entries
                const validAccounts = parsedAccounts.filter((acc: any) => acc.id && acc.token);
                if (validAccounts.length > 0) {
                    setAccounts(validAccounts);
                } else {
                   // No valid accounts found, redirect back
                    toast({
                        title: "No valid accounts found",
                        description: "Please try connecting again.",
                        variant: "destructive",
                    });
                    router.push('/settings');
                }
            } catch (error) {
                toast({
                    title: "Error loading accounts",
                    description: "There was a problem processing your account list. Please try again.",
                    variant: "destructive",
                });
                router.push('/settings');
            }
        } else {
            // No accounts in local storage, maybe user landed here directly.
            toast({
                title: "No accounts to select",
                description: "Please connect your Deriv account first.",
                variant: "destructive",
            });
            router.push('/settings');
        }
    }, [router, toast]);

    const handleSelectAccount = (account: DerivAccount) => {
        localStorage.setItem('deriv_api_token', account.token);
        localStorage.setItem('deriv_account_id', account.id);

        toast({
            title: "Account Selected!",
            description: `You are now using account ${account.id}.`,
        });
        router.push('/chart');
    };

    const getAccountType = (accountId: string): 'Demo' | 'Real' | 'Unknown' => {
        if (accountId.startsWith('VRTC')) return 'Demo';
        if (accountId.startsWith('CR')) return 'Real';
        return 'Unknown';
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen py-12">
            <Card className="mx-auto max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <CardTitle className="text-2xl font-headline">Select Your Trading Account</CardTitle>
                    <CardDescription>
                        You have multiple Deriv accounts. Choose which one to use with the app.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {accounts.length > 0 ? (
                        accounts.map((account) => {
                            const accountType = getAccountType(account.id);
                            return (
                                <Button
                                    key={account.id}
                                    variant="outline"
                                    className="w-full justify-start h-auto py-3"
                                    onClick={() => handleSelectAccount(account)}
                                >
                                    <Wallet className="mr-4 h-6 w-6 text-primary" />
                                    <div className="text-left flex-1">
                                        <p className="font-semibold">{account.id}</p>
                                        <p className="text-sm text-muted-foreground">Currency: {account.currency}</p>
                                    </div>
                                    <Badge variant={accountType === 'Demo' ? 'secondary' : 'default'} className="ml-auto">
                                        {accountType}
                                    </Badge>
                                </Button>
                            );
                        })
                    ) : (
                         <p className="text-center text-muted-foreground">Loading accounts...</p>
                    )}
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Missing an account?</AlertTitle>
                        <AlertDescription>
                          Make sure you are logged into your desired account on the Deriv website, then reconnect from this app's settings.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </main>
    );
}
