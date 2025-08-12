'use client';

import { useState } from 'react';
import BottomNav from './BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle } from 'lucide-react';

export default function TradingPage() {
  return (
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="h-full w-full p-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Trading Unavailable</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 w-full relative">
              <div className="flex items-center justify-center h-full text-destructive flex-col gap-2 p-4 text-center">
                <AlertTriangle className="h-8 w-8" />
                <p className="font-semibold">Trading Functionality Offline</p>
                <p className="text-sm text-muted-foreground">
                  The connection to the trading service is currently unavailable. Please try again later.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
