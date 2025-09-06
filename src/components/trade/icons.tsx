
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { useTheme } from 'next-themes';

const ThemedIcon = ({ darkSrc, lightSrc, alt, width, height }: { darkSrc: string, lightSrc: string, alt: string, width: number, height: number }) => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Render a placeholder or the light theme version by default to avoid mismatch
        return <Image src={lightSrc} alt={alt} width={width} height={height} className="object-contain" />;
    }

    const src = resolvedTheme === 'dark' ? darkSrc : lightSrc;
    return <Image src={src} alt={alt} width={width} height={height} className="object-contain" />;
};


export const TradeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.66602 16.333L9.33268 11.6663L13.9993 16.333L23.3327 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="4.66602" cy="16.333" r="2.33333" fill="currentColor"/>
    <circle cx="9.33268" cy="11.666" r="2.33333" fill="currentColor"/>
    <circle cx="13.9993" cy="16.333" r="2.33333" fill="currentColor"/>
    <circle cx="23.3327" cy="2" r="2.33333" transform="translate(0 5)" fill="currentColor"/>
  </svg>
);

export const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 17V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="7" y="7" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="2"/>
    <path d="M17 8V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 14V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="15" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const MessagesIcon = () => (
    <ThemedIcon 
        darkSrc="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.20.44_6e0f932e.jpg"
        lightSrc="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2010.54.57_5a87660a.jpg"
        alt="Messages Icon"
        width={22}
        height={22}
    />
);

export const HistoryIcon = ({ isActive }: { isActive?: boolean }) => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2010.54.56_253ecbbb.jpg" alt="History Icon" width={22} height={22} className="object-contain" />;
    }

    const isDark = resolvedTheme === 'dark';
    let src = "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2010.54.56_253ecbbb.jpg"; // light default

    if (isDark) {
        src = isActive 
            ? "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-09-06%20at%2015.15.59_64271977.jpg" 
            : "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.20.08_cb33e6bf.jpg";
    }

    return <Image src={src} alt="History Icon" width={22} height={22} className="object-contain" />;
};


export const NewCustomIcon = () => (
    <ThemedIcon
        darkSrc="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.22.25_a60a1f40.jpg"
        lightSrc="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2012.08.30_b5f774fc.jpg"
        alt="New Custom Icon"
        width={24}
        height={24}
    />
);

export const SortIcon = () => (
    <ThemedIcon
        darkSrc="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.22.53_7f99abb8.jpg"
        lightSrc="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/updown.jpg"
        alt="Sort Icon"
        width={24}
        height={24}
    />
);

export const AddOrderIcon = () => (
    <ThemedIcon
        darkSrc="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.23.24_065d63f3.jpg"
        lightSrc="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/fileplus.jpg"
        alt="Add Order Icon"
        width={24}
        height={22}
    />
);

export const SpacedMoreHorizontalIcon = () => (
  <svg
    width="42"
    height="42"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="4" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="20" cy="12" r="1" />
  </svg>
);

export const TradeTitleIcon = () => (
    <ThemedIcon
        darkSrc='https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.25.31_a6fa3b60.jpg'
        lightSrc='https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2012.22.17_f0a77256.jpg'
        alt="Trade Title"
        width={35}
        height={8.5}
    />
);

export const BtcIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
      <path d="M16.5 7.5h2.5V15H15v2H9v-2H7.5A2.5 2.5 0 0 1 5 12.5V10a2.5 2.5 0 0 1 2.5-2.5H9V5h6v2.5zM9 15v-5" />
      <path d="M15 12.5a2.5 2.5 0 0 0 0-5H9" />
    </svg>
);
