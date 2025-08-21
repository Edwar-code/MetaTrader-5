'use client';

import { useEffect } from 'react';
import type { Position } from '@/lib/types';

interface TradeNotificationProps {
  tradeDetails: {
    pair: string;
    type: 'BUY' | 'SELL';
    size: number;
  } | null;
  onClose: () => void;
}

const TradeNotification = ({ tradeDetails, onClose }: TradeNotificationProps) => {
  useEffect(() => {
    if (tradeDetails) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [tradeDetails, onClose]);

  if (!tradeDetails) {
    return null;
  }

  const { pair, type, size } = tradeDetails;
  const displayAsset = pair === 'frxXAUUSD' ? 'XAUUSD' : pair;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-auto flex items-center animate-slide-in-bottom z-50">
      <div className="w-1 h-8 bg-blue-500 mr-3"></div>
      <div className="flex items-center space-x-3 text-sm">
        <span className="font-normal text-gray-800">{displayAsset}</span>
        <span className={`font-normal ${type === 'SELL' ? 'text-red-500' : 'text-blue-500'}`}>
          {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
        </span>
        <span className="font-normal text-gray-800">{size.toFixed(2)}</span>
        <span className="font-normal text-blue-500">done</span>
      </div>
    </div>
  );
};

export default TradeNotification;
