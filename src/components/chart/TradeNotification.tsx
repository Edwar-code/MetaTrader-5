'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface TradeNotificationProps {
  tradeDetails: {
    id: string;
    pair: string;
    type: 'BUY' | 'SELL';
    size: number;
  } | null;
  // This prop is now stable thanks to useCallback in the parent
  onClose: (id: string) => void;
}

const TradeNotification = ({ tradeDetails, onClose }: TradeNotificationProps) => {
  const [isLoading, setIsLoading] = useState(true);

  // This hook runs ONLY ONCE when a new notification is created.
  // Because 'tradeDetails' and 'onClose' are now stable, this effect will
  // not be re-triggered, allowing the timers to run their full course.
  useEffect(() => {
    if (tradeDetails) {
      // Timer to switch from "loading" to "done" after 2 seconds
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      // Timer to remove the entire notification after 5 seconds total
      const closeTimer = setTimeout(() => {
        onClose(tradeDetails.id);
      }, 5000);

      // Cleanup function: If a component were to be removed early for any reason,
      // this prevents memory leaks by clearing the timers.
      return () => {
        clearTimeout(loadingTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [tradeDetails, onClose]);

  if (!tradeDetails) {
    return null;
  }

  const { pair, type, size } = tradeDetails;
  const displayAsset = pair === 'frxXAUUSD' ? 'XAUUSD' : pair;

  return (
    <div 
      className="flex items-center bg-white shadow-lg animate-slide-in-bottom"
      style={{ width: '210px', marginBottom: '5px' }}
    >
      <div className="w-1 h-8 bg-blue-500 mr-3"></div>
      <div className="flex items-center text-[12.5px] pr-4 w-full">
        <span className="font-normal text-gray-800 mr-3">{displayAsset}</span>
        <span className={`font-normal mr-3 ${type === 'SELL' ? 'text-red-500' : 'text-blue-500'}`}>
          {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
        </span>
        <span className="font-normal text-gray-800 mr-3">{size.toFixed(2)}</span>
        <div className="flex-1 text-right">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500 inline-block" />
          ) : (
            <span className="font-normal text-blue-500">done</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeNotification;
