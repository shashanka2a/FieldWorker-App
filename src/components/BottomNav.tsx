"use client";

import { Home, Clock, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BottomNavProps {
  activeTab: string;
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-[#3A3A3C] pb-safe" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around h-16">
        <button
          onClick={() => router.push('/')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6633] ${
            activeTab === 'home' ? 'text-[#0A84FF]' : 'text-[#98989D]'
          }`}
          aria-label="Home"
          aria-current={activeTab === 'home' ? 'page' : undefined}
        >
          <Home className="w-6 h-6" aria-hidden="true" />
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={() => router.push('/activity')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6633] ${
            activeTab === 'activity' ? 'text-[#0A84FF]' : 'text-[#98989D]'
          }`}
          aria-label="Activity"
          aria-current={activeTab === 'activity' ? 'page' : undefined}
        >
          <Clock className="w-6 h-6" aria-hidden="true" />
          <span className="text-xs font-medium">Activity</span>
        </button>

        <button
          onClick={() => router.push('/more')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6633] ${
            activeTab === 'more' ? 'text-[#0A84FF]' : 'text-[#98989D]'
          }`}
          aria-label="More"
          aria-current={activeTab === 'more' ? 'page' : undefined}
        >
          <MoreHorizontal className="w-6 h-6" aria-hidden="true" />
          <span className="text-xs font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}