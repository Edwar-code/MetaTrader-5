
import Image from "next/image";

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

export const MessagesIcon = ({ theme }: { theme?: string }) => {
    const src = theme === 'dark'
        ? "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.20.44_6e0f932e.jpg"
        : "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2010.54.57_5a87660a.jpg";
    return <Image src={src} alt="Messages Icon" width={22} height={22} className="object-contain" />;
};

export const HistoryIcon = ({ theme }: { theme?: string }) => {
    const src = theme === 'dark'
        ? "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.20.08_cb33e6bf.jpg"
        : "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2010.54.56_253ecbbb.jpg";
    return <Image src={src} alt="History Icon" width={22} height={22} className="object-contain" />;
};

export const NewCustomIcon = ({ theme }: { theme?: string }) => {
    const src = theme === 'dark'
        ? "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.22.25_a60a1f40.jpg"
        : "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2012.08.30_b5f774fc.jpg";
    return <Image src={src} alt="New Custom Icon" width={24} height={24} className="object-contain" />;
};

export const SortIcon = ({ theme }: { theme?: string }) => {
    const src = theme === 'dark'
        ? "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.22.53_7f99abb8.jpg"
        : "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/updown.jpg";
    return <Image src={src} alt="Sort Icon" width={24} height={24} className="object-contain" />;
};

export const AddOrderIcon = ({ theme }: { theme?: string }) => {
    const src = theme === 'dark'
        ? "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2010.23.24_065d63f3.jpg"
        : "https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/fileplus.jpg";
    return <Image src={src} alt="Add Order Icon" width={24} height={22} className="object-contain" />;
};

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

export const TradeTitleIcon = ({ theme }: { theme?: string }) => {
    const src = theme === 'dark'
        ? 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-27%20at%2011.25.31_a6fa3b60.jpg'
        : 'https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2012.22.17_f0a77256.jpg';

    return <Image src={src} alt="Trade Title" width={35} height={8.5} className="object-contain" />;
};
