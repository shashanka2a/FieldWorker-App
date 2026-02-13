"use client";

import { useState, useEffect } from 'react';
import { Home, Clock, MoreHorizontal } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from './ui/spinner';

interface BottomNavProps {
  activeTab: string;
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const handleNav = (path: string) => {
    if (pathname === path) return;
    setNavigatingTo(path);
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-[#3A3A3C] pb-safe" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around h-16">
        <button
          onClick={() => handleNav('/')}
          disabled={!!navigatingTo}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6633] disabled:opacity-70 ${
            activeTab === 'home' ? 'text-[#0A84FF]' : 'text-[#98989D]'
          }`}
          aria-label="Home"
          aria-current={activeTab === 'home' ? 'page' : undefined}
        >
          {navigatingTo === '/' ? (
            <Spinner size="sm" className="border-current border-t-transparent" />
          ) : (
            <Home className="w-6 h-6" aria-hidden="true" />
          )}
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={() => handleNav('/activity')}
          disabled={!!navigatingTo}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6633] disabled:opacity-70 ${
            activeTab === 'activity' ? 'text-[#0A84FF]' : 'text-[#98989D]'
          }`}
          aria-label="Activity"
          aria-current={activeTab === 'activity' ? 'page' : undefined}
        >
          {navigatingTo === '/activity' ? (
            <Spinner size="sm" className="border-current border-t-transparent" />
          ) : (
            <Clock className="w-6 h-6" aria-hidden="true" />
          )}
          <span className="text-xs font-medium">Activity</span>
        </button>

        <button
          onClick={() => handleNav('/more')}
          disabled={!!navigatingTo}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6633] disabled:opacity-70 ${
            activeTab === 'more' ? 'text-[#0A84FF]' : 'text-[#98989D]'
          }`}
          aria-label="More"
          aria-current={activeTab === 'more' ? 'page' : undefined}
        >
          {navigatingTo === '/more' ? (
            <Spinner size="sm" className="border-current border-t-transparent" />
          ) : (
            <MoreHorizontal className="w-6 h-6" aria-hidden="true" />
          )}
          <span className="text-xs font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}