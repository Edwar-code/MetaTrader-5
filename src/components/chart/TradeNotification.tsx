
'use client';

import { useEffect } from 'react';

interface TradeNotificationProps {
  tradeDetails: {
    id: string;
    pair: string;
    type: 'BUY' | 'SELL';
    size: number;
  } | null;
  onClose: (id: string) => void;
}

const TradeNotification = ({ tradeDetails, onClose }: TradeNotificationProps) => {
  useEffect(() => {
    if (tradeDetails) {
      const timer = setTimeout(() => {
        onClose(tradeDetails.id);
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
    <div 
      className="flex items-center bg-white shadow-lg animate-slide-in-bottom"
      style={{ width: '210px', marginBottom: '5px' }}
    >
      <div className="w-1 h-8 bg-blue-500 mr-3"></div>
      <div className="flex items-center text-[12.5px] pr-4">
        <span className="font-normal text-gray-800 mr-3">{displayAsset}</span>
        <span className={`font-normal mr-3 ${type === 'SELL' ? 'text-red-500' : 'text-blue-500'}`}>
          {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
        </span>
        <span className="font-normal text-gray-800 mr-[30px]">{size.toFixed(2)}</span>
        <span className="font-normal text-blue-500">done</span>
      </div>
    </div>
  );
};

export default TradeNotification;

    