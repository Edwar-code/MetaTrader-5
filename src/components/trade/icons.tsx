
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

export const MessagesIcon = () => (
    <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2010.54.57_5a87660a.jpg" alt="Messages Icon" width={22} height={22} className="object-contain" />
);

export const HistoryIcon = () => (
    <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2010.54.56_253ecbbb.jpg" alt="History Icon" width={22} height={22} className="object-contain" />
);

export const NewCustomIcon = () => (
    <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-21%20at%2012.08.30_b5f774fc.jpg" alt="New Custom Icon" width={24} height={24} className="object-contain" />
);

export const SortIcon = () => (
    <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/updown.jpg" alt="Sort Icon" width={24} height={24} className="object-contain" />
);

export const AddOrderIcon = () => (
    <Image src="https://on98bvtkqbnonyxs.public.blob.vercel-storage.com/fileplus.jpg" alt="Add Order Icon" width={24} height={22} className="object-contain" />
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
