import React from 'react';
import { Settings, QrCode, Bell, Info } from 'lucide-react';
import Image from 'next/image';

export const AccountSettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.1667 3.33331H4.83333C3.82081 3.33331 3 4.15412 3 5.16665V18.8333C3 19.8458 3.82081 20.6666 4.83333 20.6666H19.1667C20.1792 20.6666 21 19.8458 21 18.8333V5.16665C21 4.15412 20.1792 3.33331 19.1667 3.33331Z" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.5 14.5L12 12M12 12L9.5 9.5M12 12L9.5 14.5M12 12L14.5 9.5" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.25 12C13.25 12.6904 12.6904 13.25 12 13.25C11.3096 13.25 10.75 12.6904 10.75 12C10.75 11.3096 11.3096 10.75 12 10.75C12.6904 10.75 13.25 11.3096 13.25 12Z" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.4444 7.55556V7.56444" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


export const QrCodeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H8V8H4V4Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 16H8V20H4V16Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 4H20V8H16V4Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 16H20V20H16V16Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 4H14V8H10V4Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 16H14V20H10V16Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 10H8V14H4V10Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 10H20V14H16V10Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 10H14V14H10V10Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const BellIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 22.0001 12 22C11.6496 22.0001 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const InfoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="16" x2="12" y2="12" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="8" x2="12.01" y2="8" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const FbsLogo = ({ size = 40 }: { size?: number }) => (
    <div
      className="bg-green-600 flex items-center justify-center rounded-md shrink-0"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <span className="text-white font-bold text-sm">FBS</span>
    </div>
);

export const MatchSecuritiesLogo = () => (
    <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/match-securities-logo.png" alt="Match Securities" width={40} height={40} />
);
