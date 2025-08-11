'use client';

import { useState } from 'react';
import type { Position } from '@/lib/data';
import { getAnalysis } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Wand2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

interface AnalysisDrawerProps {
  children: React.ReactNode;
  positions: Position[];
}

export function AnalysisDrawer({ children, positions }: AnalysisDrawerProps) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis('');
    try {
      const result = await getAnalysis(positions);
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error);
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (e) {
      const errorMessage = 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>AI Position Analysis</SheetTitle>
          <SheetDescription>
            Get an AI-powered analysis of your current positions, potential actions, and key risk factors.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Button onClick={handleAnalysis} disabled={isLoading} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? 'Analyzing...' : 'Analyze Positions'}
          </Button>
        </div>
        <ScrollArea className="h-[calc(100%-150px)] pr-4">
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {analysis && (
            <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap text-card-foreground">
              <p>{analysis}</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
